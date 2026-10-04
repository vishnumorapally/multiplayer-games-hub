// Realtime Snake Arena Battle Game Engine
// 24x24 Grid 2-Player Combat

export const SNAKE_GRID = 24;

export function createSnakeGame(player1, player2) {
  return {
    gameType: 'snake_battle',
    status: 'playing',
    gridSize: SNAKE_GRID,
    food: [12, 12],
    players: {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        avatar: player1.avatar,
        color: '#10b981', // Emerald
        isBot: !!player1.isBot,
        body: [[4, 4], [4, 3], [4, 2]],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        score: 0,
        alive: true
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        avatar: player2.avatar,
        color: '#a855f7', // Purple
        isBot: !!player2.isBot,
        body: [[19, 19], [19, 20], [19, 21]],
        direction: 'LEFT',
        nextDirection: 'LEFT',
        score: 0,
        alive: true
      }
    },
    playerIds: [player1.id, player2.id],
    winner: null,
    winReason: ''
  };
}

export function handleSnakeDirection(game, playerId, newDir) {
  if (game.status !== 'playing') return game;
  const p = game.players[playerId];
  if (!p || !p.alive) return game;

  const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
  if (opposites[p.direction] !== newDir) {
    p.nextDirection = newDir;
  }
  return game;
}

export function tickSnakeGame(game) {
  if (game.status !== 'playing') return game;

  const [p1Id, p2Id] = game.playerIds;
  const p1 = game.players[p1Id];
  const p2 = game.players[p2Id];

  // Move each snake
  [p1, p2].forEach(p => {
    if (!p.alive) return;
    p.direction = p.nextDirection;
    const [hr, hc] = p.body[0];
    let nr = hr;
    let nc = hc;

    if (p.direction === 'UP') nr--;
    else if (p.direction === 'DOWN') nr++;
    else if (p.direction === 'LEFT') nc--;
    else if (p.direction === 'RIGHT') nc++;

    // Check wall collision
    if (nr < 0 || nr >= SNAKE_GRID || nc < 0 || nc >= SNAKE_GRID) {
      p.alive = false;
      return;
    }

    // Check self-collision
    if (p.body.slice(0, -1).some(([r, c]) => r === nr && c === nc)) {
      p.alive = false;
      return;
    }

    // Add new head
    p.body.unshift([nr, nc]);

    // Check food eaten
    if (nr === game.food[0] && nc === game.food[1]) {
      p.score += 10;
      spawnFood(game);
    } else {
      p.body.pop();
    }
  });

  // Check collision against opponent's body
  if (p1.alive && p2.body.some(([r, c]) => r === p1.body[0][0] && c === p1.body[0][1])) {
    p1.alive = false;
  }
  if (p2.alive && p1.body.some(([r, c]) => r === p2.body[0][0] && c === p2.body[0][1])) {
    p2.alive = false;
  }

  // Evaluate winner
  if (!p1.alive && !p2.alive) {
    game.status = 'game_over';
    game.winner = 'draw';
    game.winReason = 'Mutual crash! The match ends in a draw! 🤝';
  } else if (!p1.alive) {
    game.status = 'game_over';
    game.winner = p2.id;
    game.winReason = `💥 ${p1.name} crashed! ${p2.name} wins the Snake Arena! 🏆`;
  } else if (!p2.alive) {
    game.status = 'game_over';
    game.winner = p1.id;
    game.winReason = `💥 ${p2.name} crashed! ${p1.name} wins the Snake Arena! 🏆`;
  }

  return game;
}

function spawnFood(game) {
  const occupied = new Set();
  game.playerIds.forEach(id => {
    game.players[id].body.forEach(([r, c]) => occupied.add(`${r},${c}`));
  });

  let attempts = 0;
  while (attempts < 100) {
    const r = Math.floor(Math.random() * SNAKE_GRID);
    const c = Math.floor(Math.random() * SNAKE_GRID);
    if (!occupied.has(`${r},${c}`)) {
      game.food = [r, c];
      return;
    }
    attempts++;
  }
}

export function getSnakeBotDirection(game, botId) {
  const bot = game.players[botId];
  if (!bot || !bot.alive) return 'UP';

  const [hr, hc] = bot.body[0];
  const [fr, fc] = game.food;

  const candidates = [];
  if (fr < hr) candidates.push('UP');
  if (fr > hr) candidates.push('DOWN');
  if (fc < hc) candidates.push('LEFT');
  if (fc > hc) candidates.push('RIGHT');

  const allDirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const safeDirs = allDirs.filter(dir => {
    let nr = hr, nc = hc;
    if (dir === 'UP') nr--;
    else if (dir === 'DOWN') nr++;
    else if (dir === 'LEFT') nc--;
    else if (dir === 'RIGHT') nc++;

    if (nr < 0 || nr >= SNAKE_GRID || nc < 0 || nc >= SNAKE_GRID) return false;
    // Check self or opponent body
    for (const pid of game.playerIds) {
      if (game.players[pid].body.some(([r, c]) => r === nr && c === nc)) return false;
    }
    return true;
  });

  const preferred = candidates.find(d => safeDirs.includes(d));
  return preferred || safeDirs[0] || bot.direction;
}
