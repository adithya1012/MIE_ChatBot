import { WebSocketServer, WebSocket } from "ws";
import llm_response from "./core/index";
import gemini_response from "./core/gemini";
import { parseAssistanceMessage } from "./parser/parseAssistantMessage";

const port: number = 8090;
const wss = new WebSocketServer({ port }, () => {
  console.log(`WebSocket server is listening on ws://localhost:${port}`);
});

// Listen for client connections
wss.on("connection", (ws: any) => {
  console.log("Client connected");

  // Send an initial welcome message
  ws.send("Welcome to the WebSocket server!");

  // Listen for incoming messages from the client
  ws.on("message", async (data: Buffer) => {
    const message = data.toString();
    console.log(`Received message: ${message}`);
    // const respose = await llm_response(message);
    const respose = await gemini_response(message);
    // console.log(respose);
    parseAssistanceMessage(respose);
    console.log("THIS S A TEST MESSAGE");
    // Send a response message
    // ws.send(`Response: ${message}`);
    ws.send(respose);

    // Optionally, signal end of the message stream:
    // ws.send("[END]");
  });

  // Handle the close event
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
