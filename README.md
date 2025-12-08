# Nexus

**AI-Powered Development Platform & Revenue Engine**

A unified command center for AI orchestration, creative studios, and autonomous revenue generation.

## 🚀 Quick Start (Desktop App)

Nexus is now a standalone desktop application.

1.  **Download & Install**: Run the latest installer (e.g., `Nexus_2.0.0_x64-setup.exe`).
2.  **Launch**: Open **Nexus** from your Start Menu or Desktop.
    *   The app will automatically start the backend Bridge (server.js) in the background.
    *   The app runs systematically in the System Tray.

### Development Mode
If you want to contribute or modify the source:
```bash
cd webapp
npm install
npm run tauri dev
```

## 📁 Structure

```
Nexus/
├── webapp/           # Next.js 16 + Tauri 2.0 application
│   ├── src-tauri/    # Rust backend for Desktop App
│   ├── src/app/      # App routes and pages
│   └── src/components/ # Reusable components
├── bridge/           # Express.js API backend (bundled with app)
│   ├── routes/       # API endpoints
│   └── services/     # Business logic
└── docs/             # Documentation
```

## ✨ Features

- **AI Chat** - Multi-provider AI conversations (LM Studio, Ollama, Google AI)
- **News Hub 2.0** - Aggregation from 100+ sources with bias transparency
- **Revenue Hub** - Unified dashboard for income streams (Music, Art, Pipeline)
- **Content Pipeline** - Automated content generation & publishing engine
- **Studios** - Creative workspaces (Music, Art, Dev, Video)
- **System Tray** - Runs in background, minimize to tray
- **Remote Access** - Access via Tailscale on mobile devices

## 🛠️ Tech Stack

- **Desktop**: Tauri 2.0 (Rust)
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js, Prisma, SQLite (Bridge)
- **AI**: LM Studio, Ollama, Google AI Studio

## 📱 Remote Access

Nexus v0.4.1+ supports remote access via Tailscale.
1.  Go to **Settings > Remote Access** in the app.
2.  Install Tailscale on your host PC and mobile device.
3.  Use the provided IP to access Nexus from your phone.

## 📝 License

Private project. All rights reserved.
