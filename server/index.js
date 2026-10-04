import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { createHandCricketGame, handleHandCricketToss, handleHandCricketActionChoice, handleHandCricketSelection } from './games/handCricketManager.js';
import { createChessGame, handleChessMove, getLegalMoves } from './games/chessManager.js';
import { createLudoGame, rollLudoDice, moveLudoToken } from './games/ludoManager.js';
import { createTicTacToeGame, handleTicTacToeMove, resetTicTacToeBoard } from './games/tictactoeManager.js';
import { Chess } from 'chess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static frontend assets if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), roomsCount: rooms.size });
});

// Rooms State
const rooms = new Map();
// Socket ID to player info map
const socketPlayerMap = new Map();

function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getSafeRoomData(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    gameType: room.gameType,
    maxPlayers: room.maxPlayers,
    status: room.status, // 'lobby' | 'playing'
    players: room.players,
    gameState: room.gameState,
    chat: room.chat
  };
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ${socket.id}`);

  // 1. Create Room
  socket.on('create_room', ({ playerName, avatar, gameType = 'hand_cricket' }, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const maxPlayersMap = {
      hand_cricket: 2,
      chess: 2,
      tictactoe: 2,
      ludo: 4
    };

    const hostPlayer = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '🦁',
      isHost: true,
      isReady: true,
      isBot: false
    };

    const room = {
      code,
      hostId: socket.id,
      gameType,
      maxPlayers: maxPlayersMap[gameType] || 2,
      status: 'lobby',
      players: [hostPlayer],
      gameState: null,
      chat: []
    };

    rooms.set(code, room);
    socketPlayerMap.set(socket.id, { roomCode: code, playerId: socket.id, name: hostPlayer.name });
    socket.join(code);

    console.log(`[Room Created] ${code} by ${hostPlayer.name} (Game: ${gameType})`);
    if (typeof callback === 'function') callback({ success: true, room: getSafeRoomData(room) });
  });

  // 2. Join Room
  socket.on('join_room', ({ code, playerName, avatar }, callback) => {
    const upperCode = (code || '').trim().toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room code not found' });
      return;
    }

    if (room.status === 'playing') {
      if (typeof callback === 'function') callback({ success: false, message: 'Game already in progress' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is already full' });
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      avatar: avatar || '🐯',
      isHost: false,
      isReady: false,
      isBot: false
    };

    room.players.push(newPlayer);
    socketPlayerMap.set(socket.id, { roomCode: upperCode, playerId: socket.id, name: newPlayer.name });
    socket.join(upperCode);

    io.to(upperCode).emit('room_updated', getSafeRoomData(room));
    if (typeof callback === 'function') callback({ success: true, room: getSafeRoomData(room) });
  });

  // 3. Add Bot to Room
  socket.on('add_bot', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is full' });
      return;
    }

    const botAvatars = ['🤖', '👾', '🚀', '⚡', '🧠'];
    const botNames = ['CyberBot', 'RoboPro', 'MatrixAI', 'AlphaZero', 'VoltAI'];
    const idx = room.players.length;

    const botPlayer = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: botNames[idx % botNames.length],
      avatar: botAvatars[idx % botAvatars.length],
      isHost: false,
      isReady: true,
      isBot: true
    };

    room.players.push(botPlayer);
    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
    if (typeof callback === 'function') callback({ success: true, room: getSafeRoomData(room) });
  });

  // 4. Remove Bot / Kick Player
  socket.on('remove_player', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.players = room.players.filter(p => p.id !== targetId);
    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
  });

  // 5. Change Game Type
  socket.on('change_game', ({ roomCode, gameType }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    const maxPlayersMap = {
      hand_cricket: 2,
      chess: 2,
      tictactoe: 2,
      ludo: 4
    };

    room.gameType = gameType;
    room.maxPlayers = maxPlayersMap[gameType] || 2;
    // Trim excess players/bots if needed
    if (room.players.length > room.maxPlayers) {
      room.players = room.players.slice(0, room.maxPlayers);
    }

    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
  });

  // 6. Toggle Ready
  socket.on('toggle_ready', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(roomCode).emit('room_updated', getSafeRoomData(room));
    }
  });

  // 7. Start Game
  socket.on('start_game', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    if (room.players.length < 2) {
      if (typeof callback === 'function') callback({ success: false, message: 'Need at least 2 players to start! Add a bot or invite a friend.' });
      return;
    }

    room.status = 'playing';

    if (room.gameType === 'hand_cricket') {
      room.gameState = createHandCricketGame(room.players[0], room.players[1]);
    } else if (room.gameType === 'chess') {
      room.gameState = createChessGame(room.players[0], room.players[1]);
    } else if (room.gameType === 'ludo') {
      room.gameState = createLudoGame(room.players);
    } else if (room.gameType === 'tictactoe') {
      room.gameState = createTicTacToeGame(room.players[0], room.players[1]);
    }

    io.to(roomCode).emit('game_started', getSafeRoomData(room));
    if (typeof callback === 'function') callback({ success: true });

    // Check if initial turn is a bot
    triggerBotTurnIfNeeded(room);
  });

  // 8. Rematch / Reset Game
  socket.on('rematch_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.status = 'playing';
    if (room.gameType === 'hand_cricket') {
      room.gameState = createHandCricketGame(room.players[0], room.players[1]);
    } else if (room.gameType === 'chess') {
      // Alternate white/black
      room.gameState = createChessGame(room.players[1], room.players[0]);
    } else if (room.gameType === 'ludo') {
      room.gameState = createLudoGame(room.players);
    } else if (room.gameType === 'tictactoe') {
      room.gameState = resetTicTacToeBoard(room.gameState || createTicTacToeGame(room.players[0], room.players[1]));
    }

    io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
    triggerBotTurnIfNeeded(room);
  });

  // 9. Back to Lobby
  socket.on('return_to_lobby', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.status = 'lobby';
    room.gameState = null;
    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
  });

  // 10. Chat & Reactions
  socket.on('send_chat', ({ roomCode, text, type = 'text' }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id) || { name: 'Player', avatar: '🎮' };
    const chatItem = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: player.name,
      avatar: player.avatar,
      senderId: socket.id,
      text,
      type, // 'text' | 'reaction'
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chat.push(chatItem);
    if (room.chat.length > 50) room.chat.shift();

    io.to(roomCode).emit('new_chat_message', chatItem);
  });

  // 11. Central Game Action Router
  socket.on('game_action', ({ roomCode, action, payload }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    if (room.gameType === 'hand_cricket') {
      handleHandCricketAction(room, socket.id, action, payload);
    } else if (room.gameType === 'chess') {
      handleChessAction(room, socket.id, action, payload);
    } else if (room.gameType === 'ludo') {
      handleLudoAction(room, socket.id, action, payload);
    } else if (room.gameType === 'tictactoe') {
      handleTicTacToeAction(room, socket.id, action, payload);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ${socket.id}`);
    const info = socketPlayerMap.get(socket.id);
    if (info) {
      const room = rooms.get(info.roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(info.roomCode);
          console.log(`[Room Deleted] ${info.roomCode} (Empty)`);
        } else {
          // If host left, assign new host
          if (room.hostId === socket.id) {
            const nextHuman = room.players.find(p => !p.isBot);
            if (nextHuman) {
              room.hostId = nextHuman.id;
              nextHuman.isHost = true;
            } else {
              room.hostId = room.players[0].id;
              room.players[0].isHost = true;
            }
          }
          io.to(info.roomCode).emit('room_updated', getSafeRoomData(room));
        }
      }
      socketPlayerMap.delete(socket.id);
    }
  });
});

