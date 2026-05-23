<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=00C896&center=true&vCenter=true&width=700&lines=Skribbl+Clone;Real-Time+Multiplayer+Drawing;Guess+Fast%2C+Score+High" alt="Typing SVG" />

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Render](https://img.shields.io/badge/Deployed_on_Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com)

<br/>

[![Live Demo](https://img.shields.io/badge/🎮_Live_Demo-skribble--clone--2.onrender.com-00C896?style=for-the-badge)](https://skribble-clone-2.onrender.com)

</div>

---

## 📌 Overview

**Skribbl Clone** is a real-time multiplayer drawing and guessing game. Players join a room via a 6-character code, take turns drawing a chosen word, and race to guess what others are drawing. Points are awarded for correct guesses — the fastest guesser scores highest. Built end-to-end with a Socket.io event-driven architecture and an HTML5 Canvas drawing engine with real-time stroke sync.
Browser (Drawer) ──draw events──► Server ──broadcast──► Browser (Guessers)
Browser (Guesser) ──guess──► Server ──check + score──► All Browsers

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Real-Time Canvas Sync** | Drawing strokes broadcast to all players via WebSockets with sub-100ms latency |
| 🔄 **Turn-Based Rounds** | Automated round rotation — every player gets a turn to draw |
| 📝 **Word Selection** | Drawer picks 1 of 3 random words each round |
| 🏆 **Scoring & Leaderboard** | Points for correct guesses + bonus for drawer; winner announced at game end |
| 🖌️ **Drawing Tools** | Brush, colors, brush size, eraser, undo, clear canvas |
| 💬 **Live Chat & Guessing** | Same input — guesses checked against word, wrong guesses shown as chat |
| 👑 **Host Controls** | Only host can start game; host auto-transfers on disconnect |
| ⚡ **In-Memory Game State** | Zero database overhead — all room and game state lives in server memory |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Canvas | HTML5 Canvas API |
| Deployment | Render (both services) |

---

## 🏗️ Architecture
Frontend (React + Vite)                Backend (Node.js + Express)
|                                          |
|        WebSocket (Socket.io)             |
|◄────────────────────────────────────────►|
|                                          |
socket.js                              GameManager.js
(singleton)                            (all active rooms)
|                                          |
App.jsx                                  Room.js
(screen routing)                         (game state, scoring,
|                                    turn logic, timer)
┌────┴────┐                                     |
│         │                               words.js
Home.jsx  Lobby.jsx                          (word list)
│
Game.jsx
(orchestrates game UI)
┌───────┼───────┬───────┐
│       │       │       │
Canvas  Toolbar   Chat   Scores

**No database** — all game state is held in two Maps on the server:
- `rooms Map` → roomId → Room object
- `socketToRoom Map` → socket.id → roomId

---

## 🔌 WebSocket Events

### Room & Lobby
| Event | Direction | Description |
|---|---|---|
| `create_room` | Client → Server | Host creates a room with settings |
| `join_room` | Client → Server | Player joins via room code |
| `players_update` | Server → Clients | Broadcast updated player list |
| `start_game` | Client → Server | Host starts the game |

### Game Flow
| Event | Direction | Description |
|---|---|---|
| `round_start` | Server → Clients | New round begins |
| `word_options` | Server → Drawer | Drawer receives 3 word choices |
| `word_chosen` | Client → Server | Drawer picks a word |
| `drawing_started` | Server → Clients | Drawing phase begins, word length sent |
| `timer_update` | Server → Clients | Countdown tick every second |
| `round_end` | Server → Clients | Round over, word revealed, scores updated |
| `game_over` | Server → Clients | Game finished, final leaderboard |

### Drawing
| Event | Direction | Description |
|---|---|---|
| `draw_start` | Client → Server | Mouse down — stroke begins |
| `draw_move` | Client → Server | Mouse move — stroke continues |
| `draw_end` | Client → Server | Mouse up — stroke ends |
| `canvas_clear` | Client → Server | Drawer clears canvas |
| `draw_undo` | Client → Server | Drawer undoes last stroke |

### Chat & Guessing
| Event | Direction | Description |
|---|---|---|
| `guess` | Client → Server | Player submits a guess |
| `guess_result` | Server → Clients | Correct or incorrect + points |
| `chat` | Client → Server | General chat message |
| `chat_message` | Server → Clients | Broadcast chat to room |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment Variables

Create `frontend/.env.local`:
VITE_BACKEND_URL=http://localhost:3001

No environment variables needed for backend locally.

---

## 🗂️ Project Structure
skribble-clone/
│
├── backend/
│   ├── server.js          # Express + Socket.io entry point
│   ├── GameManager.js     # Manages all active rooms
│   ├── Room.js            # Room state, game logic, scoring, timer
│   └── words.js           # Word list + random word selector
│
└── frontend/
└── src/
├── socket.js          # Socket.io singleton (autoConnect: false)
├── App.jsx            # Screen-based routing (home/lobby/game)
├── pages/
│   ├── Home.jsx       # Create / join room
│   ├── Lobby.jsx      # Waiting room + player list
│   └── Game.jsx       # Main game screen, phase orchestration
└── components/
├── Canvas.jsx     # HTML5 Canvas + stroke sync + undo
├── Toolbar.jsx    # Drawing tools + color picker
└── Chat.jsx       # Chat + guess input + auto scroll

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| Frontend | https://skribble-clone-2.onrender.com |
| Backend | https://skribble-clone-b171.onrender.com |

---

## ⚠️ Known Limitations

- In-memory storage — rooms lost if server restarts
- No mobile touch support on canvas
- No private room invite links (join by code only)

---

## 👤 Author

<div align="center">

**Dushyant Yadav**  
B.Tech CSE (AI & Data Science) — IIIT Manipur

[![GitHub](https://img.shields.io/badge/GitHub-Dushyant0608-181717?style=for-the-badge&logo=github)](https://github.com/Dushyant0608)

</div>

---

<div align="center">

Made with ❤️ by Dushyant Yadav

</div>