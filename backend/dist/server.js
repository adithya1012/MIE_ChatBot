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
const ws_1 = require("ws");
const gemini_1 = require("./core/gemini");
const parseAssistantMessage_1 = require("./parser/parseAssistantMessage");
const port = 8090;
const wss = new ws_1.WebSocketServer({ port }, () => {
    console.log(`WebSocket server is listening on ws://localhost:${port}`);
});
// Listen for client connections
wss.on("connection", (ws) => {
    console.log("Client connected");
    // Send an initial welcome message
    ws.send("Welcome to the WebSocket server!");
    // Listen for incoming messages from the client
    ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const message = data.toString();
        // console.log(`Received message: ${message}`);
        // const respose = await llm_response(message);
        const respose = yield (0, gemini_1.default)(message);
        // console.log(respose);
        (0, parseAssistantMessage_1.parseAssistanceMessage)(respose);
        // console.log("THIS S A TEST MESSAGE");
        // Send a response message
        // ws.send(`Response: ${message}`);
        ws.send(respose);
        // Optionally, signal end of the message stream:
        // ws.send("[END]");
    }));
    // Handle the close event
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
//# sourceMappingURL=server.js.map