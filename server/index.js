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
import { createArcadeGame } from './games/arcadeManager.js';
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
const roomTurnTimers = new Map();

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
    difficulty: room.difficulty || 'medium',
    maxPlayers: room.maxPlayers || 2,
    status: room.status,
    players: room.players,
    gameState: room.gameState,
    chat: room.chat,
    turnDeadline: room.turnDeadline || null,
    turnTimeLimit: 30
  };
}

function clearRoomInterval(roomCode) {
  if (roomTickIntervals.has(roomCode)) {
    clearInterval(roomTickIntervals.get(roomCode));
    roomTickIntervals.delete(roomCode);
  }
  if (roomTurnTimers.has(roomCode)) {
    clearTimeout(roomTurnTimers.get(roomCode));
    roomTurnTimers.delete(roomCode);
  }
}

function getActivePlayerId(room) {
  if (!room || !room.gameState) return null;
  const game = room.gameState;
  const gt = room.gameType;

  if (gt === 'chess') {
    return game.turn === 'w' ? game.players?.white?.id : game.players?.black?.id;
  }
  if (gt === 'ludo' || gt === 'tictactoe' || gt === 'connect4' || gt === 'battleship' || gt === 'checkers' || gt === 'memory_match' || gt === 'dots_and_boxes') {
    return game.currentTurn;
  }
  if (gt === 'hand_cricket') {
    if (game.status === 'toss') return game.toss?.callerId;
    if (game.status === 'choose_action') return game.toss?.winnerId;
    if (game.status === 'innings1') {
      const in1 = game.innings1;
      if (in1?.currentBatNum === null && in1?.currentBowlNum !== null) return in1.batsmanId;
      if (in1?.currentBowlNum === null && in1?.currentBatNum !== null) return in1.bowlerId;
      return in1?.batsmanId;
    }
    if (game.status === 'innings2') {
      const in2 = game.innings2;
      if (in2?.currentBatNum === null && in2?.currentBowlNum !== null) return in2.batsmanId;
      if (in2?.currentBowlNum === null && in2?.currentBatNum !== null) return in2.bowlerId;
      return in2?.batsmanId;
    }
  }
  if (game.turn) return game.turn;
  if (game.data?.currentTurn) return game.data.currentTurn;

  return null;
}

