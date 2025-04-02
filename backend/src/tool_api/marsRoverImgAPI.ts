import { FunctionCallingMode } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();
const NASA_API_KEY = process.env.NASA_API_KEY || "";
const base_api =
  "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?";

export async function mars_api(params: Record<string, string>): Promise<any> {
  try {
    // let param_url = Object.entries(params)
    //         .map(([key, value]) => `${key}=${value}`)
    //         .join("&");

    // param_url += `&api_key=${NASA_API_KEY}`;
    let param_url = "";
    for (let param in params) {
      param_url = param_url + param + "=" + params[param] + "&";
    }
    if (!param_url) {
      param_url = "sol=1000&";
    }
    param_url = param_url + "page=1&api_key=" + NASA_API_KEY;
    const api_url = base_api + param_url;

    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    // console.log(data);
    if (data["photos"].length == 0) {
      return "No images are found";
    }
    return data["photos"][0]["img_src"];
  } catch (Error) {
    console.error("Error While fetcuing Mars API:", Error);
    return null;
  }
}
