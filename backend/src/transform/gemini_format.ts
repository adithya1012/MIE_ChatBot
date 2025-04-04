export function convertMessageToGemini(message: any): any {
  return {
    role: message.role === "assistant" ? "model" : "user",
    parts: convertContentToGemini(message.content),
  };
}

export function convertContentToGemini(content: any[]): any[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  return content.flatMap((block) => {
    switch (block.type) {
      case "text":
        return { text: block.text };
      case "tool_use":
        return {
          functionCall: {
            name: block.name,
            args: block.input,
          },
        };
      default:
        throw new Error(
          `Unsupported content block type: ${(block as any).type}`
        );
    }
  });
}
