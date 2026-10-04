// Arcade Manager: 20 Mini-Games Engine with Easy / Medium / Hard AI

export function createArcadeGame(gameType, player1, player2, difficulty = 'medium') {
  const p1 = { id: player1.id, name: player1.name, avatar: player1.avatar, isBot: !!player1.isBot, score: 0 };
  const p2 = { id: player2.id, name: player2.name, avatar: player2.avatar, isBot: !!player2.isBot, score: 0 };

  const base = {
    gameType,
    status: 'playing',
    difficulty,
    round: 1,
    maxRounds: 5,
    players: { [p1.id]: p1, [p2.id]: p2 },
    playerIds: [p1.id, p2.id],
    turn: p1.id,
    winner: null,
    winReason: ''
  };

  switch (gameType) {
    case 'rps_boom':
      return {
        ...base,
        choices: {}, // { [pid]: choice }
        history: [],
        data: { roundWins: { [p1.id]: 0, [p2.id]: 0 }, targetWins: 3 }
      };

    case 'minesweeper':
      const size = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
      const minesCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 14 : 20;
      return {
        ...base,
        data: {
          size,
          minesCount,
          grid: generateMinesweeperGrid(size, minesCount),
          revealedCount: 0,
          totalSafeCells: size * size - minesCount
        }
      };

    case 'math_blitz':
      return {
        ...base,
        data: {
          question: generateMathQuestion(difficulty),
          answered: {},
          roundLimit: 5
        }
      };

    case 'typing_race':
      const phrases = [
        "Speed and precision will conquer any keyboard arena.",
        "Quick reflexes and sharp focus make true arcade champions.",
        "Multiplayer gaming connects players across the entire world.",
        "Code, build, compete and rise to the top of the leaderboard."
      ];
      const targetText = phrases[Math.floor(Math.random() * phrases.length)];
      return {
        ...base,
        data: {
          targetText,
          progress: { [p1.id]: 0, [p2.id]: 0 },
          wpm: { [p1.id]: 0, [p2.id]: 0 },
          startTime: Date.now()
        }
      };

    case 'simon_says':
      return {
        ...base,
        data: {
          sequence: [Math.floor(Math.random() * 4)],
          playerInputs: { [p1.id]: [], [p2.id]: [] },
          activePad: null,
          roundScore: { [p1.id]: 0, [p2.id]: 0 }
        }
      };

    case 'reaction_tap':
      return {
        ...base,
        data: {
          state: 'waiting', // 'waiting' | 'ready' | 'tapped'
          readyAt: Date.now() + 2000 + Math.random() * 3000,
          reactionTimes: {},
          roundLimit: 3
        }
      };

    case 'trivia_quiz':
      return {
        ...base,
        data: {
          questionIndex: 0,
          questions: getTriviaQuestions(),
          answers: {},
          roundLimit: 5
        }
      };

    case 'gomoku':
      return {
        ...base,
        data: {
          size: 15,
          board: Array(15).fill(null).map(() => Array(15).fill(null)),
          lastMove: null
        }
      };

    case 'othello':
      const oBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      oBoard[3][3] = 'W'; oBoard[3][4] = 'B';
      oBoard[4][3] = 'B'; oBoard[4][4] = 'W';
      return {
        ...base,
        data: {
          board: oBoard,
          counts: { B: 2, W: 2 }
        }
      };

    case 'flappy_duel':
      return {
        ...base,
        data: {
          scores: { [p1.id]: 0, [p2.id]: 0 },
          alive: { [p1.id]: true, [p2.id]: true }
        }
      };

    case 'whack_a_mole':
      return {
        ...base,
        data: {
          activeMole: Math.floor(Math.random() * 9),
          isGold: Math.random() < 0.2,
          scores: { [p1.id]: 0, [p2.id]: 0 },
          durationSeconds: 30
        }
      };

    case 'color_flood':
      return {
        ...base,
        data: {
          size: 10,
          grid: generateColorFloodGrid(10),
          movesLeft: 22,
          captured: { [p1.id]: 1, [p2.id]: 1 }
        }
      };

    case 'tower_stack':
      return {
        ...base,
        data: {
          blocksStacked: { [p1.id]: 0, [p2.id]: 0 },
          currentWidth: 100,
          perfectHits: { [p1.id]: 0, [p2.id]: 0 }
        }
      };

    case 'target_archery':
      return {
        ...base,
        data: {
          shots: { [p1.id]: [], [p2.id]: [] },
          wind: (Math.random() * 4 - 2).toFixed(1),
          maxShots: 5
        }
      };

    case 'greedy_dice':
      return {
        ...base,
        data: {
          dice: [1, 2, 3, 4, 5, 6].map(() => Math.floor(Math.random() * 6) + 1),
          banked: { [p1.id]: 0, [p2.id]: 0 },
          turnScore: 0,
          targetScore: 2000
        }
      };

    case 'color_cards':
      return {
        ...base,
        data: {
          topCard: { color: 'red', value: '7' },
          hands: {
            [p1.id]: generateCardHand(5),
            [p2.id]: generateCardHand(5)
          }
        }
      };

    case 'anagram_duel':
      return {
        ...base,
        data: {
          letters: 'PLANET',
          validWords: ['PLANET', 'PLANE', 'PLANT', 'PLATE', 'LEAP', 'PALE', 'LATE', 'TALE', 'PLAN', 'LANE', 'NEAT'],
          foundWords: { [p1.id]: [], [p2.id]: [] }
        }
      };

    case 'sliding_puzzle':
      return {
        ...base,
        data: {
          board: [1, 2, 3, 4, 5, 6, 7, 8, 0], // 3x3 for fast action
          moves: { [p1.id]: 0, [p2.id]: 0 }
        }
      };

    case 'brick_breaker':
    case 'coin_pusher':
    default:
      return {
        ...base,
        data: {
          scores: { [p1.id]: 0, [p2.id]: 0 }
        }
      };
  }
}