// --- Action Handlers & Bot Integrations ---

function handleHandCricketAction(room, playerId, action, payload) {
  const game = room.gameState;

  if (action === 'toss_call') {
    handleHandCricketToss(game, playerId, payload.choice);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    triggerBotTurnIfNeeded(room);
  } else if (action === 'choose_action') {
    handleHandCricketActionChoice(game, playerId, payload.action);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    triggerBotTurnIfNeeded(room);
  } else if (action === 'select_number') {
    const { resolved } = handleHandCricketSelection(game, playerId, payload.number);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    if (!resolved) {
      triggerBotTurnIfNeeded(room);
    }
  }
}

function handleChessAction(room, playerId, action, payload) {
  const game = room.gameState;
  if (action === 'move') {
    const { valid, message } = handleChessMove(game, playerId, payload.from, payload.to, payload.promotion);
    if (valid) {
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    }
  }
}

function handleLudoAction(room, playerId, action, payload) {
  const game = room.gameState;
  if (action === 'roll_dice') {
    const res = rollLudoDice(game, playerId);
    if (res.valid) {
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    }
  } else if (action === 'move_token') {
    const res = moveLudoToken(game, playerId, payload.tokenIndex);
    if (res.valid) {
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    }
  }
}

function handleTicTacToeAction(room, playerId, action, payload) {
  const game = room.gameState;
  if (action === 'move') {
    const res = handleTicTacToeMove(game, playerId, payload.cellIndex);
    if (res.valid) {
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    }
  }
}

