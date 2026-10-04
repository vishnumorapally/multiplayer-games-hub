import { Chess } from 'chess.js';

export function createChessGame(playerWhite, playerBlack, timerMinutes = 10) {
  const chess = new Chess();
  return {
    gameType: 'chess',
    status: 'playing', // 'playing' | 'game_over'
    fen: chess.fen(),
    turn: 'w',
    players: {
      w: { id: playerWhite.id, name: playerWhite.name, avatar: playerWhite.avatar, color: 'w', isBot: !!playerWhite.isBot, timeLeft: timerMinutes * 60 },
      b: { id: playerBlack.id, name: playerBlack.name, avatar: playerBlack.avatar, color: 'b', isBot: !!playerBlack.isBot, timeLeft: timerMinutes * 60 },
    },
    timerMinutes,
    history: [],
    lastMove: null,
    inCheck: false,
    winner: null,
    winReason: ''
  };
}

export function handleChessMove(game, playerId, from, to, promotion = 'q') {
  if (game.status !== 'playing') return { valid: false, message: 'Game is not active' };

  const activeColor = game.turn;
  const player = game.players[activeColor];
  if (player.id !== playerId) {
    return { valid: false, message: 'Not your turn' };
  }

  const chess = new Chess(game.fen);
  try {
    const move = chess.move({ from, to, promotion });
    if (!move) {
      return { valid: false, message: 'Illegal move' };
    }

    game.fen = chess.fen();
    game.turn = chess.turn();
    game.lastMove = { from, to, san: move.san, piece: move.piece, color: move.color, captured: move.captured };
    game.history.push(move.san);
    game.inCheck = chess.inCheck();

    if (chess.isCheckmate()) {
      game.status = 'game_over';
      game.winner = player.id;
      game.winReason = `Checkmate! ${player.name} (${activeColor === 'w' ? 'White' : 'Black'}) wins! ♟️👑`;
    } else if (chess.isDraw()) {
      game.status = 'game_over';
      game.winner = 'draw';
      let drawType = 'Draw';
      if (chess.isStalemate()) drawType = 'Stalemate';
      else if (chess.isThreefoldRepetition()) drawType = 'Threefold repetition';
      else if (chess.isInsufficientMaterial()) drawType = 'Insufficient material';
      game.winReason = `Game drawn by ${drawType}! 🤝`;
    }

    return { valid: true, game };
  } catch (err) {
    return { valid: false, message: err.message };
  }
}

export function getLegalMoves(fen, square) {
  try {
    const chess = new Chess(fen);
    return chess.moves({ square, verbose: true }).map(m => ({
      from: m.from,
      to: m.to,
      flags: m.flags,
      san: m.san,
      captured: m.captured
    }));
  } catch {
    return [];
  }
}
