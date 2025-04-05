import gemini_response from "./llm_api/gemini";
import { parseAssistanceMessage } from "./parser/parseAssistantMessage";
import { mars_api } from "./tool_api/marsRoverImgAPI";

export class MIEChat {
  message: any[] = [];
  apiConverzationHistory: any[] = [];
  assistantMessageContent: any[] = [];
  responseCallback?: (res: any) => void;
  LLmLoopStuckCount: number = 0;
  userMessageContent: any[] = [];

  constructor(message: string, responseCallBack: any) {
    this.responseCallback = responseCallBack;
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
      // Hit API and get the response first.
      // TODO: Create a generic function attemptAPIRequest. which hit the rellevent API but API configurations should be stored in the Class.
      //   console.log(userContent.text);
      //   const respose = await gemini_response(userContent[0].text);
      const respose = await gemini_response(this.apiConverzationHistory);
      this.assistantMessageContent = parseAssistanceMessage(respose);
      for (let i = 0; i < this.assistantMessageContent.length; i++) {
        const block = this.assistantMessageContent[i];
        await this.processAssistantMessage(block);
        if (block.type === "tool_use") {
          if (block["name"] == "general_qeury") {
            // TODO: Need to handle the recursive call of the function
            recussiveCall = false;
          } else if (block["name"] == "mars_rover_image") {
            // Hit Mars Rover API to get the images.
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
