import { GoogleGenerativeAI } from "@google/generative-ai";
// import { SYSTEM_PROMPT } from "../prompts/system";
// import * as dotenv from "dotenv";
const dotenv = require("dotenv");
import { convertMessageToGemini } from "../transform/gemini_format";

dotenv.config();
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

async function gemini_response(
  messages: any[],
  SYSTEM_PROMPT: string
): Promise<string> {
  // const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  // const model = genAI.getGenerativeModel({
  //   model: "gemini-2.0-flash",
  //   systemInstruction: SYSTEM_PROMPT,
  // });
  // const result = await model.generateContent(prompt);
  // console.log(result.response.text());
  // return result.response.text();
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent({
    contents: messages.map(convertMessageToGemini),
    generationConfig: {
      // maxOutputTokens: this.getModel().info.maxTokens,
      temperature: 0,
    },
  });
  return result.response.text();
}

export default gemini_response;
