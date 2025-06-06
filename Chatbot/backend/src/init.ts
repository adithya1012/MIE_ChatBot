import { MIEChat } from "./index";

export class Initializer {
  activeTask: MIEChat | null = null;
  TaskHandler(data: any, responseCallBack?: (res: any) => void) {
    // Create a Switch case here for new task and existing tasks.
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      console.error("Error While Parsing the message", data);
      return;
    }
    const { message, newTask, integrations } = parsed;
    // TODO: This integation array should be passed from UI
    // const integrations = ["MarsRoverAPI"];
    // const integrations = [""];
    switch (newTask) {
      case true: {
        this.initTask(message, integrations, responseCallBack);
        break;
      }
      case false: {
        if (this.activeTask) {
          this.activeTask.hadleFolloup(message);
        } else {
          console.error("No active task to handle follow-up.");
        }
        break;
      }
    }
  }

  initTask(
    message: string,
    integrations: string[],
    responseCallBack?: (res: any) => void
  ) {
    this.activeTask = new MIEChat(message, integrations, responseCallBack);
  }
}
