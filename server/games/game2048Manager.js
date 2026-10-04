// 2048 Speed Rush Game Engine
// 4x4 Grid sliding merge puzzle with live head-to-head score comparison

export function create2048Game(player1, player2) {
  const p1Board = spawnTile(spawnTile(Array(4).fill(null).map(() => Array(4).fill(0))));
  const p2Board = spawnTile(spawnTile(Array(4).fill(null).map(() => Array(4).fill(0))));

  return {
    gameType: 'game_2048',
    status: 'playing',
    targetTile: 2048,
    durationSeconds: 90,
    startTime: Date.now(),
    players: {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        avatar: player1.avatar,
        isBot: !!player1.isBot,
        board: p1Board,
        score: 0,
        highestTile: 4,
        gameOver: false
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        avatar: player2.avatar,
        isBot: !!player2.isBot,
        board: p2Board,
        score: 0,
        highestTile: 4,
        gameOver: false
      }
    },
    playerIds: [player1.id, player2.id],
    winner: null,
    winReason: ''
  };
}

export function handle2048Move(game, playerId, direction) {
  if (game.status !== 'playing') return { valid: false, message: 'Game over' };

  const player = game.players[playerId];
  if (!player || player.gameOver) return { valid: false };

  const { newBoard, scoreGained, moved } = slide2048(player.board, direction);
  if (!moved) return { valid: false, message: 'No tiles moved' };

  player.board = spawnTile(newBoard);
  player.score += scoreGained;

  // Track highest tile
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (player.board[r][c] > player.highestTile) {
        player.highestTile = player.board[r][c];
      }
    }
  }

  // Check 2048 victory condition
  if (player.highestTile >= game.targetTile) {
    game.status = 'game_over';
    game.winner = playerId;
    game.winReason = `🔥 LEGENDARY! ${player.name} reached the ${game.targetTile} tile! 🏆`;
    return { valid: true, game };
  }

  // Check if no moves possible
  if (check2048GameOver(player.board)) {
    player.gameOver = true;
    const otherId = game.playerIds.find(id => id !== playerId);
    const otherPlayer = game.players[otherId];

    if (otherPlayer.gameOver) {
      game.status = 'game_over';
      if (player.score > otherPlayer.score) {
        game.winner = playerId;
        game.winReason = `🎉 ${player.name} wins with a score of ${player.score}! 🏆`;
      } else {
        game.winner = otherId;
        game.winReason = `🎉 ${otherPlayer.name} wins with a score of ${otherPlayer.score}! 🏆`;
      }
    }
  }

  return { valid: true, game };
}

function spawnTile(board) {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return board;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slide2048(board, direction) {
  let moved = false;
  let scoreGained = 0;
  const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));

  const rotate = (b) => b[0].map((_, i) => b.map(row => row[i]).reverse());
  const rotateBack = (b, times) => {
    let res = b;
    for (let i = 0; i < (4 - times) % 4; i++) res = rotate(res);
    return res;
  };

  const rotations = { left: 0, up: 3, right: 2, down: 1 }[direction] || 0;
  let rotated = board;
  for (let i = 0; i < rotations; i++) rotated = rotate(rotated);

  for (let r = 0; r < 4; r++) {
    const row = rotated[r].filter(val => val !== 0);
    const mergedRow = [];

    for (let i = 0; i < row.length; i++) {
      if (i < row.length - 1 && row[i] === row[i + 1]) {
        const mergedVal = row[i] * 2;
        mergedRow.push(mergedVal);
        scoreGained += mergedVal;
        i++;
      } else {
        mergedRow.push(row[i]);
      }
    }

    while (mergedRow.length < 4) mergedRow.push(0);

    for (let c = 0; c < 4; c++) {
      newBoard[r][c] = mergedRow[c];
      if (newBoard[r][c] !== rotated[r][c]) moved = true;
    }
  }

  const finalBoard = rotateBack(newBoard, rotations);
  return { newBoard: finalBoard, scoreGained, moved };
}

function check2048GameOver(board) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
    }
  }
  return true;
}

export function get2048BotMove(game, botId) {
  const directions = ['left', 'down', 'right', 'up'];
  // Prefer down and left corner packing
  const weights = ['down', 'left', 'down', 'left', 'right', 'up'];
  return weights[Math.floor(Math.random() * weights.length)];
}
