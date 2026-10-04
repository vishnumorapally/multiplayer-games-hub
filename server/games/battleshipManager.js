// Battleship (Sea Battle) Game Engine
// 10x10 Grid with 5 standard naval ships

export const BS_SIZE = 10;
export const SHIPS_CONFIG = [
  { name: 'Carrier', size: 5, icon: '🚢' },
  { name: 'Battleship', size: 4, icon: '🛳️' },
  { name: 'Cruiser', size: 3, icon: '🚤' },
  { name: 'Submarine', size: 3, icon: '🤿' },
  { name: 'Destroyer', size: 2, icon: '⛵' }
];

export function createBattleshipGame(player1, player2) {
  const p1Fleet = generateRandomFleet();
  const p2Fleet = generateRandomFleet();

  return {
    gameType: 'battleship',
    status: 'playing', // 'playing' | 'game_over'
    turn: player1.id,
    players: {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        avatar: player1.avatar,
        isBot: !!player1.isBot,
        fleet: p1Fleet.ships,
        board: p1Fleet.board, // 10x10: ship names or null
        shotsReceived: Array(BS_SIZE).fill(null).map(() => Array(BS_SIZE).fill(null)), // 'hit' | 'miss' | null
        shipsSunk: 0
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        avatar: player2.avatar,
        isBot: !!player2.isBot,
        fleet: p2Fleet.ships,
        board: p2Fleet.board,
        shotsReceived: Array(BS_SIZE).fill(null).map(() => Array(BS_SIZE).fill(null)),
        shipsSunk: 0
      }
    },
    playerIds: [player1.id, player2.id],
    lastShot: null, // { attackerId, row, col, result: 'hit' | 'miss', sunkShip: string | null }
    winner: null,
    winReason: ''
  };
}

export function handleBattleshipFire(game, attackerId, r, c) {
  if (game.status !== 'playing') return { valid: false, message: 'Game is over' };
  if (game.turn !== attackerId && !game.players[game.turn].isBot) {
    return { valid: false, message: 'Not your turn to fire' };
  }
  if (r < 0 || r >= BS_SIZE || c < 0 || c >= BS_SIZE) {
    return { valid: false, message: 'Out of radar bounds' };
  }

  const defenderId = game.playerIds.find(id => id !== attackerId);
  const defender = game.players[defenderId];
  const attacker = game.players[attackerId];

  if (defender.shotsReceived[r][c] !== null) {
    return { valid: false, message: 'Coordinate already targeted!' };
  }

  const hitShipName = defender.board[r][c];
  let isHit = !!hitShipName;
  let sunkShipName = null;

  defender.shotsReceived[r][c] = isHit ? 'hit' : 'miss';

  if (isHit) {
    // Check if this ship is completely sunk
    const ship = defender.fleet.find(s => s.name === hitShipName);
    if (ship) {
      ship.hits += 1;
      if (ship.hits === ship.size) {
        ship.isSunk = true;
        sunkShipName = ship.name;
        defender.shipsSunk += 1;
      }
    }
  }

  game.lastShot = {
    attackerId,
    row: r,
    col: c,
    result: isHit ? 'hit' : 'miss',
    sunkShip: sunkShipName
  };

  // Check victory condition (all 5 ships sunk)
  if (defender.shipsSunk === SHIPS_CONFIG.length) {
    game.status = 'game_over';
    game.winner = attackerId;
    game.winReason = `⚓ VICTORY! Admiral ${attacker.name} sank the entire enemy fleet! 🏆`;
    return { valid: true, game };
  }

  // Switch turn (or if hit, in classic mode continue or switch turn - let's switch turn for fast pacing)
  game.turn = defenderId;
  return { valid: true, game };
}

// Generate valid non-overlapping random fleet placement
export function generateRandomFleet() {
  const board = Array(BS_SIZE).fill(null).map(() => Array(BS_SIZE).fill(null));
  const ships = [];

  for (const config of SHIPS_CONFIG) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horizontal ? BS_SIZE : (BS_SIZE - config.size + 1)));
      const c = Math.floor(Math.random() * (horizontal ? (BS_SIZE - config.size + 1) : BS_SIZE));

      // Check collision
      let canPlace = true;
      const coordinates = [];
      for (let i = 0; i < config.size; i++) {
        const cr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        if (board[cr][cc] !== null) {
          canPlace = false;
          break;
        }
        coordinates.push([cr, cc]);
      }

      if (canPlace) {
        coordinates.forEach(([cr, cc]) => {
          board[cr][cc] = config.name;
        });
        ships.push({
          name: config.name,
          size: config.size,
          icon: config.icon,
          coordinates,
          hits: 0,
          isSunk: false
        });
        placed = true;
      }
    }
  }

  return { board, ships };
}

// Bot AI for Battleship: Hunt and Target mode
export function getBattleshipBotMove(game, botId) {
  const defenderId = game.playerIds.find(id => id !== botId);
  const defender = game.players[defenderId];
  const shots = defender.shotsReceived;

  // 1. Target mode: look for any unsunk hit cell with untargeted neighbors
  for (let r = 0; r < BS_SIZE; r++) {
    for (let c = 0; c < BS_SIZE; c++) {
      if (shots[r][c] === 'hit') {
        const neighbors = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
        ].filter(([nr, nc]) => nr >= 0 && nr < BS_SIZE && nc >= 0 && nc < BS_SIZE && shots[nr][nc] === null);

        if (neighbors.length > 0) {
          return neighbors[Math.floor(Math.random() * neighbors.length)];
        }
      }
    }
  }

  // 2. Hunt mode (checkerboard parity targeting for efficiency)
  const availableParity = [];
  const availableAny = [];
  for (let r = 0; r < BS_SIZE; r++) {
    for (let c = 0; c < BS_SIZE; c++) {
      if (shots[r][c] === null) {
        availableAny.push([r, c]);
        if ((r + c) % 2 === 0) {
          availableParity.push([r, c]);
        }
      }
    }
  }

  if (availableParity.length > 0) {
    return availableParity[Math.floor(Math.random() * availableParity.length)];
  }
  if (availableAny.length > 0) {
    return availableAny[Math.floor(Math.random() * availableAny.length)];
  }

  return [0, 0];
}
