// Tic-Tac-Toe Game Engine

export function createTicTacToeGame(playerX, playerO) {
  return {
    gameType: 'tictactoe',
    status: 'playing', // 'playing' | 'game_over'
    board: Array(9).fill(null), // 0..8
    turn: 'X',
    players: {
      X: { id: playerX.id, name: playerX.name, avatar: playerX.avatar, symbol: 'X', isBot: !!playerX.isBot, score: 0 },
      O: { id: playerO.id, name: playerO.name, avatar: playerO.avatar, symbol: 'O', isBot: !!playerO.isBot, score: 0 }
    },
    winningLine: null,
    winner: null,
    winReason: ''
  };
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export function handleTicTacToeMove(game, playerId, cellIndex) {
  if (game.status !== 'playing') return { valid: false, message: 'Game is over' };
  if (cellIndex < 0 || cellIndex > 8) return { valid: false, message: 'Invalid cell' };
  if (game.board[cellIndex] !== null) return { valid: false, message: 'Cell already occupied' };

  const currentSymbol = game.turn;
  const player = game.players[currentSymbol];
  if (player.id !== playerId && !player.isBot) {
    return { valid: false, message: 'Not your turn' };
  }

  game.board[cellIndex] = currentSymbol;

  // Check win
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
      game.status = 'game_over';
      game.winningLine = combo;
      game.winner = player.id;
      player.score += 1;
      game.winReason = `🎉 ${player.name} (${currentSymbol}) won the round! 🏆`;
      return { valid: true, game };
    }
  }

  // Check draw
  if (game.board.every(cell => cell !== null)) {
    game.status = 'game_over';
    game.winner = 'draw';
    game.winReason = 'Well played! The round ended in a draw! 🤝';
    return { valid: true, game };
  }

  // Switch turn
  game.turn = game.turn === 'X' ? 'O' : 'X';
  return { valid: true, game };
}

export function resetTicTacToeBoard(game) {
  game.board = Array(9).fill(null);
  game.status = 'playing';
  game.winningLine = null;
  game.winner = null;
  game.winReason = '';
  // Alternate starting player
  game.turn = Math.random() < 0.5 ? 'X' : 'O';
  return game;
}
