// Memory Match (Card Flip Battle) Game Engine
// 4x4 Grid (8 pairs)

const EMOJI_PAIRS = ['🦁', '🐯', '🐼', '🦊', '🐨', '🦄', '🐲', '🐙'];

export function createMemoryMatchGame(player1, player2) {
  // Shuffle cards
  const deck = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
    .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false, matchedBy: null }))
    .sort(() => Math.random() - 0.5);

  return {
    gameType: 'memory_match',
    status: 'playing',
    deck,
    turn: player1.id,
    currentFlips: [], // indices of cards flipped on current turn (max 2)
    players: {
      [player1.id]: { id: player1.id, name: player1.name, avatar: player1.avatar, isBot: !!player1.isBot, score: 0 },
      [player2.id]: { id: player2.id, name: player2.name, avatar: player2.avatar, isBot: !!player2.isBot, score: 0 }
    },
    playerIds: [player1.id, player2.id],
    matchesFound: 0,
    totalPairs: EMOJI_PAIRS.length,
    winner: null,
    winReason: ''
  };
}

export function handleMemoryFlip(game, playerId, cardIndex) {
  if (game.status !== 'playing') return { valid: false, message: 'Game over' };
  if (game.turn !== playerId && !game.players[game.turn].isBot) {
    return { valid: false, message: 'Not your turn' };
  }
  if (cardIndex < 0 || cardIndex >= game.deck.length) {
    return { valid: false, message: 'Invalid card' };
  }

  const card = game.deck[cardIndex];
  if (card.isMatched || card.isFlipped) {
    return { valid: false, message: 'Card already revealed' };
  }

  if (game.currentFlips.length >= 2) {
    return { valid: false, message: 'Resolving previous turn' };
  }

  // Flip card
  card.isFlipped = true;
  game.currentFlips.push(cardIndex);

  // If 2 cards are now flipped, evaluate match
  if (game.currentFlips.length === 2) {
    const [idx1, idx2] = game.currentFlips;
    const c1 = game.deck[idx1];
    const c2 = game.deck[idx2];
    const isMatch = (c1.emoji === c2.emoji);

    const activePlayer = game.players[playerId];

    if (isMatch) {
      c1.isMatched = true;
      c2.isMatched = true;
      c1.matchedBy = playerId;
      c2.matchedBy = playerId;
      activePlayer.score += 1;
      game.matchesFound += 1;
      game.currentFlips = [];

      // Check game completion
      if (game.matchesFound === game.totalPairs) {
        game.status = 'game_over';
        const otherId = game.playerIds.find(id => id !== playerId);
        const p1 = game.players[playerId];
        const p2 = game.players[otherId];

        if (p1.score > p2.score) {
          game.winner = p1.id;
          game.winReason = `🎉 ${p1.name} won with ${p1.score} pairs matched! 🏆`;
        } else if (p2.score > p1.score) {
          game.winner = p2.id;
          game.winReason = `🎉 ${p2.name} won with ${p2.score} pairs matched! 🏆`;
        } else {
          game.winner = 'draw';
          game.winReason = `Tie game! Both matched ${p1.score} pairs! 🤝`;
        }
      }
      // On match: active player keeps turn!
      return { valid: true, isMatch: true, game };
    } else {
      // Not a match: reset after delay and pass turn
      return { valid: true, isMatch: false, game, needsReset: true };
    }
  }

  return { valid: true, isMatch: null, game };
}

export function resetMemoryFlips(game) {
  if (game.currentFlips.length === 2) {
    const [i1, i2] = game.currentFlips;
    if (game.deck[i1] && !game.deck[i1].isMatched) game.deck[i1].isFlipped = false;
    if (game.deck[i2] && !game.deck[i2].isMatched) game.deck[i2].isFlipped = false;
    game.currentFlips = [];

    // Switch turn
    const otherId = game.playerIds.find(id => id !== game.turn);
    game.turn = otherId;
  }
  return game;
}
