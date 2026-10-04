// Authentic Ludo Game Engine (2 - 4 players)

export const COLOR_OFFSETS = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const SAFE_GLOBAL_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export function createLudoGame(playersList) {
  // playersList: array of 2 to 4 players
  const colors = ['red', 'green', 'yellow', 'blue'];
  const players = {};
  const activeOrder = [];

  playersList.slice(0, 4).forEach((p, idx) => {
    const color = colors[idx];
    activeOrder.push(color);
    players[color] = {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color,
      isBot: !!p.isBot,
      tokens: [-1, -1, -1, -1], // -1 is yard, 0..50 track, 51..55 home stretch, 56 is finished
      finishedTokens: 0,
      hasWon: false,
      rank: null
    };
  });

  return {
    gameType: 'ludo',
    status: 'playing', // 'playing' | 'game_over'
    activeOrder,
    currentTurnIndex: 0,
    currentColor: activeOrder[0],
    diceValue: null,
    consecutiveSixes: 0,
    awaitingMove: false,
    movableTokens: [],
    winner: null,
    winReason: '',
    rankings: [],
    history: []
  };
}

export function getGlobalPosition(color, step) {
  if (step < 0 || step > 50) return null;
  const offset = COLOR_OFFSETS[color];
  return (offset + step) % 52;
}

export function getMovableTokens(player, diceValue) {
  const movable = [];
  player.tokens.forEach((step, tokenIdx) => {
    if (step === 56) {
      // already in home
      return;
    }
    if (step === -1) {
      // In yard, needs a 6
      if (diceValue === 6) movable.push(tokenIdx);
    } else {
      // On track or home stretch
      if (step + diceValue <= 56) {
        movable.push(tokenIdx);
      }
    }
  });
  return movable;
}

export function rollLudoDice(game, playerId) {
  if (game.status !== 'playing') return { valid: false, message: 'Game is over' };
  if (game.awaitingMove) return { valid: false, message: 'Already rolled! Please move a token' };

  const currentColor = game.currentColor;
  const player = game.players[currentColor];
  if (player.id !== playerId && !player.isBot) {
    return { valid: false, message: 'Not your turn to roll' };
  }

  const dice = Math.floor(Math.random() * 6) + 1;
  game.diceValue = dice;

  if (dice === 6) {
    game.consecutiveSixes += 1;
  } else {
    game.consecutiveSixes = 0;
  }

  // If 3 consecutive sixes, forfeit turn
  if (game.consecutiveSixes === 3) {
    game.history.push(`${player.name} rolled three 6s in a row! Turn skipped.`);
    game.consecutiveSixes = 0;
    passToNextTurn(game);
    return { valid: true, dice, autoPassed: true, game };
  }

  const movable = getMovableTokens(player, dice);
  game.movableTokens = movable;

  if (movable.length === 0) {
    // No possible moves, pass turn
    game.history.push(`${player.name} rolled a ${dice} but has no valid moves.`);
    passToNextTurn(game);
    return { valid: true, dice, autoPassed: true, game };
  }

  game.awaitingMove = true;
  return { valid: true, dice, autoPassed: false, movable, game };
}

export function moveLudoToken(game, playerId, tokenIndex) {
  if (game.status !== 'playing' || !game.awaitingMove) {
    return { valid: false, message: 'Not waiting for token move' };
  }

  const currentColor = game.currentColor;
  const player = game.players[currentColor];
  if (player.id !== playerId && !player.isBot) {
    return { valid: false, message: 'Not your turn' };
  }

  if (!game.movableTokens.includes(tokenIndex)) {
    return { valid: false, message: 'This token cannot make that move' };
  }

  const currentStep = player.tokens[tokenIndex];
  const dice = game.diceValue;
  let newStep = currentStep;
  let bonusTurn = false;
  let capturedToken = null;

  if (currentStep === -1 && dice === 6) {
    newStep = 0; // enter track
    bonusTurn = true; // roll again on 6
  } else {
    newStep = currentStep + dice;
    if (dice === 6) bonusTurn = true;
  }

  player.tokens[tokenIndex] = newStep;

  // Check if token reached Home (56)
  if (newStep === 56) {
    player.finishedTokens += 1;
    bonusTurn = true; // bonus turn for reaching home!
    game.history.push(`🎯 ${player.name}'s token reached HOME!`);

    if (player.finishedTokens === 4) {
      player.hasWon = true;
      game.rankings.push(currentColor);
      player.rank = game.rankings.length;

      // In 2 player, game ends immediately. In 3-4 players, ends when 1 left.
      const unfinishedPlayers = game.activeOrder.filter(c => !game.players[c].hasWon);
      if (unfinishedPlayers.length <= 1) {
        game.status = 'game_over';
        game.winner = game.players[game.rankings[0]].id;
        game.winReason = `🎉 ${game.players[game.rankings[0]].name} wins the Ludo Championship! 🏆`;
        game.awaitingMove = false;
        return { valid: true, game };
      }
    }
  }

  // Check captures on track (0 <= newStep <= 50)
  if (newStep >= 0 && newStep <= 50) {
    const globalPos = getGlobalPosition(currentColor, newStep);
    if (!SAFE_GLOBAL_TILES.has(globalPos)) {
      // Check if any opponent token is here
      for (const otherColor of game.activeOrder) {
        if (otherColor === currentColor) continue;
        const otherPlayer = game.players[otherColor];
        otherPlayer.tokens.forEach((otherStep, idx) => {
          if (otherStep >= 0 && otherStep <= 50) {
            const otherGlobalPos = getGlobalPosition(otherColor, otherStep);
            if (otherGlobalPos === globalPos) {
              // CUT / CAPTURE!
              otherPlayer.tokens[idx] = -1; // back to yard
              bonusTurn = true; // capture bonus roll!
              capturedToken = { color: otherColor, tokenIndex: idx };
              game.history.push(`⚔️ ${player.name} captured ${otherPlayer.name}'s token! Bonus roll awarded!`);
            }
          }
        });
      }
    }
  }

  game.awaitingMove = false;
  game.movableTokens = [];

  if (bonusTurn && !player.hasWon) {
    // Player gets another roll!
    game.diceValue = null;
  } else {
    passToNextTurn(game);
  }

  return { valid: true, game, capturedToken };
}

function passToNextTurn(game) {
  game.awaitingMove = false;
  game.movableTokens = [];
  game.diceValue = null;
  game.consecutiveSixes = 0;

  let nextIdx = (game.currentTurnIndex + 1) % game.activeOrder.length;
  // Skip players who already finished
  let attempts = 0;
  while (game.players[game.activeOrder[nextIdx]].hasWon && attempts < game.activeOrder.length) {
    nextIdx = (nextIdx + 1) % game.activeOrder.length;
    attempts++;
  }

  game.currentTurnIndex = nextIdx;
  game.currentColor = game.activeOrder[nextIdx];
}
