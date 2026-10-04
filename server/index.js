import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { createHandCricketGame, handleHandCricketToss, handleHandCricketActionChoice, handleHandCricketSelection } from './games/handCricketManager.js';
import { createChessGame, handleChessMove } from './games/chessManager.js';
import { createLudoGame, rollLudoDice, moveLudoToken } from './games/ludoManager.js';
import { createTicTacToeGame, handleTicTacToeMove, resetTicTacToeBoard } from './games/tictactoeManager.js';
import { createConnect4Game, handleConnect4Drop, getConnect4BotMove } from './games/connect4Manager.js';
import { createBattleshipGame, handleBattleshipFire, getBattleshipBotMove } from './games/battleshipManager.js';
import { createCheckersGame, handleCheckersMove, getCheckersBotMove } from './games/checkersManager.js';
import { createMemoryMatchGame, handleMemoryFlip, resetMemoryFlips } from './games/memoryMatchManager.js';
import { createDotsAndBoxesGame, handleDotsLineClick, getDotsBotMove } from './games/dotsAndBoxesManager.js';
import { createWordleDuelGame, handleWordleGuess, getWordleBotGuess } from './games/wordleDuelManager.js';
import { create2048Game, handle2048Move, get2048BotMove } from './games/game2048Manager.js';
import { createSnakeGame, handleSnakeDirection, tickSnakeGame, getSnakeBotDirection } from './games/snakeBattleManager.js';
import { createPongGame, handlePaddleMove, tickPongGame, getPongBotY } from './games/pongManager.js';
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

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), roomsCount: rooms.size });
});

// Rooms state
const rooms = new Map();
const socketPlayerMap = new Map();
const roomTickIntervals = new Map();

function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const MAX_PLAYERS_MAP = {
  hand_cricket: 2,
  chess: 2,
  ludo: 4,
  tictactoe: 2,
  connect4: 2,
  battleship: 2,
  checkers: 2,
  memory_match: 2,
  dots_and_boxes: 2,
  wordle_duel: 2,
  game_2048: 2,
  snake_battle: 2,
  pong_duel: 2
};

function getSafeRoomData(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    gameType: room.gameType,
    maxPlayers: room.maxPlayers,
    status: room.status,
    players: room.players,
    gameState: room.gameState,
    chat: room.chat
  };
}

function clearRoomInterval(roomCode) {
  if (roomTickIntervals.has(roomCode)) {
    clearInterval(roomTickIntervals.get(roomCode));
    roomTickIntervals.delete(roomCode);
  }
}

