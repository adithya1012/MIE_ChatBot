# MIE Chatbot

A lightweight and modern chat interface for MCP and LLM interactions with Markdown support!

## Overview

A minimalist chat interface built with React and TypeScript, designed to be easily integrated with any backend. Features a clean and modern design.

![Demo](Screenshot/image.png)

## Folder structure

```
MCP.postman_collection.json
README.md
frontend/
  ├── components.json
  ├── eslint.config.js
  ├── index.html
  ├── LICENSE
  ├── package.json
  ├── postcss.config.js
  ├── tailwind.config.js
  ├── tsconfig.app.json
  ├── tsconfig.app.tsbuildinfo
  ├── tsconfig.json
  ├── tsconfig.node.json
  ├── tsconfig.node.tsbuildinfo
  ├── vite.config.ts
  ├── public/
  │   └── integrations/
  │       └── integration.yaml
  ├── src/
  │   ├── App.css
  │   ├── App.tsx
  │   ├── index.css
  │   ├── integrationManager.ts
  │   ├── integrator.js
  │   ├── main.tsx
  │   ├── vite-env.d.ts
  │   ├── assets/
  │   │   └── fonts/
  │   │       ├── geist-mono.woff2
  │   │       └── geist.woff2
  │   ├── components/
  │   │   ├── custom/
  │   │   │   ├── actions.tsx
  │   │   │   ├── chatinput.tsx
  │   │   │   ├── header.tsx
  │   │   │   ├── icons.tsx
  │   │   │   ├── markdown.tsx
  │   │   │   ├── message.tsx
  │   │   │   ├── overview.tsx
  │   │   │   ├── sidebar.tsx
  │   │   │   ├── theme-toggle.tsx
  │   │   │   └── use-scroll-to-bottom.ts
  │   │   └── ui/
  │   │       ├── button.tsx
  │   │       ├── card.tsx
  │   │       ├── command.tsx
  │   │       ├── dialog.tsx
  │   │       ├── icons.tsx
  │   │       ├── input.tsx
  │   │       ├── label.tsx
  │   │       ├── popover.tsx
  │   │       ├── scroll-area.tsx
  │   │       └── textarea.tsx
  │   ├── context/
  │   │   └── ThemeContext.tsx
  │   ├── interfaces/
  │   │   └── interfaces.ts
  │   ├── lib/
  │   │   └── utils.ts
  │   ├── pages/
  │   │   └── chat/
  │   │       └── chat.tsx
  ├── testbackend/
  │   └── test.py
Screenshot/
  ├── image.png
  └── Mermaid_Chart.png
```

- The `frontend/` directory contains all the frontend code (React + TypeScript), configuration, and assets.
- The `src/` folder holds the main application source code, organized by components, context, interfaces, and utility functions.
- The `public/` directory is for static assets and integration configs.
- The `testbackend/` folder contains a simple backend for local testing.
- The `Screenshot/` folder contains images for documentation.

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/adithya1012/MIE_ChatBot.git
cd MIE_ChatBot/frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

The frontend will be available at [http://localhost:8501](http://localhost:8501) by default.

## Architecture

Below is the architecture diagram of the chatbot:

![Mermaid Diagram](Screenshot/Mermaid_Chart.png)

## Explanation

- **Frontend**: This repository contains the code for the chatbot frontend, built with TypeScript and React. Running `npm run dev` in the `frontend` directory will start the development server on port 8501. The frontend acts as a WebSocket client, maintaining a persistent connection with the backend for real-time chat functionality.

- **Backend**: The backend is not included in this repository. It is available in the [MCP repository](https://github.com/adithya1012/MCP). The backend implements a WebSocket server using the Model Context Protocol (MCP) architecture. You must run the backend separately to enable full chat functionality.

<!-- - **Integration**: The frontend is designed to be easily integrated with any backend that supports WebSocket and the MCP protocol. You can modify the integration configuration in `frontend/public/integrations/integration.yaml` as needed. -->
