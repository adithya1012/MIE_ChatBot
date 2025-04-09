import gemini_response from "./llm_api/gemini";
import { parseAssistanceMessage } from "./parser/parseAssistantMessage";
import { mars_api } from "./tool_api/marsRoverImgAPI";
import { promptGenerator } from "./prompts/system";

export class MIEChat {
  message: any[] = [];
  apiConverzationHistory: any[] = [];
  assistantMessageContent: any[] = [];
  responseCallback?: (res: any) => void;
  LLmLoopStuckCount: number = 0;
  userMessageContent: any[] = [];
  integrations: string[] = [];

  constructor(message: string, integrations: string[], responseCallBack: any) {
    this.responseCallback = responseCallBack;
    this.integrations = integrations.map((name) => name);
    this.startTask(message);
  }

  // This function is called when the same chat is continued
  async hadleFolloup(message: string) {
    await this.initTaskLoop([
      {
        type: "text",
        text: `<task> ${message} </task>`,
      },
    ]);
  }

  private async startTask(task: string) {
    this.message = [];
    this.apiConverzationHistory = [];

    await this.initTaskLoop([
      {
        type: "text",
        text: `<task> ${task} </task>`,
      },
    ]);
  }

  private async initTaskLoop(userContent: any) {
    const didEndLoop = await this.recursivelyMakeLLMRequests(userContent);
  }

  async recursivelyMakeLLMRequests(userContent: any) {
    let recussiveCall = true;

    await this.addToApiConversationHistory({
      role: "user",
      content: userContent,
    });
    try {
      //   console.log(userContent.text);
      //   const respose = await gemini_response(userContent[0].text);
      const SYSTEM_PROMPT: string = promptGenerator(this.integrations);
      const respose = await gemini_response(
        this.apiConverzationHistory,
        SYSTEM_PROMPT
      );
      this.assistantMessageContent = parseAssistanceMessage(respose);
      for (let i = 0; i < this.assistantMessageContent.length; i++) {
        const block = this.assistantMessageContent[i];
        await this.processAssistantMessage(block);
        if (block.type === "tool_use") {
          if (block["name"] == "general_qeury") {
            recussiveCall = false;
          } else if (block["name"] == "mars_rover_image") {
            recussiveCall = true;
          } else if (block["name"] == "attempt_completion") {
            recussiveCall = false;
          }
        }
      }
      const didToolUse = this.assistantMessageContent.some(
        (respose) => respose.type === "tool_use"
      );
      if (!didToolUse) {
        this.LLmLoopStuckCount++;
        this.userMessageContent.push({
          type: "text",
          text: `[IMPORTANT] [ERROR] You did not use a tool in your previous response! You SHOULD use tool in the response.`,
        });
        this.recursivelyMakeLLMRequests(this.userMessageContent);
        recussiveCall = false;
      } else {
        // TODO: ELSE case to handle the error count.
      }

      if (respose) {
        await this.addToApiConversationHistory({
          role: "assistant",
          content: [{ type: "text", text: respose }],
        });
      }
      if (recussiveCall && this.LLmLoopStuckCount <= 10) {
        this.recursivelyMakeLLMRequests(this.userMessageContent);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addToApiConversationHistory(message: any) {
    this.apiConverzationHistory.push(message);
  }
  async processAssistantMessage(block: any) {
    if (!block) {
      return;
    }
    switch (block.type) {
      // TODO: Impliment the other cases is necessary
      case "tool_use": {
        switch (block.name) {
          case "general_qeury": {
            if (this.responseCallback) {
              this.responseCallback(
                JSON.stringify(block["params"]["response"])
              );
            }
          }
          case "mars_rover_image": {
            const response = await mars_api(block["params"]);
            // if (this.responseCallback) {
            //   this.responseCallback(JSON.stringify(response));
            // }
            this.userMessageContent.push({
              type: "text",
              text: `Response from Mars Rover API: ${response}`,
            });
          }
          case "attempt_completion": {
            if (this.responseCallback) {
              this.responseCallback(JSON.stringify(block["params"]["result"]));
            }
          }
        }
      }
    }
  }
}
