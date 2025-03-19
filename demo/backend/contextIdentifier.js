const context_prompt = require("./prompts/context");
// let question = "Who are you?"; //1
// let question = "What is the capital of France?"; //1
// let question = "Is there water on Mars?"; //2
// let question = "Which is the nearest planet to earth"; //1
let question = "What is the distance between Earth and Mars?"; //2
let userPrompt = context_prompt + question;

async function contexFind(userPrompt) {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        prompt: userPrompt,
        stream: false,
      }),
    });

    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    console.log("Response: ", responseJson["response"]);
  } catch (error) {
    console.error("Error: ", error);
  }
}

contexFind(userPrompt);
