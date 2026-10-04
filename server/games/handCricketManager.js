// Hand Cricket Game Engine
export function createHandCricketGame(player1, player2, maxBalls = 12) {
  return {
    gameType: 'hand_cricket',
    status: 'toss', // 'toss' | 'choose_action' | 'innings1' | 'innings2' | 'game_over'
    players: {
      p1: { id: player1.id, name: player1.name, avatar: player1.avatar, isBot: !!player1.isBot },
      p2: { id: player2.id, name: player2.name, avatar: player2.avatar, isBot: !!player2.isBot },
    },
    toss: {
      callerId: player1.id,
      callChoice: null, // 'heads' | 'tails'
      coinResult: null,
      winnerId: null,
    },
    battingFirstId: null,
    bowlingFirstId: null,
    currentBatsmanId: null,
    currentBowlerId: null,
    innings: 1,
    maxBalls,
    innings1: {
      batsmanId: null,
      bowlerId: null,
      score: 0,
      wickets: 0,
      balls: 0,
      history: []
    },
    innings2: {
      batsmanId: null,
      bowlerId: null,
      score: 0,
      wickets: 0,
      balls: 0,
      target: 0,
      history: []
    },
    currentTurnSelections: {
      // [playerId]: number
    },
    lastBallResult: null,
    winner: null, // playerId | 'tie'
    winReason: ''
  };
}

const COMMENTARY_DICTIONARY = {
  wicket: [
    "🎯 GONE! Stumps shattered, what a delivery!",
    "🧤 EDGED AND TAKEN! The keeper makes no mistake!",
    "☝️ HOWZAT!! Finger goes up without hesitation!",
    "💥 CAUGHT AT THE BOUNDARY! A huge wicket falls!"
  ],
  six: [
    "🚀 MONSTER SIX! Out of the ground and onto the roof!",
    "💥 BOOM! Clean strike over long-on for MAXIMUM!",
    "🔥 WHAT A HIT! Sails 100 meters into the stands!"
  ],
  four: [
    "⚡ CRACKED! Pierces the infield for a crisp FOUR!",
    "🎯 Beautiful timing! Races away across the carpet for FOUR!",
    "✨ Exquisite drive! The fielder had no chance!"
  ],
  runs: [
    "Pushed softly into the gap for {r} run{s}.",
    "Smart running between the wickets, adds {r} run{s} to the total.",
    "Driven down the ground for {r} run{s}."
  ]
};

function getRandomCommentary(type, runs = 0) {
  const list = COMMENTARY_DICTIONARY[type] || COMMENTARY_DICTIONARY.runs;
  const raw = list[Math.floor(Math.random() * list.length)];
  return raw.replace('{r}', runs).replace('{s}', runs === 1 ? '' : 's');
}

export function handleHandCricketToss(game, callerId, choice) {
  if (game.status !== 'toss' || game.toss.callerId !== callerId) return game;
  const coin = Math.random() < 0.5 ? 'heads' : 'tails';
  const winnerId = choice === coin ? callerId : (callerId === game.players.p1.id ? game.players.p2.id : game.players.p1.id);
  
  game.toss.callChoice = choice;
  game.toss.coinResult = coin;
  game.toss.winnerId = winnerId;
  game.status = 'choose_action';
  return game;
}

export function handleHandCricketActionChoice(game, chooserId, action) {
  if (game.status !== 'choose_action' || game.toss.winnerId !== chooserId) return game;
  const otherPlayerId = chooserId === game.players.p1.id ? game.players.p2.id : game.players.p1.id;
  
  if (action === 'bat') {
    game.battingFirstId = chooserId;
    game.bowlingFirstId = otherPlayerId;
  } else {
    game.battingFirstId = otherPlayerId;
    game.bowlingFirstId = chooserId;
  }

  game.currentBatsmanId = game.battingFirstId;
  game.currentBowlerId = game.bowlingFirstId;
  game.innings1.batsmanId = game.battingFirstId;
  game.innings1.bowlerId = game.bowlingFirstId;
  game.innings = 1;
  game.status = 'innings1';
  return game;
}

export function handleHandCricketSelection(game, playerId, number) {
  if (game.status !== 'innings1' && game.status !== 'innings2') return { game, resolved: false };
  if (number < 1 || number > 6) return { game, resolved: false };

  game.currentTurnSelections[playerId] = number;

  const batsmanId = game.currentBatsmanId;
  const bowlerId = game.currentBowlerId;

  // Check if both players have made their selection
  if (game.currentTurnSelections[batsmanId] !== undefined && game.currentTurnSelections[bowlerId] !== undefined) {
    const batNum = game.currentTurnSelections[batsmanId];
    const bowlNum = game.currentTurnSelections[bowlerId];
    const activeInnings = game.innings === 1 ? game.innings1 : game.innings2;

    activeInnings.balls += 1;
    const isOut = (batNum === bowlNum);
    let runsScored = isOut ? 0 : batNum;
    let commentary = '';

    if (isOut) {
      activeInnings.wickets += 1;
      commentary = getRandomCommentary('wicket');
    } else {
      activeInnings.score += runsScored;
      if (runsScored === 6) commentary = getRandomCommentary('six');
      else if (runsScored === 4) commentary = getRandomCommentary('four');
      else commentary = getRandomCommentary('runs', runsScored);
    }

    const ballEntry = {
      ball: activeInnings.balls,
      batNum,
      bowlNum,
      isOut,
      runs: runsScored,
      totalScore: activeInnings.score,
      commentary
    };

    activeInnings.history.push(ballEntry);
    game.lastBallResult = ballEntry;
    game.currentTurnSelections = {};

    // Check innings 1 end condition
    if (game.innings === 1) {
      if (isOut || activeInnings.balls >= game.maxBalls) {
        // End of Innings 1
        game.innings = 2;
        game.status = 'innings2';
        game.innings2.target = game.innings1.score + 1;
        game.innings2.batsmanId = game.bowlingFirstId;
        game.innings2.bowlerId = game.battingFirstId;
        game.currentBatsmanId = game.innings2.batsmanId;
        game.currentBowlerId = game.innings2.bowlerId;
      }
    } else {
      // Innings 2 conditions
      const target = game.innings2.target;
      if (activeInnings.score >= target) {
        // Chased down successfully!
        game.status = 'game_over';
        game.winner = game.innings2.batsmanId;
        const winnerName = game.players.p1.id === game.winner ? game.players.p1.name : game.players.p2.name;
        game.winReason = `${winnerName} chased down the target of ${target} runs! 🏆`;
      } else if (isOut || activeInnings.balls >= game.maxBalls) {
        // Innings 2 ended without passing target
        game.status = 'game_over';
        if (activeInnings.score === target - 1) {
          game.winner = 'tie';
          game.winReason = `Scores are level! Thrilling match tied at ${activeInnings.score} runs! 🤝`;
        } else {
          game.winner = game.innings2.bowlerId;
          const winnerName = game.players.p1.id === game.winner ? game.players.p1.name : game.players.p2.name;
          const margin = target - 1 - activeInnings.score;
          game.winReason = `${winnerName} defended the total by ${margin} run${margin === 1 ? '' : 's'}! 🏆`;
        }
      }
    }

    return { game, resolved: true };
  }

  return { game, resolved: false };
}