function handleTurnTimeout(room) {
  if (!room || room.status !== 'playing' || !room.gameState) return;
  const game = room.gameState;
  if (game.status === 'game_over') return;

  const gt = room.gameType;
  const activePlayerId = getActivePlayerId(room);
  if (!activePlayerId) return;

  const player = room.players.find(p => p.id === activePlayerId) || { name: 'Player' };
  const opponent = room.players.find(p => p.id !== activePlayerId) || room.players[0];

  // 1. Games that allow Passing Turn
  if (gt === 'ludo') {
    const idx = game.playerOrder.indexOf(game.currentTurn);
    game.currentTurn = game.playerOrder[(idx + 1) % game.playerOrder.length];
    game.turnPhase = 'roll';
    game.lastRoll = null;
    game.validMoves = [];
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} ran out of time (> 30s)! Turn passed to ${game.players[game.currentTurn]?.name || 'next player'}.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'memory_match') {
    game.currentTurn = opponent.id;
    game.flippedIndices = [];
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Turn passed to ${opponent.name}.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'battleship') {
    game.currentTurn = opponent.id;
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Torpedo turn passed to ${opponent.name}.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'dots_and_boxes') {
    game.currentTurn = opponent.id;
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Turn passed to ${opponent.name}.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'hand_cricket') {
    if (game.status === 'toss') {
      handleHandCricketToss(game, game.toss.callerId, 'heads');
    } else if (game.status === 'choose_action') {
      handleHandCricketActionChoice(game, game.toss.winnerId, 'bat');
    } else if (game.status === 'innings1' || game.status === 'innings2') {
      const randomNum = Math.floor(Math.random() * 6) + 1;
      handleHandCricketSelection(game, activePlayerId, randomNum);
    }
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Auto-selected move.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'othello') {
    game.turn = opponent.id;
    if (game.data) game.data.currentTurn = opponent.id;
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Turn passed to ${opponent.name}.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'greedy_dice') {
    if (game.data) {
      game.data.banked[activePlayerId] = (game.data.banked[activePlayerId] || 0) + (game.data.turnScore || 0);
      game.data.turnScore = 0;
      game.turn = opponent.id;
    }
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Points auto-banked and turn passed.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'color_cards') {
    if (game.data && game.data.hands && game.data.hands[activePlayerId]) {
      const colors = ['red', 'blue', 'green', 'yellow'];
      const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      game.data.hands[activePlayerId].push({
        color: colors[Math.floor(Math.random() * colors.length)],
        value: values[Math.floor(Math.random() * values.length)]
      });
      game.turn = opponent.id;
    }
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '⏱️',
      senderId: 'system',
      text: `${player.name} timed out (> 30s)! Drew a card and turn passed.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  } else if (gt === 'color_flood') {
    game.turn = opponent.id;
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    resetTurnTimer(room);
    triggerBotTurnIfNeeded(room);
  }

  // 2. Games without Pass-Turn Rule: Opponent Automatically Wins by Forfeit!
  else {
    game.status = 'game_over';
    game.winner = opponent.id;
    game.winReason = `⏰ ${player.name} ran out of time (> 30s)! ${opponent.name} wins by forfeit! 🏆`;
    room.chat.push({
      id: `sys_${Date.now()}`,
      sender: 'Timer ⏰',
      avatar: '🏆',
      senderId: 'system',
      text: `Game Over! ${player.name} took more than 30s. ${opponent.name} wins the match!`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    clearRoomInterval(room.code);
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
  }
}

function resetTurnTimer(room) {
  if (roomTurnTimers.has(room.code)) {
    clearTimeout(roomTurnTimers.get(room.code));
    roomTurnTimers.delete(room.code);
  }

  if (!room.gameState || room.status !== 'playing' || room.gameState.status === 'game_over') {
    room.turnDeadline = null;
    return;
  }

  // Check if this game is a turn-based game
  const activeId = getActivePlayerId(room);
  if (!activeId) {
    room.turnDeadline = null;
    return;
  }

  // 30 seconds turn deadline
  room.turnDeadline = Date.now() + 30000;

  const timer = setTimeout(() => {
    handleTurnTimeout(room);
  }, 30000);

  roomTurnTimers.set(room.code, timer);
}

io.on('connection', (socket) => {
  // 1. Create Room (supports difficulty)
  socket.on('create_room', ({ playerName, avatar, gameType = 'hand_cricket', difficulty = 'medium' }, callback) => {
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
      difficulty,
      maxPlayers: gameType === 'ludo' ? 4 : 2,
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

  // 3. Add Bot with difficulty badge
  socket.on('add_bot', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is full' });
      return;
    }

    const diff = room.difficulty || 'medium';
    const botPrefixes = { easy: 'Trainee', medium: 'Robo', hard: 'Master' };
    const botNames = ['Bot', 'Alpha', 'Matrix', 'Volt', 'Pixel', 'Nova'];
    const idx = room.players.length;

    const botPlayer = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${botPrefixes[diff]}${botNames[idx % botNames.length]}`,
      avatar: diff === 'hard' ? '🦾' : diff === 'medium' ? '🤖' : '🐣',
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

  // 5. Change Game & Difficulty
  socket.on('change_game', ({ roomCode, gameType, difficulty }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    clearRoomInterval(roomCode);
    if (gameType) {
      room.gameType = gameType;
      room.maxPlayers = gameType === 'ludo' ? 4 : 2;
      if (room.players.length > room.maxPlayers) {
        room.players = room.players.slice(0, room.maxPlayers);
      }
    }
    if (difficulty) {
      room.difficulty = difficulty;
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

    // Verify all human players are ready before allowing host to start
    const unreadyPlayer = room.players.find(p => !p.isHost && !p.isBot && !p.isReady);
    if (unreadyPlayer) {
      if (typeof callback === 'function') {
        callback({ success: false, message: `Cannot start match yet: ${unreadyPlayer.name} has not clicked "Ready"!` });
      }
      return;
    }

    clearRoomInterval(roomCode);
    initializeGame(room);
    resetTurnTimer(room);

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
    resetTurnTimer(room);

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

    // Classic 13 Games Handlers
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

    // 20 New Arcade Mini-Games General Action Handler
    else if (action === 'arcade_action') {
      handleArcadeAction(room, socket.id, payload);
    }

    if (room.gameState && room.status === 'playing') {
      resetTurnTimer(room);
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
  const diff = room.difficulty || 'medium';

  // 13 Classic Games
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
  // 20 New Arcade Games
  else {
    room.gameState = createArcadeGame(gt, p1, p2, diff);
  }
}

function handleArcadeAction(room, playerId, payload) {
  const game = room.gameState;
  const { subAction, data } = payload;
  const player = game.players[playerId];
  if (!player) return;

  if (game.gameType === 'rps_boom' && subAction === 'choose') {
    game.choices[playerId] = data.choice;
    const [p1Id, p2Id] = game.playerIds;
    if (game.choices[p1Id] && game.choices[p2Id]) {
      const c1 = game.choices[p1Id];
      const c2 = game.choices[p2Id];
      let roundWinner = null;

      const beats = {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
        bomb: ['rock', 'paper', 'scissors'],
        shield: ['bomb']
      };

      if (c1 === c2) roundWinner = 'tie';
      else if (beats[c1]?.includes(c2)) roundWinner = p1Id;
      else roundWinner = p2Id;

      if (roundWinner !== 'tie') {
        game.data.roundWins[roundWinner] += 1;
        game.players[roundWinner].score += 1;
      }

      game.history.push({ p1: c1, p2: c2, winner: roundWinner });
      game.choices = {};
      game.round += 1;

      // Check target wins
      if (game.data.roundWins[p1Id] >= game.data.targetWins || game.data.roundWins[p2Id] >= game.data.targetWins) {
        game.status = 'game_over';
        const winId = game.data.roundWins[p1Id] >= game.data.targetWins ? p1Id : p2Id;
        game.winner = winId;
        game.winReason = `🏆 ${game.players[winId].name} won the RPS Bomb Tournament!`;
      }

      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    } else {
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
      triggerBotTurnIfNeeded(room);
    }
  } else if (game.gameType === 'math_blitz' && subAction === 'answer') {
    const isCorrect = data.answer === game.data.question.answer;
    if (isCorrect) {
      player.score += 10;
      game.data.question = generateMathQuestion(room.difficulty || 'medium');
      game.round += 1;
      if (game.round > 5) {
        game.status = 'game_over';
        const [p1Id, p2Id] = game.playerIds;
        game.winner = game.players[p1Id].score > game.players[p2Id].score ? p1Id : p2Id;
        game.winReason = `🏆 ${game.players[game.winner].name} conquered the Mental Math Arena!`;
      }
      io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
    }
  } else if (game.gameType === 'reaction_tap' && subAction === 'tap') {
    player.score += 1;
    game.status = 'game_over';
    game.winner = playerId;
    game.winReason = `⚡ ${player.name} reacted with lightning speed (${data.ms || 240}ms)! 🏆`;
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
  } else {
    // Specialized & generic score addition / game over
    if (data?.score !== undefined) {
      player.score = data.score;
    }
    if (data?.gameOver) {
      game.status = 'game_over';
      game.winner = data.winner || playerId;
      game.winReason = data.winReason || `🎉 ${game.players[game.winner]?.name || player.name} won the match! 🏆`;
      clearRoomInterval(room.code);
    }
    io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
  }
}

function startSnakeInterval(room) {
  clearRoomInterval(room.code);
  const speed = room.difficulty === 'hard' ? 120 : room.difficulty === 'easy' ? 200 : 160;
  const interval = setInterval(() => {
    if (!room.gameState || room.status !== 'playing' || room.gameState.status !== 'playing') {
      clearRoomInterval(room.code);
      return;
    }
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
  }, speed);
  roomTickIntervals.set(room.code, interval);
}

function startPongInterval(room) {
  clearRoomInterval(room.code);
  const interval = setInterval(() => {
    if (!room.gameState || room.status !== 'playing' || room.gameState.status !== 'playing') {
      clearRoomInterval(room.code);
      return;
    }
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

// Bot AI Dispatcher with Easy / Medium / Hard scaling
function triggerBotTurnIfNeeded(room) {
  if (!room.gameState || room.status !== 'playing') return;

  const game = room.gameState;
  const gt = room.gameType;
  const diff = room.difficulty || 'medium';

  // Bot response delay scales by difficulty:
  // Hard: 250 - 450ms | Medium: 550 - 750ms | Easy: 850 - 1200ms
  const baseDelay = diff === 'hard' ? 300 : diff === 'easy' ? 900 : 600;

  // Hand cricket bot
  if (gt === 'hand_cricket') {
    if (game.status === 'toss') {
      const caller = room.players.find(p => p.id === game.toss.callerId);
      if (caller && caller.isBot) {
        setTimeout(() => {
          handleHandCricketToss(game, caller.id, Math.random() < 0.5 ? 'heads' : 'tails');
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, baseDelay);
      }
    } else if (game.status === 'choose_action') {
      const winner = room.players.find(p => p.id === game.toss.winnerId);
      if (winner && winner.isBot) {
        setTimeout(() => {
          handleHandCricketActionChoice(game, winner.id, Math.random() < 0.6 ? 'bat' : 'bowl');
          io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
          triggerBotTurnIfNeeded(room);
        }, baseDelay);
      }
    } else if (game.status === 'innings1' || game.status === 'innings2') {
      [game.currentBatsmanId, game.currentBowlerId].forEach(id => {
        const p = room.players.find(pl => pl.id === id);
        if (p && p.isBot && game.currentTurnSelections[p.id] === undefined) {
          setTimeout(() => {
            let weights = [1, 2, 3, 4, 5, 6];
            if (diff === 'hard') weights = [4, 6, 4, 6, 2, 1];
            else if (diff === 'easy') weights = [1, 2, 3, 1, 2, 3];
            const num = weights[Math.floor(Math.random() * weights.length)];
            const { resolved } = handleHandCricketSelection(game, p.id, num);
            io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
            if (!resolved) triggerBotTurnIfNeeded(room);
          }, baseDelay);
        }
      });
    }
  }

  // Connect 4 bot
  else if (gt === 'connect4' && game.status === 'playing') {
    const player = game.players[game.turn];
    if (player && player.isBot) {
      setTimeout(() => {
        let col = getConnect4BotMove(game);
        if (diff === 'easy' && Math.random() < 0.4) {
          col = Math.floor(Math.random() * 7);
        }
        handleConnect4Drop(game, player.id, col);
        io.to(room.code).emit('game_state_updated', getSafeRoomData(room));
        triggerBotTurnIfNeeded(room);
      }, baseDelay);
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
      }, baseDelay);
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
      }, baseDelay);
    }
  }

  // RPS Boom bot
  else if (gt === 'rps_boom' && game.status === 'playing') {
    const bot = room.players.find(p => p.isBot);
    if (bot && !game.choices[bot.id]) {
      setTimeout(() => {
        const choices = ['rock', 'paper', 'scissors', 'bomb', 'shield'];
        const choice = choices[Math.floor(Math.random() * choices.length)];
        handleArcadeAction(room, bot.id, { subAction: 'choose', data: { choice } });
      }, baseDelay);
    }
  }

  // Math Blitz bot
  else if (gt === 'math_blitz' && game.status === 'playing') {
    const bot = room.players.find(p => p.isBot);
    if (bot) {
      const mathTimer = setTimeout(() => {
        if (!game || game.status !== 'playing') return;
        const answer = diff === 'hard' ? game.data.question.answer : (Math.random() < 0.75 ? game.data.question.answer : game.data.question.options[0]);
        handleArcadeAction(room, bot.id, { subAction: 'answer', data: { answer } });
      }, diff === 'hard' ? 2000 : diff === 'medium' ? 3500 : 5500);
    }
  }

  // Reaction Tap bot
  else if (gt === 'reaction_tap' && game.status === 'playing') {
    const bot = room.players.find(p => p.isBot);
    if (bot) {
      const tapTime = diff === 'hard' ? 220 : diff === 'medium' ? 340 : 480;
      setTimeout(() => {
        if (game.status === 'playing') {
          handleArcadeAction(room, bot.id, { subAction: 'tap', data: { ms: tapTime } });
        }
      }, tapTime);
    }
  }
}

function generateMathQuestion(difficulty) {
  const max = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
  const ops = difficulty === 'easy' ? ['+', '-'] : ['+', '-', 'x'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * (op === 'x' ? 12 : max)) + 1;

  let answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const options = [answer, answer + 2, answer - 3, answer + 5].sort(() => Math.random() - 0.5);

  return { text: `${a} ${op} ${b} = ?`, answer, options };
}

// Fallback to index.html for client routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('GameVerse Multi-Arcade Server Live.');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 GameVerse 33-Game Arcade Server running on port ${PORT}`);
});
