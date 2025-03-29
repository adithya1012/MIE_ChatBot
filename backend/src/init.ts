import { MIEChat } from ".";

// TODO: Need to handle the new request by creating the object. If not create the old objects and store it

export function TaskHandler(
  message: string,
  responseCallBack?: (res: any) => void
) {
  // Create a Switch case here for new task and existing tasks.
  initTask(message, responseCallBack);
}

function initTask(message: string, responseCallBack?: (res: any) => void) {
  let obj: any = new MIEChat(message, responseCallBack);
}