io.on('connection', (socket) => {
  // 1. Create Room
  socket.on('create_room', ({ playerName, avatar, gameType = 'hand_cricket' }, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

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
      maxPlayers: MAX_PLAYERS_MAP[gameType] || 2,
      status: 'lobby',
      players: [hostPlayer],
      gameState: null,
      chat: []
    };

    rooms.set(code, room);
    socketPlayerMap.set(socket.id, { roomCode: code, playerId: socket.id, name: hostPlayer.name });
    socket.join(code);

    if (typeof callback === 'function') callback({ success: true, room: getSafeRoomData(room) });
  });

  // 2. Join Room
  socket.on('join_room', ({ code, playerName, avatar }, callback) => {
    const upperCode = (code || '').trim().toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room not found' });
      return;
    }

    if (room.status === 'playing') {
      if (typeof callback === 'function') callback({ success: false, message: 'Match in progress' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is full' });
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

  // 3. Add Bot
  socket.on('add_bot', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is full' });
      return;
    }

    const botAvatars = ['🤖', '👾', '🚀', '⚡', '🧠', '🦾'];
    const botNames = ['CyberBot', 'RoboPro', 'MatrixAI', 'AlphaZero', 'VoltAI', 'PixelBot'];
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

  // 4. Remove Player / Bot
  socket.on('remove_player', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.players = room.players.filter(p => p.id !== targetId);
    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
  });

  // 5. Change Game
  socket.on('change_game', ({ roomCode, gameType }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    clearRoomInterval(roomCode);
    room.gameType = gameType;
    room.maxPlayers = MAX_PLAYERS_MAP[gameType] || 2;
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

    clearRoomInterval(roomCode);
    initializeGame(room);

    io.to(roomCode).emit('game_started', getSafeRoomData(room));
    if (typeof callback === 'function') callback({ success: true });

    triggerBotTurnIfNeeded(room);
  });

  // 8. Rematch Game
  socket.on('rematch_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    clearRoomInterval(roomCode);
    initializeGame(room);

    io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
    triggerBotTurnIfNeeded(room);
  });

  // 9. Return to Lobby
  socket.on('return_to_lobby', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    clearRoomInterval(roomCode);
    room.status = 'lobby';
    room.gameState = null;
    io.to(roomCode).emit('room_updated', getSafeRoomData(room));
  });

  // 10. Live Chat & Reactions
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
      type,
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

    const game = room.gameState;
    const gType = room.gameType;

    if (gType === 'hand_cricket') {
      if (action === 'toss_call') {
        handleHandCricketToss(game, socket.id, payload.choice);
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      } else if (action === 'choose_action') {
        handleHandCricketActionChoice(game, socket.id, payload.action);
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      } else if (action === 'select_number') {
        const { resolved } = handleHandCricketSelection(game, socket.id, payload.number);
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        if (!resolved) triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'chess' && action === 'move') {
      const { valid } = handleChessMove(game, socket.id, payload.from, payload.to, payload.promotion);
      if (valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'ludo') {
      if (action === 'roll_dice') {
        const res = rollLudoDice(game, socket.id);
        if (res.valid) {
          io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }
      } else if (action === 'move_token') {
        const res = moveLudoToken(game, socket.id, payload.tokenIndex);
        if (res.valid) {
          io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }
      }
    } else if (gType === 'tictactoe' && action === 'move') {
      const res = handleTicTacToeMove(game, socket.id, payload.cellIndex);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'connect4' && action === 'drop_disc') {
      const res = handleConnect4Drop(game, socket.id, payload.col);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'battleship' && action === 'fire') {
      const res = handleBattleshipFire(game, socket.id, payload.r, payload.c);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'checkers' && action === 'move') {
      const res = handleCheckersMove(game, socket.id, payload.from, payload.to);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'memory_match' && action === 'flip_card') {
      const res = handleMemoryFlip(game, socket.id, payload.cardIndex);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        if (res.needsReset) {
          setTimeout(() => {
            resetMemoryFlips(game);
            io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
            triggerBotTurnIfNeeded(room);
          }, 1100);
        } else {
          triggerBotTurnIfNeeded(room);
        }
      }
    } else if (gType === 'dots_and_boxes' && action === 'draw_line') {
      const res = handleDotsLineClick(game, socket.id, payload.type, payload.r, payload.c);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }
    } else if (gType === 'wordle_duel' && action === 'guess_word') {
      const res = handleWordleGuess(game, socket.id, payload.word);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
      }
    } else if (gType === 'game_2048' && action === 'slide') {
      const res = handle2048Move(game, socket.id, payload.direction);
      if (res.valid) {
        io.to(roomCode).emit('game_state_updated', getSafeRoomData(room));
      }
    } else if (gType === 'snake_battle' && action === 'change_dir') {
      handleSnakeDirection(game, socket.id, payload.direction);
    } else if (gType === 'pong_duel' && action === 'move_paddle') {
      handlePaddleMove(game, socket.id, payload.targetY);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const info = socketPlayerMap.get(socket.id);
    if (info) {
      const room = rooms.get(info.roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          clearRoomInterval(info.roomCode);
          rooms.delete(info.roomCode);
        } else {
          if (room.hostId === socket.id) {
            const nextHuman = room.players.find(p => !p.isBot) || room.players[0];
            room.hostId = nextHuman.id;
            nextHuman.isHost = true;
          }
          io.to(info.roomCode).emit('room_updated', getSafeRoomData(room));
        }
      }
      socketPlayerMap.delete(socket.id);
    }
  });
});

