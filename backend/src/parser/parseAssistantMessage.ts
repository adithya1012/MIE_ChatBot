import { toolUseNames, ToolUse, ToolUseName } from "./index";

export function parseAssistanceMessage(assistantMessage: string): string {
  let didStartToolUse = false;
  let accumulator = "";
  let currentTooluse: ToolUse | undefined = undefined;

  for (let i = 0; i < assistantMessage.length; i++) {
    accumulator += assistantMessage[i];

    const possibleToolOpeningTag = toolUseNames.map((name) => `<${name}>`);
    // console.log(possibleToolOpeningTag);
    let didStartToolUse = false;

    for (const toolUseOpeningTag of possibleToolOpeningTag) {
      //   console.log(accumulator);
      //   console.log(toolUseOpeningTag);
      if (accumulator.endsWith(toolUseOpeningTag)) {
        // console.log("Tool Used:", toolUseOpeningTag);
        didStartToolUse = true;
        currentTooluse = {
          type: "tool_use",
          name: toolUseOpeningTag.slice(1, -1) as ToolUseName,
        };
        console.log(currentTooluse);
        // currentToolUseStartIndex = accumulator.length;
      }
    }
  }

  return "";
}
