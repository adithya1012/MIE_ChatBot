export const toolUseNames = [
  // "thinking", // We are ignoring the values in the thinking tag
  "mars_rover_image",
  "general_qeury",
  "attempt_completion",
  "earth_image",
] as const;

export type ToolUseName = (typeof toolUseNames)[number];

export type ToolUse = {
  type: "tool_use";
  name: ToolUseName;
  params: any; // TODO: this need to be defined for all the parameters properly.
};

export const toolParmName = [
  "sol",
  "camera",
  "earth_date",
  "response",
  "result",
  "type",
] as const;

export type ToolParamName = (typeof toolParmName)[number];
