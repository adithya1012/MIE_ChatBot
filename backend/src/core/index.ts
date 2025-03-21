async function llm_response(input_test: string): Promise<string> {
  // Talk to Ollama and respond back.
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        prompt: input_test,
        stream: false,
      }),
    });

    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    console.log("Response: ", responseJson["response"]);
    return responseJson["response"];
  } catch (error) {
    console.error("Error: ", error);
    return "Error occurred while fetching response.";
  }
}

export default llm_response;
