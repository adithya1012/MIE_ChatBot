import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../prompts/system";
import * as dotenv from "dotenv";

dotenv.config();
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

async function gemini_response(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  return result.response.text();
}

export default gemini_response;
