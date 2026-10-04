// Checkers (Draughts) Game Engine
// 8x8 Board on dark squares

export function createCheckersGame(playerRed, playerBlack) {
  // 8x8 board: null | 'r' | 'b' | 'R' (King) | 'B' (King)
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Initialize Black pieces on top (rows 0, 1, 2) on dark squares ((r + c) % 2 === 1)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'b';
    }
  }

  // Initialize Red pieces on bottom (rows 5, 6, 7) on dark squares
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'r';
    }
  }

  return {
    gameType: 'checkers',
    status: 'playing',
    board,
    turn: 'r', // 'r' starts
    players: {
      r: { id: playerRed.id, name: playerRed.name, avatar: playerRed.avatar, color: 'r', isBot: !!playerRed.isBot, piecesLeft: 12 },
      b: { id: playerBlack.id, name: playerBlack.name, avatar: playerBlack.avatar, color: 'b', isBot: !!playerBlack.isBot, piecesLeft: 12 }
    },
    lastMove: null,
    winner: null,
    winReason: ''
  };
}

export function getLegalCheckersMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const isRed = piece.toLowerCase() === 'r';
  const isKing = piece === 'R' || piece === 'B';
  const oppColor = isRed ? 'b' : 'r';

  const moves = [];
  const jumps = [];

  // Direction vectors
  const forwardDirections = isRed ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  const allDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const directions = isKing ? allDirections : forwardDirections;

  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;

    // Regular move
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
      moves.push({ from: [r, c], to: [nr, nc], isJump: false });
    }

    // Jump capture
    const jumpR = r + dr * 2;
    const jumpC = c + dc * 2;
    if (
      jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 &&
      board[nr][nc] && board[nr][nc].toLowerCase() === oppColor &&
      board[jumpR][jumpC] === null
    ) {
      jumps.push({ from: [r, c], to: [jumpR, jumpC], jumped: [nr, nc], isJump: true });
    }
  }

  // In standard checkers, if any jump is available, it is prioritized
  return jumps.length > 0 ? jumps : moves;
}

export function handleCheckersMove(game, playerId, from, to) {
  if (game.status !== 'playing') return { valid: false, message: 'Game over' };

  const currentColor = game.turn;
  const player = game.players[currentColor];
  if (player.id !== playerId && !player.isBot) {
    return { valid: false, message: 'Not your turn' };
  }

  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = game.board[fr][fc];

  if (!piece || piece.toLowerCase() !== currentColor) {
    return { valid: false, message: 'Invalid piece selected' };
  }

  const legalMoves = getLegalCheckersMoves(game.board, fr, fc);
  const chosenMove = legalMoves.find(m => m.to[0] === tr && m.to[1] === tc);

  if (!chosenMove) {
    return { valid: false, message: 'Illegal move' };
  }

  // Execute move
  game.board[fr][fc] = null;
  let finalPiece = piece;

  // King promotion check: red reaches row 0, black reaches row 7
  if (currentColor === 'r' && tr === 0) finalPiece = 'R';
  if (currentColor === 'b' && tr === 7) finalPiece = 'B';
  game.board[tr][tc] = finalPiece;

  // If jump, remove captured piece
  if (chosenMove.isJump) {
    const [jr, jc] = chosenMove.jumped;
    game.board[jr][jc] = null;
    const oppColor = currentColor === 'r' ? 'b' : 'r';
    game.players[oppColor].piecesLeft -= 1;
  }

  game.lastMove = { from, to, isJump: chosenMove.isJump };

  // Check victory condition
  const oppColor = currentColor === 'r' ? 'b' : 'r';
  if (game.players[oppColor].piecesLeft <= 0) {
    game.status = 'game_over';
    game.winner = player.id;
    game.winReason = `🎉 ${player.name} (${currentColor === 'r' ? 'Red' : 'Black'}) captured all enemy pieces! 🏆`;
    return { valid: true, game };
  }

  // Switch turn
  game.turn = oppColor;
  return { valid: true, game };
}

export function getCheckersBotMove(game) {
  const botColor = game.turn;
  const allMoves = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (game.board[r][c] && game.board[r][c].toLowerCase() === botColor) {
        const moves = getLegalCheckersMoves(game.board, r, c);
        moves.forEach(m => allMoves.push(m));
      }
    }
  }

  if (allMoves.length === 0) return null;

  // Prioritize jump captures
  const jumps = allMoves.filter(m => m.isJump);
  if (jumps.length > 0) {
    return jumps[Math.floor(Math.random() * jumps.length)];
  }

  return allMoves[Math.floor(Math.random() * allMoves.length)];
}