function initializeGame(room) {
  room.status = 'playing';
  const [p1, p2, p3, p4] = room.players;
  const gt = room.gameType;

  if (gt === 'hand_cricket') room.gameState = createHandCricketGame(p1, p2);
  else if (gt === 'chess') room.gameState = createChessGame(p1, p2);
  else if (gt === 'ludo') room.gameState = createLudoGame(room.players);
  else if (gt === 'tictactoe') room.gameState = createTicTacToeGame(p1, p2);
  else if (gt === 'connect4') room.gameState = createConnect4Game(p1, p2);
  else if (gt === 'battleship') room.gameState = createBattleshipGame(p1, p2);
  else if (gt === 'checkers') room.gameState = createCheckersGame(p1, p2);
  else if (gt === 'memory_match') room.gameState = createMemoryMatchGame(p1, p2);
  else if (gt === 'dots_and_boxes') room.gameState = createDotsAndBoxesGame(p1, p2);
  else if (gt === 'wordle_duel') room.gameState = createWordleDuelGame(p1, p2);
  else if (gt === 'game_2048') room.gameState = create2048Game(p1, p2);
  else if (gt === 'snake_battle') {
    room.gameState = createSnakeGame(p1, p2);
    startSnakeInterval(room);
  } else if (gt === 'pong_duel') {
    room.gameState = createPongGame(p1, p2);
    startPongInterval(room);
  }
}

function startSnakeInterval(room) {
  clearRoomInterval(room.code);
  const interval = setInterval(() => {
    if (!room.gameState || room.status !== 'playing' || room.gameState.status !== 'playing') {
      clearRoomInterval(room.code);
      return;
    }
    // Bot directions
    room.gameState.playerIds.forEach(id => {
      const p = room.gameState.players[id];
      if (p.isBot && p.alive) {
        const botDir = getSnakeBotDirection(room.gameState, id);
        handleSnakeDirection(room.gameState, id, botDir);
      }
    });

    tickSnakeGame(room.gameState);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));

    if (room.gameState.status === 'game_over') {
      clearRoomInterval(room.code);
    }
  }, 160);
  roomTickIntervals.set(room.code, interval);
}

function startPongInterval(room) {
  clearRoomInterval(room.code);
  const interval = setInterval(() => {
    if (!room.gameState || room.status !== 'playing' || room.gameState.status !== 'playing') {
      clearRoomInterval(room.code);
      return;
    }
    // Bot paddle
    room.gameState.playerIds.forEach(id => {
      const p = room.gameState.players[id];
      if (p.isBot) {
        const botY = getPongBotY(room.gameState, id);
        handlePaddleMove(room.gameState, id, botY);
      }
    });

    tickPongGame(room.gameState);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));

    if (room.gameState.status === 'game_over') {
      clearRoomInterval(room.code);
    }
  }, 35);
  roomTickIntervals.set(room.code, interval);
}

