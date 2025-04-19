"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const init_1 = require("./init");
const init = new init_1.Initializer();
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
    ws.on("message", async (data) => {
        // const message = data.toString();
        // console.log(`Received message: ${message}`);
        // const respose = await llm_response(message);
        // console.log(respose);
        init.TaskHandler(data, (response) => {
            ws.send(response);
        });
        // console.log("THIS S A TEST MESSAGE");
        // Send a response message
        // ws.send(`Response: ${message}`);
        // ws.send(respose);
        // Optionally, signal end of the message stream:
        // ws.send("[END]");
    });
    // Handle the close event
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
//# sourceMappingURL=server.js.map