import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
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

      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });

      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async processQuery(query: string) {
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

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Client Started!");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") {
          break;
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
    console.log("  node index.js <path_to_server_script>");
    console.log("  node index.js <path_to_server_script> <venv_path>");
    console.log("");
    console.log("Examples:");
    console.log("  node build/index.js ../mcp-python/server/test_server.py");
    console.log(
      "  node build/index.js ../mcp-python/server/test_server.py ../mcp-python/.venv"
    );
    return;
  }

  const serverPath = process.argv[2];
  const venvPath = process.argv[3]; // Optional virtual environment path

  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(serverPath, venvPath);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main().catch(console.error);
