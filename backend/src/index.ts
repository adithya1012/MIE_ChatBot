import gemini_response from "./llm_api/gemini";
import { parseAssistanceMessage } from "./parser/parseAssistantMessage";

export class MIEChat {
  message: any[] = [];
  apiConverzationHistory: any[] = [];
  assistantMessageContent: any[] = [];
  responseCallback?: (res: any) => void;

  constructor(message: string, responseCallBack: any) {
    this.responseCallback = responseCallBack;
    this.startTask(message);
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
    const didEndLoop = await this.recursivelyMakeClaudeRequests(userContent);
  }

  async recursivelyMakeClaudeRequests(userContent: any) {
    await this.addToApiConversationHistory({
      role: "user",
      content: userContent,
    });
    try {
      // Hit API and get the response first.
      // TODO: Create a generic function attemptAPIRequest. which hit the rellevent API but API configurations should be stored in the Class.
      console.log(userContent.text);
      const respose = await gemini_response(userContent[0].text);
      this.assistantMessageContent = parseAssistanceMessage(respose);
      if (this.responseCallback) {
        this.responseCallback(JSON.stringify(this.assistantMessageContent));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addToApiConversationHistory(message: any) {
    this.apiConverzationHistory.push(message);
  }
}
