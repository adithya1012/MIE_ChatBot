export const toolUseNames = [
  "thinking",
  "mars_rover_image",
  "general_qeury",
  "attempt_completion",
] as const;

export type ToolUseName = (typeof toolUseNames)[number];

export type ToolUse = {
  type: "tool_use";
  name: ToolUseName;
};
