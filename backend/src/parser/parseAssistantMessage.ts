import {
  toolUseNames,
  ToolUse,
  ToolUseName,
  toolParmName,
  ToolParamName,
} from "./index";

export function parseAssistanceMessage(assistantMessage: string): string {
  let didStartToolUse = false;
  let accumulator = "";
  let currentTooluse: ToolUse | undefined = undefined;
  let currentToolUseStartIndex: number = 0;
  let contentBlocks: any[] = []; // TODO: we have to define an appropriate type for this.
  let currentParamName: ToolParamName | undefined = undefined;
  let currentParamValueStartIndex: number = 0;

  for (let i = 0; i < assistantMessage.length; i++) {
    accumulator += assistantMessage[i];

    if (currentTooluse && currentParamName) {
      const paramClosingtag = `</${currentParamName}>`;
      if (accumulator.endsWith(paramClosingtag)) {
        // completed the params values
        const currentParamVal = accumulator.slice(currentParamValueStartIndex);
        currentTooluse.params[currentParamName] = currentParamVal
          .slice(0, -paramClosingtag.length)
          .trim();
        currentParamName = undefined;
      }
      // No need to go further. Its the content of the parameter.
      continue;
    }

    if (!currentTooluse) {
      // No tool is being used.
      const possibleToolOpeningTag = toolUseNames.map((name) => `<${name}>`);
      let didStartToolUse = false;
      for (const toolUseOpeningTag of possibleToolOpeningTag) {
        if (accumulator.endsWith(toolUseOpeningTag)) {
          didStartToolUse = true;
          currentTooluse = {
            type: "tool_use",
            name: toolUseOpeningTag.slice(1, -1) as ToolUseName,
            params: {},
          };
          // console.log(currentTooluse);
          currentToolUseStartIndex = accumulator.length;
        }
      }
    } else {
      // a tool is being already in use
      let currentToolValue = accumulator.slice(currentToolUseStartIndex);
      let toolUseClosingTag = `</${currentTooluse.name}>`;
      if (accumulator.endsWith(toolUseClosingTag)) {
        // Tool is ended Headers.
        contentBlocks.push(currentTooluse);
        currentTooluse = undefined;
        continue;
      } else {
        // Check for parameters of the tool
        const possibleParmOpeningTag = toolParmName.map((name) => `<${name}>`);
        for (const paramOpeningTag of possibleParmOpeningTag) {
          if (accumulator.endsWith(paramOpeningTag)) {
            // Got as parameter starting of a tool
            currentParamName = paramOpeningTag.slice(1, -1) as ToolParamName;
            currentParamValueStartIndex = accumulator.length;
            break;
          }
        }
      }
    }
  }
  console.log(contentBlocks);
  return "";
}
