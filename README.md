# 🎮 GameVerse - Multiplayer Arcade Web Platform

A realtime multiplayer gaming portal featuring beloved classic games:
- 🏏 **Hand Cricket**: The legendary schoolyard bat & bowl duel (Toss, 1-6 choices, commentary, wickets, target chase).
- 🎲 **Ludo Supreme**: Authentic 2-4 player board with safe stars, cut/captures, bonus rolls, and home stretch.
- ♟️ **Chess Grandmaster**: Full standard FIDE rules with legal move indicators, checkmate, stalemate, and notation history.
- ⭕ **Neon Tic-Tac-Toe**: Rapid-fire 3x3 blitz with glowing neon strikes and score tallies.

---

## ✨ Key Features

- **🌐 Zero-Install Browser Play**: Play on mobile, tablet, or desktop instantly.
- **🔗 1-Click Room Invites**: Generate a private 6-digit room code or share a direct link (`?room=XYZ`).
- **🤖 Autonomous AI Bots**: Play solo practice mode or fill any empty slot with a bot.
- **💬 Real-Time In-Game Chat**: Live messaging and quick reaction pills (*"Howzat!!"*, *"Checkmate incoming!"*, *"GG"*).
- **🔊 Procedural Sound Effects**: Native Web Audio API sound synthesis (zero external audio file dependencies).
- **🎉 Confetti Celebrations**: Victory fanfares and confetti on match finish.
- **🚀 Single-Port Fullstack Architecture**: Express serves Socket.IO and the built React frontend on the exact same port — making deployment to **Render**, **Railway**, or **Fly.io** completely seamless!

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd multiplayer-games-hub
npm install
```

### 2. Run in Development Mode
Starts both the backend (port 3001) and the Vite frontend (port 5173) with live hot-reload:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Production Build Locally
```bash
npm run build
npm start
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🌐 Free Hosting on the Internet (Step-by-Step)

### Option A: Free Hosting on Render (Recommended)
1. Push this folder to a GitHub repository.
2. Sign in to [Render.com](https://render.com) (free).
3. Click **"New +"** → **"Web Service"**.
4. Connect your GitHub repository (if in a subfolder, set **Root Directory** to `multiplayer-games-hub`).
5. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Click **Create Web Service**. Within 2 minutes, Render gives you a live public URL (e.g. `https://gameverse-xyz.onrender.com`) that you can share with anyone worldwide!

### Option B: Free Hosting on Railway
1. Sign in to [Railway.app](https://railway.app).
2. Click **"New Project"** → **"Deploy from GitHub repo"**.
3. Railway automatically detects `package.json`, runs `npm run build`, and starts `npm start` with a public `.up.railway.app` URL.

---

## 📁 Project Structure

```
multiplayer-games-hub/
├── render.yaml               # 1-Click Render blueprint configuration
├── package.json              # Fullstack scripts & dependencies
├── vite.config.ts            # Vite + React + Tailwind v4 + Socket.IO proxy
├── index.html                # App entry with Google Fonts & responsive meta
├── server/
│   ├── index.js              # Express, Socket.IO, Rooms, Bots, Static Hosting
│   └── games/
│       ├── handCricketManager.js # Bat/Bowl state machine, commentary & overs
│       ├── ludoManager.js        # 15x15 Ludo board tracking, cuts & bonus rolls
│       ├── chessManager.js       # chess.js legal moves, check & checkmate
│       └── tictactoeManager.js   # Fast 3x3 win-line evaluation
└── src/
    ├── main.tsx              # React 19 entry
    ├── App.tsx               # Master game coordinator & socket event hub
    ├── index.css             # Tailwind v4 glassmorphic styles & animations
    ├── types.ts              # TypeScript definitions for all games & rooms
    ├── utils/
    │   ├── sound.ts          # Web Audio API sound synthesizer
    │   ├── socket.ts         # Socket.IO connection client singleton
    │   └── ludoConstants.ts  # Track offsets & safe star coordinates
    └── components/
        ├── Navbar.tsx        # Top HUD, room code badge, audio toggle
        ├── Lobby.tsx         # Arcade landing page & avatar picker
        ├── RoomLobby.tsx     # Waiting room, player slots, bot controls
        ├── ChatDrawer.tsx    # Live chat & reaction pills
        ├── GameOverModal.tsx # Winner celebration & confetti
        ├── RulesModal.tsx    # How-to-play guide for each game
        └── games/
            ├── HandCricketGame.tsx # Pitch duel, 1-6 gesture buttons, scoreboard
            ├── LudoGame.tsx        # 15x15 colorful board, 3D animated dice
            ├── ChessGame.tsx       # 8x8 board, legal move dots, notation log
            └── TicTacToeGame.tsx   # Neon 3x3 grid & score tallies
```
