// Dots & Boxes Game Engine
// 4x4 Dots = 3x3 Boxes (9 boxes total)
// Horizontal lines: 4 rows x 3 cols = 12 lines
// Vertical lines: 3 rows x 4 cols = 12 lines
// Total lines: 24

export const DOTS_GRID = 4;
export const TOTAL_BOXES = (DOTS_GRID - 1) * (DOTS_GRID - 1); // 9

export function createDotsAndBoxesGame(player1, player2) {
  return {
    gameType: 'dots_and_boxes',
    status: 'playing',
    turn: player1.id,
    players: {
      [player1.id]: { id: player1.id, name: player1.name, avatar: player1.avatar, color: '#6366f1', isBot: !!player1.isBot, score: 0 },
      [player2.id]: { id: player2.id, name: player2.name, avatar: player2.avatar, color: '#f43f5e', isBot: !!player2.isBot, score: 0 }
    },
    playerIds: [player1.id, player2.id],
    hLines: Array(DOTS_GRID).fill(null).map(() => Array(DOTS_GRID - 1).fill(null)), // hLines[r][c]: playerId
    vLines: Array(DOTS_GRID - 1).fill(null).map(() => Array(DOTS_GRID).fill(null)), // vLines[r][c]: playerId
    boxes: Array(DOTS_GRID - 1).fill(null).map(() => Array(DOTS_GRID - 1).fill(null)), // boxes[r][c]: playerId
    claimedBoxesCount: 0,
    lastLine: null,
    winner: null,
    winReason: ''
  };
}

export function handleDotsLineClick(game, playerId, type, r, c) {
  if (game.status !== 'playing') return { valid: false, message: 'Game over' };
  if (game.turn !== playerId && !game.players[game.turn].isBot) {
    return { valid: false, message: 'Not your turn' };
  }

  // Validate line
  if (type === 'h') {
    if (r < 0 || r >= DOTS_GRID || c < 0 || c >= DOTS_GRID - 1) return { valid: false };
    if (game.hLines[r][c] !== null) return { valid: false, message: 'Line already drawn' };
    game.hLines[r][c] = playerId;
  } else if (type === 'v') {
    if (r < 0 || r >= DOTS_GRID - 1 || c < 0 || c >= DOTS_GRID) return { valid: false };
    if (game.vLines[r][c] !== null) return { valid: false, message: 'Line already drawn' };
    game.vLines[r][c] = playerId;
  } else {
    return { valid: false };
  }

  game.lastLine = { type, r, c };

  // Check if any box was completed by this move
  let boxesCompletedThisTurn = 0;
  for (let br = 0; br < DOTS_GRID - 1; br++) {
    for (let bc = 0; bc < DOTS_GRID - 1; bc++) {
      if (game.boxes[br][bc] === null) {
        const top = game.hLines[br][bc] !== null;
        const bottom = game.hLines[br + 1][bc] !== null;
        const left = game.vLines[br][bc] !== null;
        const right = game.vLines[br][bc + 1] !== null;

        if (top && bottom && left && right) {
          game.boxes[br][bc] = playerId;
          game.players[playerId].score += 1;
          game.claimedBoxesCount += 1;
          boxesCompletedThisTurn++;
        }
      }
    }
  }

  // Check end condition
  if (game.claimedBoxesCount === TOTAL_BOXES) {
    game.status = 'game_over';
    const otherId = game.playerIds.find(id => id !== playerId);
    const p1 = game.players[playerId];
    const p2 = game.players[otherId];

    if (p1.score > p2.score) {
      game.winner = p1.id;
      game.winReason = `🎉 ${p1.name} captured ${p1.score} boxes to claim victory! 🏆`;
    } else if (p2.score > p1.score) {
      game.winner = p2.id;
      game.winReason = `🎉 ${p2.name} captured ${p2.score} boxes to claim victory! 🏆`;
    } else {
      game.winner = 'draw';
      game.winReason = `Tie! Both captured ${p1.score} boxes! 🤝`;
    }
    return { valid: true, game };
  }

  // If a box was completed, player gets another turn; otherwise turn passes
  if (boxesCompletedThisTurn === 0) {
    const otherId = game.playerIds.find(id => id !== playerId);
    game.turn = otherId;
  }

  return { valid: true, game };
}

export function getDotsBotMove(game) {
  const availableMoves = [];

  // Check available horizontal lines
  for (let r = 0; r < DOTS_GRID; r++) {
    for (let c = 0; c < DOTS_GRID - 1; c++) {
      if (game.hLines[r][c] === null) availableMoves.push({ type: 'h', r, c });
    }
  }

  // Check available vertical lines
  for (let r = 0; r < DOTS_GRID - 1; r++) {
    for (let c = 0; c < DOTS_GRID; c++) {
      if (game.vLines[r][c] === null) availableMoves.push({ type: 'v', r, c });
    }
  }

  if (availableMoves.length === 0) return null;

  // 1. Prioritize completing any box
  for (const move of availableMoves) {
    // Test if this line completes a box
    let completes = false;
    for (let br = 0; br < DOTS_GRID - 1; br++) {
      for (let bc = 0; bc < DOTS_GRID - 1; bc++) {
        if (game.boxes[br][bc] === null) {
          const top = (move.type === 'h' && move.r === br && move.c === bc) || game.hLines[br][bc] !== null;
          const bottom = (move.type === 'h' && move.r === br + 1 && move.c === bc) || game.hLines[br + 1][bc] !== null;
          const left = (move.type === 'v' && move.r === br && move.c === bc) || game.vLines[br][bc] !== null;
          const right = (move.type === 'v' && move.r === br && move.c === bc + 1) || game.vLines[br][bc + 1] !== null;
          if (top && bottom && left && right) {
            completes = true;
            break;
          }
        }
      }
      if (completes) break;
    }
    if (completes) return move;
  }

  // 2. Otherwise pick random available line
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}