// Bot AI Dispatcher
function triggerBotTurnIfNeeded(room) {
  if (!room.gameState || room.status !== 'playing') return;

  const game = room.gameState;
  const gt = room.gameType;

  // Hand cricket bot
  if (gt === 'hand_cricket') {
    if (game.status === 'toss') {
      const caller = room.players.find(p => p.id === game.toss.callerId);
      if (caller && caller.isBot) {
        setTimeout(() => {
          handleHandCricketToss(game, caller.id, Math.random() < 0.5 ? 'heads' : 'tails');
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 700);
      }
    } else if (game.status === 'choose_action') {
      const winner = room.players.find(p => p.id === game.toss.winnerId);
      if (winner && winner.isBot) {
        setTimeout(() => {
          handleHandCricketActionChoice(game, winner.id, Math.random() < 0.6 ? 'bat' : 'bowl');
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 700);
      }
    } else if (game.status === 'innings1' || game.status === 'innings2') {
      [game.currentBatsmanId, game.currentBowlerId].forEach(id => {
        const p = room.players.find(pl => pl.id === id);
        if (p && p.isBot && game.currentTurnSelections[p.id] === undefined) {
          setTimeout(() => {
            const weights = [1, 2, 2, 4, 3, 6, 4, 6];
            const num = weights[Math.floor(Math.random() * weights.length)];
            const { resolved } = handleHandCricketSelection(game, p.id, num);
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            if (!resolved) triggerBotTurnIfNeeded(room);
          }, 600);
        }
      });
    }
  }

  // Chess bot
  else if (gt === 'chess' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        try {
          const chess = new Chess(game.fen);
          const legalMoves = chess.moves({ verbose: true });
          if (legalMoves.length > 0) {
            const captures = legalMoves.filter(m => m.captured);
            const move = captures.length > 0 && Math.random() < 0.7
              ? captures[Math.floor(Math.random() * captures.length)]
              : legalMoves[Math.floor(Math.random() * legalMoves.length)];
            handleChessMove(game, player.id, move.from, move.to, move.promotion || 'q');
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            triggerBotTurnIfNeeded(room);
          }
        } catch {}
      }, 700);
    }
  }

  // Ludo bot
  else if (gt === 'ludo' && game.status === 'playing') {
    const player = game.players[game.currentColor];
    if (player && player.isBot) {
      if (!game.awaitingMove) {
        setTimeout(() => {
          const res = rollLudoDice(game, player.id);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 700);
      } else if (game.movableTokens.length > 0) {
        setTimeout(() => {
          let chosen = game.movableTokens[0];
          for (const idx of game.movableTokens) {
            if (player.tokens[idx] + game.diceValue === 56) { chosen = idx; break; }
            if (player.tokens[idx] === -1 && game.diceValue === 6) { chosen = idx; break; }
          }
          moveLudoToken(game, player.id, chosen);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, 600);
      }
    }
  }

  // Connect 4 bot
  else if (gt === 'connect4' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        const col = getConnect4BotMove(game);
        handleConnect4Drop(game, player.id, col);
        io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }, 600);
    }
  }

  // Battleship bot
  else if (gt === 'battleship' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        const [r, c] = getBattleshipBotMove(game, player.id);
        handleBattleshipFire(game, player.id, r, c);
        io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }, 700);
    }
  }

  // Checkers bot
  else if (gt === 'checkers' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        const move = getCheckersBotMove(game);
        if (move) {
          handleCheckersMove(game, player.id, move.from, move.to);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }
      }, 700);
    }
  }

  // Memory Match bot
  else if (gt === 'memory_match' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot && game.currentFlips.length < 2) {
      setTimeout(() => {
        const unrevealed = [];
        game.deck.forEach((c, i) => {
          if (!c.isMatched && !c.isFlipped) unrevealed.push(i);
        });
        if (unrevealed.length > 0) {
          const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          const res = handleMemoryFlip(game, player.id, pick);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          if (res.needsReset) {
            setTimeout(() => {
              resetMemoryFlips(game);
              io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
              triggerBotTurnIfNeeded(room);
            }, 1100);
          } else {
            triggerBotTurnIfNeeded(room);
          }
        }
      }, 700);
    }
  }

  // Dots & Boxes bot
  else if (gt === 'dots_and_boxes' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        const move = getDotsBotMove(game);
        if (move) {
          handleDotsLineClick(game, player.id, move.type, move.r, move.c);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }
      }, 650);
    }
  }

  // Wordle Duel bot
  else if (gt === 'wordle_duel' && game.status === 'playing') {
    game.playerIds.forEach(id => {
      const p = game.players[id];
      if (p.isBot && !p.solved && p.guesses.length < game.maxGuesses) {
        setTimeout(() => {
          const guess = getWordleBotGuess(game, id);
          if (guess) {
            handleWordleGuess(game, id, guess);
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          }
        }, 1500 + Math.random() * 1000);
      }
    });
  }

  // 2048 bot
  else if (gt === 'game_2048' && game.status === 'playing') {
    game.playerIds.forEach(id => {
      const p = game.players[id];
      if (p.isBot && !p.gameOver) {
        const botTimer = setInterval(() => {
          if (!game || game.status !== 'playing' || p.gameOver) {
            clearInterval(botTimer);
            return;
          }
          const dir = get2048BotMove(game, id);
          handle2048Move(game, id, dir);
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
        }, 500);
      }
    });
  }
}

// Fallback to index.html for client routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('GameVerse Multi-Game Server Live.');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 GameVerse Multi-Arcade Server running on port ${PORT}`);
});