// --- Autonomous Bot AI Dispatcher ---
function triggerBotTurnIfNeeded(room) {
  if (!room.gameState || room.status !== 'playing') return;

  const game = room.gameState;

  // 1. Hand Cricket Bot
  if (room.gameType === 'hand_cricket') {
    if (game.status === 'toss') {
      const caller = room.players.find(p => p.id === game.toss.callerId);
      if (caller && caller.isBot) {
        setTimeout(() => {
          const choices = ['heads', 'tails'];
          handleHandCricketToss(game, caller.id, choices[Math.floor(Math.random() * 2)]);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 800);
      }
    } else if (game.status === 'choose_action') {
      const winner = room.players.find(p => p.id === game.toss.winnerId);
      if (winner && winner.isBot) {
        setTimeout(() => {
          const action = Math.random() < 0.6 ? 'bat' : 'bowl';
          handleHandCricketActionChoice(game, winner.id, action);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 800);
      }
    } else if (game.status === 'innings1' || game.status === 'innings2') {
      const batsman = room.players.find(p => p.id === game.currentBatsmanId);
      const bowler = room.players.find(p => p.id === game.currentBowlerId);

      // Check if bot needs to select a number
      [batsman, bowler].forEach(player => {
        if (player && player.isBot && game.currentTurnSelections[player.id] === undefined) {
          setTimeout(() => {
            const numbers = [1, 2, 3, 4, 5, 6];
            // slight bias to realistic cricket scoring (4s, 6s, singles)
            const weights = [1, 2, 2, 4, 3, 6, 4, 6];
            const num = weights[Math.floor(Math.random() * weights.length)];
            const { resolved } = handleHandCricketSelection(game, player.id, num);
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            if (!resolved) triggerBotTurnIfNeeded(room);
          }, 600);
        }
      });
    }
  }

  // 2. Chess Bot
  else if (room.gameType === 'chess' && game.status === 'playing') {
    const activeColor = game.turn;
    const player = game.players[activeColor];
    if (player && player.isBot) {
      setTimeout(() => {
        try {
          const chess = new Chess(game.fen);
          const legalMoves = chess.moves({ verbose: true });
          if (legalMoves.length > 0) {
            // Prioritize captures or checks
            const captures = legalMoves.filter(m => m.captured);
            const checks = legalMoves.filter(m => m.san.includes('+'));
            let chosenMove;
            if (captures.length > 0 && Math.random() < 0.7) {
              chosenMove = captures[Math.floor(Math.random() * captures.length)];
            } else if (checks.length > 0 && Math.random() < 0.6) {
              chosenMove = checks[Math.floor(Math.random() * checks.length)];
            } else {
              chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            }

            handleChessMove(game, player.id, chosenMove.from, chosenMove.to, chosenMove.promotion || 'q');
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            triggerBotTurnIfNeeded(room);
          }
        } catch (e) {
          console.error('[Chess Bot Error]', e);
        }
      }, 700);
    }
  }

  // 3. Ludo Bot
  else if (room.gameType === 'ludo' && game.status === 'playing') {
    const currentColor = game.currentColor;
    const player = game.players[currentColor];
    if (player && player.isBot) {
      if (!game.awaitingMove) {
        // Step 1: Roll dice
        setTimeout(() => {
          const res = rollLudoDice(game, player.id);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          if (res.valid && !res.autoPassed && game.awaitingMove) {
            triggerBotTurnIfNeeded(room);
          } else if (res.valid && res.autoPassed) {
            triggerBotTurnIfNeeded(room);
          }
        }, 700);
      } else {
        // Step 2: Move a token
        setTimeout(() => {
          if (game.movableTokens.length > 0) {
            // AI chooses best token:
            // 1. Move to home (step + dice === 56)
            // 2. Capture opponent if possible
            // 3. Bring token out of yard on 6
            // 4. Furthest token on track
            let chosenToken = game.movableTokens[0];
            const dice = game.diceValue;

            for (const tIdx of game.movableTokens) {
              const cur = player.tokens[tIdx];
              if (cur + dice === 56) {
                chosenToken = tIdx;
                break;
              }
              if (cur === -1 && dice === 6) {
                chosenToken = tIdx;
              }
            }

            const res = moveLudoToken(game, player.id, chosenToken);
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            if (res.valid) {
              triggerBotTurnIfNeeded(room);
            }
          }
        }, 600);
      }
    }
  }

  // 4. Tic-Tac-Toe Bot
  else if (room.gameType === 'tictactoe' && game.status === 'playing') {
    const symbol = game.turn;
    const player = game.players[symbol];
    if (player && player.isBot) {
      setTimeout(() => {
        const available = [];
        game.board.forEach((cell, idx) => {
          if (cell === null) available.push(idx);
        });

        if (available.length > 0) {
          // Pick center if free, otherwise random
          let choice = available.includes(4) ? 4 : available[Math.floor(Math.random() * available.length)];
          handleTicTacToeMove(game, player.id, choice);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }
      }, 500);
    }
  }
}

// Fallback to index.html for client routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('GameVerse API Server Running. Run frontend in dev or build dist.');
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 GameVerse Server is running on port ${PORT}`);
  console.log(`🌐 Ready for multiplayer connections and deployment!`);
});
