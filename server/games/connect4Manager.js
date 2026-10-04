// Connect 4 (Four in a Row) Game Engine
// 7 columns x 6 rows standard gravity grid

export const C4_ROWS = 6;
export const C4_COLS = 7;

export function createConnect4Game(playerRed, playerYellow) {
  return {
    gameType: 'connect4',
    status: 'playing', // 'playing' | 'game_over'
    board: Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(null)), // board[row][col]: 'R' | 'Y' | null (row 0 is top, row 5 is bottom)
    turn: 'R', // 'R' = Red, 'Y' = Yellow
    players: {
      R: { id: playerRed.id, name: playerRed.name, avatar: playerRed.avatar, color: 'R', isBot: !!playerRed.isBot, score: 0 },
      Y: { id: playerYellow.id, name: playerYellow.name, avatar: playerYellow.avatar, color: 'Y', isBot: !!playerYellow.isBot, score: 0 }
    },
    winningCells: null, // [[r, c], [r, c], [r, c], [r, c]]
    lastDrop: null, // { row, col, color }
    winner: null,
    winReason: ''
  };
}

export function handleConnect4Drop(game, playerId, col) {
  if (game.status !== 'playing') return { valid: false, message: 'Game is over' };
  if (col < 0 || col >= C4_COLS) return { valid: false, message: 'Invalid column' };

  const currentColor = game.turn;
  const player = game.players[currentColor];
  if (player.id !== playerId && !player.isBot) {
    return { valid: false, message: 'Not your turn' };
  }

  // Find lowest available row in column (gravity drop)
  let dropRow = -1;
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (game.board[r][col] === null) {
      dropRow = r;
      break;
    }
  }

  if (dropRow === -1) {
    return { valid: false, message: 'Column is full' };
  }

  game.board[dropRow][col] = currentColor;
  game.lastDrop = { row: dropRow, col, color: currentColor };

  // Check 4 in a row win condition
  const winLine = checkConnect4Win(game.board, dropRow, col, currentColor);
  if (winLine) {
    game.status = 'game_over';
    game.winningCells = winLine;
    game.winner = player.id;
    player.score += 1;
    game.winReason = `🎉 ${player.name} (${currentColor === 'R' ? 'Red' : 'Yellow'}) connected 4 in a row! 🏆`;
    return { valid: true, game };
  }

  // Check draw (board completely filled)
  let isFull = true;
  for (let c = 0; c < C4_COLS; c++) {
    if (game.board[0][c] === null) {
      isFull = false;
      break;
    }
  }

  if (isFull) {
    game.status = 'game_over';
    game.winner = 'draw';
    game.winReason = 'Board is full! The match is a draw! 🤝';
    return { valid: true, game };
  }

  // Switch turn
  game.turn = game.turn === 'R' ? 'Y' : 'R';
  return { valid: true, game };
}

function checkConnect4Win(board, r, c, color) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    let cells = [[r, c]];

    // forward in direction
    let step = 1;
    while (true) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && board[nr][nc] === color) {
        cells.push([nr, nc]);
        step++;
      } else {
        break;
      }
    }

    // backward in opposite direction
    step = 1;
    while (true) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && board[nr][nc] === color) {
        cells.push([nr, nc]);
        step++;
      } else {
        break;
      }
    }

    if (cells.length >= 4) {
      return cells;
    }
  }

  return null;
}

// Bot AI for Connect 4: Winning move -> Block opponent winning move -> Center bias
export function getConnect4BotMove(game) {
  const botColor = game.turn;
  const oppColor = botColor === 'R' ? 'Y' : 'R';

  // 1. Can bot win on next drop?
  for (let c = 0; c < C4_COLS; c++) {
    const row = getAvailableRow(game.board, c);
    if (row !== -1) {
      game.board[row][c] = botColor;
      const wins = checkConnect4Win(game.board, row, c, botColor);
      game.board[row][c] = null;
      if (wins) return c;
    }
  }

  // 2. Can opponent win on next drop? (Block them!)
  for (let c = 0; c < C4_COLS; c++) {
    const row = getAvailableRow(game.board, c);
    if (row !== -1) {
      game.board[row][c] = oppColor;
      const blocks = checkConnect4Win(game.board, row, c, oppColor);
      game.board[row][c] = null;
      if (blocks) return c;
    }
  }

  // 3. Prefer center columns: [3, 2, 4, 1, 5, 0, 6]
  const columnOrder = [3, 2, 4, 1, 5, 0, 6];
  for (const c of columnOrder) {
    if (getAvailableRow(game.board, c) !== -1) {
      return c;
    }
  }

  return 0;
}

function getAvailableRow(board, col) {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}
