import { EventEmitter } from "events";
import { MCPClient } from "./index.js";
export class MCPClientManager extends EventEmitter {
    static instance = null;
    mcpClient = null;
    config = null;
    isInitialized = false;
    messageQueue = [];
    constructor() {
        super();
    }
    static getInstance() {
        if (!MCPClientManager.instance) {
            MCPClientManager.instance = new MCPClientManager();
        }
        return MCPClientManager.instance;
    }
    async initialize(config) {
        if (this.isInitialized) {
            console.log("MCP Client already initialized");
            return;
        }
        this.config = config;
        try {
            console.log("Creating MCP Client instance...");
            // Create MCP client with specified provider
            this.mcpClient = new MCPClient(config.provider);
            console.log(`Connecting to MCP server: ${config.scriptPath}`);
            // Connect to the MCP server
            await this.mcpClient.connectToServer(config.scriptPath, config.venvPath);
            this.isInitialized = true;
            // Process any queued messages
            this.processMessageQueue();
            console.log("MCP Client initialized successfully");
            this.emit("ready");
        }
        catch (error) {
            console.error("Failed to initialize MCP Client:", error);
            this.isInitialized = false;
            throw error;
        }
    }
    async processQuery(query) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized || !this.mcpClient) {
                // Queue the message if not initialized
                this.messageQueue.push({ query, resolve, reject });
                return;
            }
            // Process query through MCP client
            this.mcpClient.processQuery(query).then(resolve).catch(reject);
        });
    }
    async sendMessage(message) {
        // Maintain backward compatibility
        const query = typeof message === "string" ? message : JSON.stringify(message);
        return this.processQuery(query);
    }
    async processMessageQueue() {
        console.log(`Processing ${this.messageQueue.length} queued messages`);
        while (this.messageQueue.length > 0) {
            const { query, resolve, reject } = this.messageQueue.shift();
            try {
                const response = await this.processQuery(query);
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        }
    }
    isReady() {
        return this.isInitialized && this.mcpClient !== null;
    }
    async shutdown() {
        if (this.mcpClient) {
            try {
                await this.mcpClient.cleanup();
            }
            catch (error) {
                console.error("Error during MCP client cleanup:", error);
            }
            this.mcpClient = null;
            this.isInitialized = false;
        }
    }
    getConfig() {
        return this.config;
    }
    switchProvider(provider) {
        if (this.config) {
            this.config.provider = provider;
            // Note: You might want to reinitialize the client here
            console.log(`Provider switched to: ${provider}`);
        }
    }
}
