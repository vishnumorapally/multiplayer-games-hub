// Wordle Duel (Word Battle) Game Engine
// 5-letter hidden word duel with real-time guess progress

export const WORD_LIST = [
  'APPLE', 'BRAVE', 'CHESS', 'DREAM', 'EAGLE', 'FLAME', 'GHOST', 'HEART',
  'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STORM',
  'TIGER', 'VOICE', 'WATER', 'YOUTH', 'ZEBRA', 'BLAZE', 'CRISP', 'FROST',
  'GLOWS', 'JEWEL', 'LUNAR', 'MANGO', 'NOBLE', 'ORBIT', 'PEARL', 'QUEST',
  'ROYAL', 'SHINE', 'SWIFT', 'VIVID', 'WORLD', 'YACHT', 'ANGEL', 'BLOOM'
];

export function createWordleDuelGame(player1, player2) {
  const targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

  return {
    gameType: 'wordle_duel',
    status: 'playing',
    targetWord,
    wordLength: 5,
    maxGuesses: 6,
    players: {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        avatar: player1.avatar,
        isBot: !!player1.isBot,
        guesses: [], // [{ word: 'APPLE', evaluation: ['green', 'yellow', 'gray', 'gray', 'green'] }]
        solved: false,
        attempts: 0
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        avatar: player2.avatar,
        isBot: !!player2.isBot,
        guesses: [],
        solved: false,
        attempts: 0
      }
    },
    playerIds: [player1.id, player2.id],
    winner: null,
    winReason: ''
  };
}

export function handleWordleGuess(game, playerId, guessWord) {
  if (game.status !== 'playing') return { valid: false, message: 'Game over' };

  const player = game.players[playerId];
  if (!player) return { valid: false, message: 'Player not found' };
  if (player.solved || player.guesses.length >= game.maxGuesses) {
    return { valid: false, message: 'No more guesses allowed' };
  }

  const word = (guessWord || '').toUpperCase().trim();
  if (word.length !== 5) {
    return { valid: false, message: 'Word must be 5 letters' };
  }

  const evaluation = evaluateGuess(word, game.targetWord);
  const isSolved = (word === game.targetWord);

  player.guesses.push({ word, evaluation });
  player.attempts += 1;
  player.solved = isSolved;

  const otherId = game.playerIds.find(id => id !== playerId);
  const otherPlayer = game.players[otherId];

  // If this player solved it:
  if (isSolved) {
    game.status = 'game_over';
    game.winner = playerId;
    game.winReason = `🎉 ${player.name} solved the word "${game.targetWord}" in ${player.attempts} attempts! 🏆`;
    return { valid: true, game };
  }

  // If both players have exhausted all guesses:
  if (player.guesses.length >= game.maxGuesses && otherPlayer.guesses.length >= game.maxGuesses) {
    game.status = 'game_over';
    game.winner = 'draw';
    game.winReason = `Out of guesses! The secret word was "${game.targetWord}". 🤝`;
    return { valid: true, game };
  }

  return { valid: true, game };
}

function evaluateGuess(guess, target) {
  const res = Array(5).fill('gray');
  const targetChars = target.split('');
  const guessChars = guess.split('');

  // 1st pass: find exact matches (green)
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      res[i] = 'green';
      targetChars[i] = null;
    }
  }

  // 2nd pass: find partial matches (yellow)
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'gray') {
      const matchIdx = targetChars.indexOf(guessChars[i]);
      if (matchIdx !== -1) {
        res[i] = 'yellow';
        targetChars[matchIdx] = null;
      }
    }
  }

  return res;
}

export function getWordleBotGuess(game, botId) {
  const bot = game.players[botId];
  if (!bot || bot.solved || bot.guesses.length >= game.maxGuesses) return null;

  // On first guess, pick starter
  if (bot.guesses.length === 0) {
    const starters = ['CRANE', 'SLATE', 'AUDIO', 'ROAST', 'TRAIN'];
    return starters[Math.floor(Math.random() * starters.length)];
  }

  // With 35% probability or on guess 4+, bot solves word
  if (bot.guesses.length >= 3 || Math.random() < 0.35) {
    return game.targetWord;
  }

  // Otherwise pick a random valid 5-letter word
  const remaining = WORD_LIST.filter(w => !bot.guesses.some(g => g.word === w));
  return remaining[Math.floor(Math.random() * remaining.length)] || game.targetWord;
}
