# Pokémon League PVP & Explore (Web App)

A competitive multiplayer and single-player Pokémon battling web client inspired by modern competitive gaming UI aesthetics. Built with **React**, **Redux Toolkit**, **Socket.io**, and **Framer Motion**.

---

## 🚀 Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing**: [wouter](https://github.com/molefrog/wouter)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit`, `react-redux`, `reselect`)
- **Real-Time Communication**: [Socket.io Client](https://socket.io/) (real-time matchmaking and battle events)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Pure CSS design system with custom fonts, glassmorphism, and responsive grids
- **Forms & Validation**: Formik + Yup

---

## ✨ Features

- **Authentication**: User registration and login with local token persistence.
- **Team Management**: Manage a roster of 6 Pokémon, view stats (HP, ATK, DEF, SP. ATK, SP. DEF, SPD), levels, moves, and consume overworld items.
- **Multiplayer Battles (PvP)**: Real-time 1v1 battle arena using Socket.io rooms, matchmaking queues, turn order determination, type effectiveness, and STAB bonuses.
- **Player vs AI (Explore)**: Battle AI opponents, level up Pokémon, allocate IVs/EVs dynamically, capture wild Pokémon with a dedicated naming modal, and learn new moves.
- **In-Game Store**: Buy Pokémon and items with Blue Essences (BE) or Riot Points (RP).
- **Social & Chat**: Live friends list, online presence detection, direct messaging, and battle invites.

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### 2. Installation
```bash
git clone https://github.com/jonylazarte/pokemon-league-pvp.git
cd reactPokemon
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
VITE_API_URL=http://localhost:5050/
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📡 Socket.io Events Contract

The client interacts with the backend battle server using the following socket events:

| Event Name | Direction | Payload Description |
|---|---|---|
| `authenticate` | Emit | `{ userName: string }` - Authenticates user session |
| `user-list` | On | `Array<{ userName, profileIcon, ... }>` - Broadcasts online users |
| `battle-request` | Emit | `{ to, from, roomId }` - Challenges an opponent |
| `battle-mailbox` | On | `{ roomId, from }` - Notifies receiving challenge |
| `join-room` | Emit | `{ roomId }` - Enters a battle room |
| `USER JOINED` | On | `{ room: string[], roomId: string }` - Room participants update |
| `start-match` | Emit / On | `{ roomId }` - Triggers battle stage transition |
| `selectpokemon` | Emit / On | `{ index, currentPlayer }` - Syncs team selection |
| `player-ready` | Emit / On | `{ currentPlayer, renderPokeballs, roomId }` - Confirms player readiness |
| `setpokemon` | Emit / On | `{ index, player, roomId }` - Active Pokémon switch |
| `attack` | Emit / On | `{ move, index, hitsToGive, randomVs, roomId, player, type }` - Attack or action turn resolution |
| `chat-message` | Emit / On | `{ to, from, message }` - Direct message exchange |
| `leave-room` | Emit | `{ roomId? }` - Leaves current matchmaking or battle room |
| `find-opponent` | Emit / On | `{ roomId }` - Queue matching event |
| `USER-OUT` | On | `{ newRoom }` - Opponent disconnect event |

---

## 📐 Formulas & Mechanics Preserved

- **HP Stat**: `Math.floor(((2 * base + IV + EV / 4) * level) / 100 + level + 10)`
- **Other Stats**: `Math.floor(((2 * base + IV + EV / 4) * level) / 100 + 5)`
- **Damage Formula**: `Math.floor(0.01 * B * E * V * (((0.2 * N + 1) * A * P) / (25 * D) + 2))`
  - `B`: STAB bonus (1.5 if type matches, otherwise 1)
  - `E`: Type effectiveness (0, 0.5, 1, 2)
  - `V`: Random variation (85 to 100)
  - `N`: Level
  - `A`: Attack / Special Attack
  - `D`: Defense / Special Defense
  - `P`: Move Power
- **Turn Order**: Prioritizes `PokemonChange` actions first; otherwise resolved by `speed` stat (`pokemon.stats[5].actual_stat`).
