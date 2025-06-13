import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Provider type
type Provider = "claude" | "openai";

class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];
  private openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  private provider: Provider;

  constructor(provider: Provider = "openai") {
    this.provider = provider;

    if (provider === "claude") {
      if (!ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is not set");
      }
      this.anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });
    } else if (provider === "openai") {
      if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }

    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string, venvPath?: string) {
    try {
      console.log(`Attempting to connect to server: ${serverScriptPath}`);

      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");

      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }

      let command: string;
      let args: string[];

      if (isPy) {
        if (venvPath) {
          // Use the Python executable from the virtual environment
          const pythonExecutable =
            process.platform === "win32"
              ? path.join(venvPath, "Scripts", "python.exe")
              : path.join(venvPath, "bin", "python");
          command = pythonExecutable;
          args = [serverScriptPath];
          console.log(`Using venv Python: ${command}`);
        } else {
          // Use system Python
          command = process.platform === "win32" ? "python" : "python3";
          args = [serverScriptPath];
        }
      } else {
        command = process.execPath;
        args = [serverScriptPath];
      }

      console.log(`Executing: ${command} ${args.join(" ")}`);

      this.transport = new StdioClientTransport({
        command,
        args,
      });

      console.log("Transport created, attempting to connect...");
      await this.mcp.connect(this.transport);
      console.log("Connected to MCP server!");

      const toolsResult = await this.mcp.listTools();
      console.log("Raw tools result:", toolsResult);

      // Format tools for Claude
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });

      // Format tools for OpenAI
      this.openaiTools = toolsResult.tools.map((tool) => {
        return {
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        };
      });

      console.log(
        `Connected to server with tools (${this.provider}):`,
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async processQueryClaude(query: string) {
    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized");
    }

    const messages: MessageParam[] = [
      {
        role: "user",
        content: query,
      },
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    });

    const finalText = [];
    const toolResults = [];

    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        console.log(`Calling tool: ${toolName} with args:`, toolArgs);

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        toolResults.push(result);
        finalText.push(`[Tool ${toolName} executed successfully]`);

        // Create follow-up message with tool result
        messages.push(
          {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: content.id,
                name: toolName,
                input: toolArgs,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: content.id,
                content: JSON.stringify(result.content),
              },
            ],
          }
        );

        const followUpResponse = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages,
          tools: this.tools,
        });

        // Add the follow-up response
        for (const followUpContent of followUpResponse.content) {
          if (followUpContent.type === "text") {
            finalText.push(followUpContent.text);
          }
        }
      }
    }

    return finalText.join("\n");
  }

  async processQueryOpenAI(query: string) {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: query,
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      max_tokens: 1000,
      messages,
      tools: this.openaiTools,
      tool_choice: "auto",
    });

    const finalText = [];
    const message = response.choices[0]?.message;

    if (!message) {
      throw new Error("No response from OpenAI");
    }

    // Add assistant's text response
    if (message.content) {
      finalText.push(message.content);
    }

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Add assistant message to conversation
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Calling tool: ${toolName} with args:`, toolArgs);

        try {
          const result = await this.mcp.callTool({
            name: toolName,
            arguments: toolArgs,
          });

          console.log(`Tool ${toolName} result:`, result);

          // Add tool result to messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result.content),
          });

          finalText.push(`[Tool ${toolName} executed successfully]`);
        } catch (error) {
          console.error(`Error calling tool ${toolName}:`, error);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: ${error}`,
          });
          finalText.push(`[Tool ${toolName} failed: ${error}]`);
        }
      }

      // Get final response after tool execution
      const followUpResponse = await this.openai.chat.completions.create({
        // model: "gpt-4-turbo-preview",
        model: "gpt-4.1-nano",
        max_tokens: 1000,
        messages,
        tools: this.openaiTools,
        tool_choice: "auto",
      });

      const followUpMessage = followUpResponse.choices[0]?.message;
      if (followUpMessage?.content) {
        finalText.push(followUpMessage.content);
      }
    }

    return finalText.join("\n");
  }

  async processQuery(query: string) {
    if (this.provider === "claude") {
      return this.processQueryClaude(query);
    } else {
      return this.processQueryOpenAI(query);
    }
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log(`\nMCP Client Started with ${this.provider.toUpperCase()}!`);
      console.log(
        "Type your queries, 'switch' to change provider, or 'quit' to exit."
      );

      while (true) {
        const message = await rl.question(
          `\n[${this.provider.toUpperCase()}] Query: `
        );

        if (message.toLowerCase() === "quit") {
          break;
        }

        if (message.toLowerCase() === "switch") {
          const newProvider = this.provider === "claude" ? "openai" : "claude";
          try {
            const newClient = new MCPClient(newProvider);
            // Copy the current connection
            newClient.transport = this.transport;
            newClient.mcp = this.mcp;
            newClient.tools = this.tools;
            newClient.openaiTools = this.openaiTools;

            // Update current instance
            this.provider = newProvider;
            this.anthropic = newClient.anthropic;
            this.openai = newClient.openai;

            console.log(`Switched to ${newProvider.toUpperCase()}`);
            continue;
          } catch (error) {
            console.error(`Failed to switch to ${newProvider}:`, error);
            continue;
          }
        }

        try {
          const response = await this.processQuery(message);
          console.log("\n" + response);
        } catch (error) {
          console.error("Error processing query:", error);
        }
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    if (this.transport) {
      await this.mcp.close();
    }
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage:");
    console.log(
      "  node index.js <path_to_server_script> [venv_path] [provider]"
    );
    console.log("");
    console.log("Parameters:");
    console.log("  path_to_server_script: Path to the MCP server script");
    console.log("  venv_path: Optional virtual environment path");
    console.log("  provider: 'claude' or 'openai' (default: claude)");
    console.log("");
    console.log("Examples:");
    console.log("  node build/index.js ../mcp-python/server/test_server.py");
    console.log(
      "  node build/index.js ../mcp-python/server/test_server.py ../mcp-python/.venv"
    );
    console.log(
      "  node build/index.js ../mcp-python/server/test_server.py ../mcp-python/.venv openai"
    );
    console.log(
      '  node build/index.js ../mcp-python/server/test_server.py "" claude'
    );
    return;
  }

  const serverPath = process.argv[2];
  const venvPath =
    process.argv[3] && process.argv[3] !== "" ? process.argv[3] : undefined;
  const provider = (process.argv[4] as Provider) || "openai";
  console.log("PROVIDER: ", provider);
  if (provider !== "claude" && provider !== "openai") {
    console.error("Provider must be 'claude' or 'openai'");
    return;
  }

  const mcpClient = new MCPClient(provider);
  try {
    await mcpClient.connectToServer(serverPath, venvPath);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main().catch(console.error);
