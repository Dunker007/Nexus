# Nexus

**AI-Powered Development Platform & Revenue Engine**

A unified command center for AI orchestration, creative studios, and autonomous revenue generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm

### Start the Web App
```bash
cd webapp
npm install
npm run dev
```
Open http://localhost:3000

### Start the Bridge API (optional)
```bash
cd bridge
npm install
npm start
```
API runs on http://localhost:3456

## 📁 Structure

```
Nexus/
├── webapp/           # Next.js 16 web application
│   ├── src/app/      # App routes and pages
│   ├── src/components/ # Reusable components
│   └── src/lib/      # Utilities and services
├── bridge/           # Express.js API backend
│   ├── routes/       # API endpoints
│   └── services/     # Business logic
├── docs/             # Documentation
└── .agent/           # Workflow configs
```

## ✨ Features

- **AI Chat** - Multi-provider AI conversations (LM Studio, Ollama, Google AI)
- **AI Agents** - Specialized AI assistants for tasks
- **AI Meeting** - Multi-agent debate and brainstorming
- **Studios** - Creative workspaces (Music, Art, Dev, Video)
- **Revenue Lab** - Passive income tracking and automation
- **Voice Control** - God Mode voice commands
- **Labs** - R&D project pipeline

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js, Prisma, SQLite
- **AI**: LM Studio, Ollama, Google AI Studio

## ⚡ Daily Startup Guide

The best way to use Nexus is as a standalone App.

1.  **Launch Server**: Double-click `launch_nexus.bat` in the root folder.
2.  **Open App**: 
    - Open Chrome/Edge to `http://localhost:3002`
    - Click **Settings (⋮) > Save and Share > Install Nexus**
    - Pin the installed app to your specific taskbar location.

**Pro-Tip**: Create a shortcut to `launch_nexus.bat`, name it "Nexus Server", and give it a cool icon. Place it in your `shell:startup` folder to have the server ready automatically when you log in.

## 🖥️ LuxRig Production Deployment

To deploy Nexus on the LuxRig node for autonomous operation:

1.  **Dependencies**: Ensure `Node.js` is installed.
2.  **Install & Build**:
    - Run `setup_luxrig.bat`
    - This installs dependencies, deploys the database schema, and builds the production application.
3.  **Launch**:
    - Run `launch_nexus_prod.bat`
    - Starts the production server on port **3002**.

**Note**: The installer automatically configures `webapp/.env` using `luxrig_params.env`.

## 📝 License

Private project. All rights reserved.
