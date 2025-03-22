"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../prompts/system");
function llm_response(input_test) {
    return __awaiter(this, void 0, void 0, function* () {
        // Talk to Ollama and respond back.
        try {
            const response = yield fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek-r1:1.5b",
                    prompt: input_test,
                    system: system_1.SYSTEM_PROMPT,
                    stream: false,
                }),
            });
            const responseText = yield response.text();
            const responseJson = JSON.parse(responseText);
            console.log("Response: ", responseJson["response"]);
            return responseJson["response"];
        }
        catch (error) {
            console.error("Error: ", error);
            return "Error occurred while fetching response.";
        }
    });
}
exports.default = llm_response;