// Helpers
function generateMinesweeperGrid(size, mines) {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (grid[r][c] !== 'M') {
      grid[r][c] = 'M';
      placed++;
    }
  }
  // calculate numbers
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 'M') count++;
        }
      }
      grid[r][c] = count;
    }
  }
  return grid;
}

function generateMathQuestion(difficulty) {
  const max = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
  const ops = difficulty === 'easy' ? ['+', '-'] : ['+', '-', 'x'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * (op === 'x' ? 12 : max)) + 1;

  let answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const options = [answer, answer + 2, answer - 3, answer + 5].sort(() => Math.random() - 0.5);

  return { text: `${a} ${op} ${b} = ?`, answer, options };
}

function getTriviaQuestions() {
  return [
    { q: "Which piece in chess can leap over other pieces?", options: ["Knight", "Bishop", "Rook", "Pawn"], answer: "Knight" },
    { q: "What color is the center star in Ludo?", options: ["Yellow", "Red", "Blue", "Green"], answer: "Yellow" },
    { q: "How many players are in a standard cricket team?", options: ["11", "9", "10", "12"], answer: "11" },
    { q: "In Battleship, how many cells does an Aircraft Carrier occupy?", options: ["5", "4", "3", "2"], answer: "5" },
    { q: "Which country won the ICC Cricket World Cup 2011?", options: ["India", "Australia", "Sri Lanka", "England"], answer: "India" }
  ];
}

function generateColorFloodGrid(size) {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  return Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => colors[Math.floor(Math.random() * colors.length)])
  );
}

function generateCardHand(count) {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REV', '+2'];
  return Array.from({ length: count }).map(() => ({
    color: colors[Math.floor(Math.random() * colors.length)],
    value: values[Math.floor(Math.random() * values.length)]
  }));
}
