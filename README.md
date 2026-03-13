<p align="center">
  <img src="https://github.com/ErezShahaf/lore/blob/main/icon.png?raw=true" width="80" height="80" />
</p>

<h1 align="center">Lore</h1>

<p align="center">
  AI-powered thought capture and recall — runs entirely on your machine.
</p>

---

## What is Lore?

Lore is a lightweight desktop app that sits in your system tray and lets you quickly capture thoughts, notes, and todos using natural language. It uses a local LLM (via [Ollama](https://ollama.com)) and a local vector database (LanceDB) to store, understand, and retrieve your information — no cloud services, no API keys, complete privacy.

### Key features

- **Quick capture** — press a global shortcut to pop up a chat bar, type a thought, and it's stored instantly
- **Smart recall** — ask questions in natural language and get answers sourced from your stored thoughts
- **AI classification** — input is automatically classified as a thought, question, command, or instruction
- **Todo management** — add, list, complete, and organize todos with priority and categories
- **RAG pipeline** — retrieval-augmented generation finds relevant context from your notes before answering
- **Fully local** — all data and AI processing stays on your machine

## Prerequisites

- [Ollama](https://ollama.com) installed and running
- A chat model pulled (e.g. `ollama pull llama3.2:3b`)
- An embedding model pulled: `ollama pull nomic-embed-text`

## Installation

### Download installer

Download the latest release from the [Releases](https://github.com/ErezShahaf/lore/releases) page:

- **Windows** — `Lore-x.x.x-Setup.exe`
- **macOS** — `Lore-x.x.x.dmg`
- **Linux** — `Lore-x.x.x.AppImage`

### Build from source

```bash
git clone https://github.com/ErezShahaf/lore.git
cd lore
npm install
npm run build
```

Installers will appear in `release/<version>/`.

## Usage

### Global shortcut

Press **Ctrl+Shift+Space** (or **Cmd+Shift+Space** on macOS) to toggle the Lore popup.

### Storing thoughts

Just type naturally:

- *"Meeting with Sarah about Q3 roadmap — she wants to prioritize mobile"*
- *"Remember to buy milk on the way home"*
- *"The API endpoint for user auth is /api/v2/auth/login"*

Lore classifies and stores your input automatically.

### Asking questions

- *"What did Sarah say about Q3?"*
- *"What do I need to buy?"*
- *"What's the auth API endpoint?"*

Lore searches your stored thoughts and generates an answer with relevant context.

### Managing todos

- *"Add todo: finish the quarterly report by Friday"*
- *"Show my todos"*
- *"Complete the quarterly report todo"*

### Commands

- *"Delete the note about milk"*
- *"Update the meeting notes to include the new deadline"*

### Settings

Right-click the tray icon and select **Settings**, or access settings to:

- Change the global keyboard shortcut
- Select chat and embedding models
- Pull or delete Ollama models
- Enable/disable start on login
- Configure hide-on-blur behavior

## Development

### Setup

```bash
git clone https://github.com/ErezShahaf/lore.git
cd lore
npm install
```

### Run in development

```bash
npm run dev
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with Electron |
| `npm run build` | Typecheck + build + package for current platform |
| `npm run build:win` | Build Windows installer (.exe) |
| `npm run build:mac` | Build macOS installer (.dmg) |
| `npm run build:linux` | Build Linux AppImage |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Architecture

```
electron/
├── main.ts                  # App entry — tray, shortcuts, lifecycle
├── preload.ts               # Context bridge (IPC API for renderer)
├── ipc/handlers.ts          # IPC channel handlers
├── windows/
│   ├── chatWindow.ts        # Chat popup window management
│   └── settingsWindow.ts    # Settings window management
├── tray/trayManager.ts      # System tray icon and menu
├── shortcuts.ts             # Global keyboard shortcuts
└── services/
    ├── agentService.ts      # Main agent: classify → route → respond
    ├── classifierService.ts # LLM-based input classification
    ├── ollamaService.ts     # Ollama HTTP client (chat, models, health)
    ├── lanceService.ts      # LanceDB vector database operations
    ├── embeddingService.ts  # Text → vector embedding via Ollama
    ├── documentPipeline.ts  # Store, embed, retrieve documents
    ├── settingsService.ts   # Persistent settings (JSON file)
    ├── autoStartService.ts  # OS login item registration
    └── handlers/
        ├── thoughtHandler.ts    # Store thoughts with LLM restructuring
        ├── questionHandler.ts   # RAG-powered Q&A
        ├── commandHandler.ts    # Delete, update, complete documents
        ├── instructionHandler.ts# Store user preferences
        └── todoHandler.ts       # Todo CRUD with metadata

src/
├── App.tsx                  # Route to chat or settings window
├── main.tsx                 # React entry point
├── styles/globals.css       # Theme and animations
├── components/
│   ├── chat/                # Chat popup UI
│   ├── settings/            # Settings panel UI
│   └── ui/                  # Shared UI primitives
├── hooks/                   # React hooks (useChat, useSettings, etc.)
└── types/electron.d.ts      # Window API type declarations

shared/types.ts              # Shared TypeScript types
```

### Data flow

1. User types in the chat popup
2. Message is sent to the main process via IPC
3. `agentService` classifies the input (thought / question / command / instruction)
4. Classified input is routed to the appropriate handler
5. Handlers interact with LanceDB (store/retrieve) and Ollama (generate)
6. Response streams back to the renderer via IPC events

## License

[MIT](LICENSE)
