// Pong / Air Hockey Duel Game Engine
// 800 x 500 Court

export const COURT_WIDTH = 800;
export const COURT_HEIGHT = 500;
export const PADDLE_HEIGHT = 90;
export const PADDLE_WIDTH = 14;
export const BALL_SIZE = 14;
export const WINNING_SCORE = 5;

export function createPongGame(player1, player2) {
  return {
    gameType: 'pong_duel',
    status: 'playing',
    scoreLimit: WINNING_SCORE,
    ball: {
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: 6 * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * 4 - 2)
    },
    players: {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        avatar: player1.avatar,
        side: 'left',
        isBot: !!player1.isBot,
        paddleY: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        score: 0
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        avatar: player2.avatar,
        side: 'right',
        isBot: !!player2.isBot,
        paddleY: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        score: 0
      }
    },
    playerIds: [player1.id, player2.id],
    winner: null,
    winReason: ''
  };
}

export function handlePaddleMove(game, playerId, targetY) {
  if (game.status !== 'playing') return game;
  const p = game.players[playerId];
  if (!p) return game;

  p.paddleY = Math.max(0, Math.min(COURT_HEIGHT - PADDLE_HEIGHT, targetY));
  return game;
}

export function tickPongGame(game) {
  if (game.status !== 'playing') return game;

  const [p1Id, p2Id] = game.playerIds;
  const p1 = game.players[p1Id];
  const p2 = game.players[p2Id];

  // Move ball
  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;

  // Bounce top & bottom
  if (game.ball.y <= 0) {
    game.ball.y = 0;
    game.ball.vy = -game.ball.vy;
  } else if (game.ball.y >= COURT_HEIGHT - BALL_SIZE) {
    game.ball.y = COURT_HEIGHT - BALL_SIZE;
    game.ball.vy = -game.ball.vy;
  }

  // Left paddle collision
  const p1PaddleX = 30;
  if (
    game.ball.x <= p1PaddleX + PADDLE_WIDTH &&
    game.ball.x >= p1PaddleX &&
    game.ball.y + BALL_SIZE >= p1.paddleY &&
    game.ball.y <= p1.paddleY + PADDLE_HEIGHT
  ) {
    game.ball.x = p1PaddleX + PADDLE_WIDTH;
    const impact = (game.ball.y + BALL_SIZE / 2) - (p1.paddleY + PADDLE_HEIGHT / 2);
    game.ball.vx = Math.abs(game.ball.vx) * 1.05; // speed up
    game.ball.vy = impact * 0.18;
  }

  // Right paddle collision
  const p2PaddleX = COURT_WIDTH - 30 - PADDLE_WIDTH;
  if (
    game.ball.x + BALL_SIZE >= p2PaddleX &&
    game.ball.x <= p2PaddleX + PADDLE_WIDTH &&
    game.ball.y + BALL_SIZE >= p2.paddleY &&
    game.ball.y <= p2.paddleY + PADDLE_HEIGHT
  ) {
    game.ball.x = p2PaddleX - BALL_SIZE;
    const impact = (game.ball.y + BALL_SIZE / 2) - (p2.paddleY + PADDLE_HEIGHT / 2);
    game.ball.vx = -Math.abs(game.ball.vx) * 1.05; // speed up
    game.ball.vy = impact * 0.18;
  }

  // Score points
  if (game.ball.x < 0) {
    // Player 2 scored
    p2.score += 1;
    resetBall(game, 1);
  } else if (game.ball.x > COURT_WIDTH) {
    // Player 1 scored
    p1.score += 1;
    resetBall(game, -1);
  }

  // Check win condition
  if (p1.score >= game.scoreLimit) {
    game.status = 'game_over';
    game.winner = p1.id;
    game.winReason = `⚡ ${p1.name} dominated the court (${p1.score} - ${p2.score})! 🏆`;
  } else if (p2.score >= game.scoreLimit) {
    game.status = 'game_over';
    game.winner = p2.id;
    game.winReason = `⚡ ${p2.name} dominated the court (${p2.score} - ${p1.score})! 🏆`;
  }

  return game;
}

function resetBall(game, serveDirection) {
  game.ball.x = COURT_WIDTH / 2;
  game.ball.y = COURT_HEIGHT / 2;
  game.ball.vx = 6 * serveDirection;
  game.ball.vy = (Math.random() * 4 - 2);
}

export function getPongBotY(game, botId) {
  const bot = game.players[botId];
  if (!bot) return COURT_HEIGHT / 2;

  // Bot tracks ball Y position with slight delay
  const target = game.ball.y - PADDLE_HEIGHT / 2;
  const current = bot.paddleY;
  const step = 6.5;

  if (target > current + 5) return current + step;
  if (target < current - 5) return current - step;
  return current;
}
