import React, { useState, useEffect, useRef } from 'react';
import { GenericMiniGameState, GameType } from '../../types';
import { sounds } from '../../utils/sound';
import { Flame, Trophy, Sparkles, Zap, Award, Target, HelpCircle } from 'lucide-react';
import { TypingRaceArena } from './TypingRaceArena';
import { FlappyDuelArena } from './FlappyDuelArena';
import { GomokuArena } from './GomokuArena';
import { OthelloArena } from './OthelloArena';
import { SlidingPuzzleArena } from './SlidingPuzzleArena';
import { ColorFloodArena } from './ColorFloodArena';
import { ArcheryArena } from './ArcheryArena';
import { GreedyDiceArena } from './GreedyDiceArena';
import { ColorCardsArena } from './ColorCardsArena';
import { BrickBreakerArena } from './BrickBreakerArena';
import { AnagramArena } from './AnagramArena';
import { CoinPusherArena } from './CoinPusherArena';

interface ArcadeMiniGameProps {
  gameState: GenericMiniGameState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const ArcadeMiniGame: React.FC<ArcadeMiniGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const [p1Id, p2Id] = gameState.playerIds;
  const p1 = gameState.players[p1Id];
  const p2 = gameState.players[p2Id];
  const isP1 = p1Id === myPlayerId;
  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  const gType = gameState.gameType;

  // 1. ROCK PAPER SCISSORS BOOM
  if (gType === 'rps_boom') {
    const choices = [
      { id: 'rock', label: 'Rock', icon: '🪨', desc: 'Crushes Scissors' },
      { id: 'paper', label: 'Paper', icon: '📄', desc: 'Covers Rock' },
      { id: 'scissors', label: 'Scissors', icon: '✂️', desc: 'Cuts Paper' },
      { id: 'bomb', label: 'Bomb', icon: '💣', desc: 'Beats Rock, Paper, Scissors!' },
      { id: 'shield', label: 'Shield', icon: '🛡️', desc: 'Blocks Bomb!' }
    ];

    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-in fade-in select-none">
        <ScoreHeader p1={p1} p2={p2} isP1={isP1} targetScore={gameState.data?.targetWins || 3} unit="rounds" />

        <div className="w-full p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 text-center shadow-2xl">
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2">
            ROUND {gameState.round} · FIRST TO 3 WINS
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white mb-6">
            Choose your Attack or Defense!
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            {choices.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playClick();
                  onAction('arcade_action', { subAction: 'choose', data: { choice: c.id } });
                }}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-400 transition hover:scale-105 active:scale-95 shadow flex flex-col items-center"
              >
                <span className="text-3xl mb-1">{c.icon}</span>
                <span className="text-sm font-bold text-white">{c.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{c.desc}</span>
              </button>
            ))}
          </div>

          {/* Round History */}
          {gameState.data?.roundWins && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center gap-6 text-xs font-mono">
              <span className="text-indigo-400 font-bold">{p1.name}: {gameState.data.roundWins[p1Id] || 0} wins</span>
              <span className="text-pink-400 font-bold">{p2.name}: {gameState.data.roundWins[p2Id] || 0} wins</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. MENTAL MATH BLITZ
  if (gType === 'math_blitz') {
    const q = gameState.data?.question || { text: '12 + 15 = ?', options: [27, 25, 29, 30] };
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-in fade-in select-none">
        <ScoreHeader p1={p1} p2={p2} isP1={isP1} targetScore={50} unit="pts" />

        <div className="w-full p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 text-center shadow-2xl">
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-2">
            ROUND {gameState.round} of 5 · SOLVE FAST!
          </div>

          <div className="my-6 py-6 px-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-3xl sm:text-4xl font-black text-amber-300 shadow-inner">
            {q.text}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {q.options?.map((opt: number, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  sounds.playClick();
                  onAction('arcade_action', { subAction: 'answer', data: { answer: opt } });
                }}
                className="py-4 rounded-2xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 font-black font-['Outfit'] text-2xl text-white border border-slate-700 hover:border-amber-400 transition hover:scale-105 active:scale-95 shadow"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. REACTION REFLEX TAP
  if (gType === 'reaction_tap') {
    return <ReactionTapArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 4. TYPING SPEED RACE
  if (gType === 'typing_race') {
    return <TypingRaceArena targetText={gameState.data?.targetText} onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 5. MINESWEEPER BATTLE
  if (gType === 'minesweeper') {
    return <MinesweeperArena data={gameState.data} onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 6. WHACK A MOLE BLITZ
  if (gType === 'whack_a_mole') {
    return <WhackAMoleArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 7. SIMON SAYS MEMORY MATRIX
  if (gType === 'simon_says') {
    return <SimonSaysArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 8. TOWER STACKER
  if (gType === 'tower_stack') {
    return <TowerStackerArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 9. TRIVIA SHOWDOWN
  if (gType === 'trivia_quiz') {
    return <TriviaQuizArena questions={gameState.data?.questions || []} onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 10. FLAPPY RUSH DUEL
  if (gType === 'flappy_duel') {
    return <FlappyDuelArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 11. GOMOKU (FIVE IN A ROW)
  if (gType === 'gomoku') {
    return <GomokuArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 12. OTHELLO (REVERSI)
  if (gType === 'othello') {
    return <OthelloArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 13. 15 SLIDING TILE PUZZLE
  if (gType === 'sliding_puzzle') {
    return <SlidingPuzzleArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 14. COLOR FLOOD CONQUEST
  if (gType === 'color_flood') {
    return <ColorFloodArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 15. BULLSEYE TARGET ARCHERY
  if (gType === 'target_archery') {
    return <ArcheryArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 16. GREEDY PIG DICE GAME
  if (gType === 'greedy_dice') {
    return <GreedyDiceArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 17. COLOR CARDS DUEL (UNO STYLE)
  if (gType === 'color_cards') {
    return <ColorCardsArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 18. BRICK BREAKER SMASH
  if (gType === 'brick_breaker') {
    return <BrickBreakerArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 19. WORD ANAGRAM SCRAMBLE
  if (gType === 'anagram_duel') {
    return <AnagramArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  // 20. VEGAS ARCADE COIN PUSHER
  if (gType === 'coin_pusher') {
    return <CoinPusherArena onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
  }

  return <GenericScoreChallenger gameType={gType} onAction={onAction} p1={p1} p2={p2} isP1={isP1} />;
};

// Reusable Top Score Header
function ScoreHeader({ p1, p2, isP1, targetScore, unit }: any) {
  return (
    <div className="w-full grid grid-cols-2 gap-4 mb-4 select-none">
      <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{p1.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-indigo-400">{isP1 ? 'YOU' : 'OPPONENT'}</div>
              <div className="text-sm font-bold text-white">{p1.name}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-['Outfit'] text-indigo-300">{p1.score}</span>
            <span className="text-xs text-slate-400 block -mt-1">{unit}</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl glass-card border border-pink-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{p2.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-pink-400">{!isP1 ? 'YOU' : 'OPPONENT'}</div>
              <div className="text-sm font-bold text-white">{p2.name}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-['Outfit'] text-pink-300">{p2.score}</span>
            <span className="text-xs text-slate-400 block -mt-1">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Arena: Reaction Reflex Tap
function ReactionTapArena({ onAction, p1, p2, isP1 }: any) {
  const [state, setState] = useState<'wait' | 'ready' | 'tapped'>('wait');
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    const delay = 1500 + Math.random() * 2500;
    const timer = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
      sounds.playCheck();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    if (state === 'wait') {
      // Too early!
      alert('Too early! Wait for the screen to turn GREEN!');
      return;
    }
    if (state === 'ready') {
      const ms = Date.now() - startTime;
      setState('tapped');
      sounds.playVictory();
      onAction('arcade_action', { subAction: 'tap', data: { ms } });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="rounds" />
      <div
        onClick={handleTap}
        className={`w-full h-80 rounded-3xl border-4 flex flex-col items-center justify-center cursor-pointer transition shadow-2xl ${
          state === 'wait'
            ? 'bg-rose-950/80 border-rose-600 text-rose-300'
            : state === 'ready'
            ? 'bg-emerald-600 border-emerald-300 text-white animate-pulse'
            : 'bg-indigo-900 border-indigo-400 text-white'
        }`}
      >
        <span className="text-5xl mb-3">
          {state === 'wait' ? '🛑' : state === 'ready' ? '⚡' : '🏆'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-['Outfit']">
          {state === 'wait' ? 'WAIT FOR GREEN...' : state === 'ready' ? 'TAP NOW!!' : 'GREAT REFLEXES!'}
        </h2>
        <p className="text-xs text-slate-300 mt-2">
          {state === 'wait' ? 'Do not click yet!' : 'Tap anywhere on this box as fast as humanly possible!'}
        </p>
      </div>
    </div>
  );
}



// Sub-Arena: Minesweeper Battle
function MinesweeperArena({ data, onAction, p1, p2, isP1 }: any) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const grid = data?.grid || Array(8).fill(null).map(() => Array(8).fill(0));

  const handleCellClick = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (revealed[key]) return;

    sounds.playClick();
    setRevealed(prev => ({ ...prev, [key]: true }));

    if (grid[r][c] === 'M') {
      sounds.playWicket();
      alert('💥 BOOM! You hit a mine!');
      onAction('arcade_action', { subAction: 'hit_mine', data: { score: -20 } });
    } else {
      onAction('arcade_action', { subAction: 'safe_cell', data: { score: 10 } });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="pts" />

      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
          {grid.map((row: any[], r: number) =>
            row.map((cell: any, c: number) => {
              const key = `${r},${c}`;
              const isRev = revealed[key];
              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition ${
                    isRev
                      ? cell === 'M'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-indigo-300'
                      : 'bg-slate-950 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {isRev ? (cell === 'M' ? '💣' : cell > 0 ? cell : '') : ''}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Arena: Whack-A-Mole
function WhackAMoleArena({ onAction, p1, p2, isP1 }: any) {
  const [molePos, setMolePos] = useState(4);
  const [isGold, setIsGold] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMolePos(Math.floor(Math.random() * 9));
      setIsGold(Math.random() < 0.2);
    }, 850);
    return () => clearInterval(timer);
  }, []);

  const handleWhack = (idx: number) => {
    if (idx === molePos) {
      sounds.playCricketHit();
      setMolePos(-1);
      onAction('arcade_action', { subAction: 'whack', data: { score: isGold ? 30 : 10 } });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="pts" />

      <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            onClick={() => handleWhack(idx)}
            className="h-24 sm:h-28 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl cursor-pointer hover:bg-slate-800 transition"
          >
            {idx === molePos && (
              <span className="animate-in zoom-in-50 duration-150">
                {isGold ? '🌟' : '🐹'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-Arena: Simon Says
function SimonSaysArena({ onAction, p1, p2, isP1 }: any) {
  const pads = [
    { id: 0, color: 'bg-emerald-500 hover:bg-emerald-400 ring-emerald-300' },
    { id: 1, color: 'bg-rose-500 hover:bg-rose-400 ring-rose-300' },
    { id: 2, color: 'bg-amber-500 hover:bg-amber-400 ring-amber-300' },
    { id: 3, color: 'bg-blue-500 hover:bg-blue-400 ring-blue-300' }
  ];

  const handlePad = (id: number) => {
    sounds.playClick();
    onAction('arcade_action', { subAction: 'pad', data: { score: 10 } });
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="steps" />

      <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl w-full aspect-square">
        {pads.map(p => (
          <button
            key={p.id}
            onClick={() => handlePad(p.id)}
            className={`rounded-2xl transition transform active:scale-95 shadow-lg ${p.color}`}
          />
        ))}
      </div>
    </div>
  );
}

// Sub-Arena: Tower Stacker
function TowerStackerArena({ onAction, p1, p2, isP1 }: any) {
  const [height, setHeight] = useState(0);

  const handleDrop = () => {
    sounds.playClick();
    setHeight(h => h + 1);
    onAction('arcade_action', { subAction: 'stack', data: { score: 10 } });
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="floors" />

      <div
        onClick={handleDrop}
        className="w-full h-80 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-end p-6 cursor-pointer"
      >
        <div className="text-center mb-6">
          <div className="text-3xl font-black font-['Outfit'] text-indigo-400">{height} Floors</div>
          <div className="text-xs text-slate-400 mt-1">Tap screen to place next block!</div>
        </div>
        <div className="w-32 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse shadow-lg"></div>
      </div>
    </div>
  );
}

// Sub-Arena: Trivia Showdown
function TriviaQuizArena({ questions, onAction, p1, p2, isP1 }: any) {
  const [qIdx, setQIdx] = useState(0);
  const q = questions[qIdx] || { q: 'Which game uses a 15x15 board?', options: ['Ludo', 'Chess', 'Connect 4', 'Pong'], answer: 'Ludo' };

  const handleAnswer = (ans: string) => {
    sounds.playClick();
    const isCorrect = ans === q.answer;
    if (isCorrect) sounds.playVictory();
    else sounds.playWicket();

    onAction('arcade_action', { subAction: 'trivia_answer', data: { score: isCorrect ? 20 : 0 } });
    if (qIdx < questions.length - 1) setQIdx(qIdx + 1);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="pts" />

      <div className="w-full p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="text-xs uppercase font-extrabold text-indigo-400">QUESTION {qIdx + 1} of {questions.length || 5}</div>
        <h3 className="text-lg sm:text-xl font-bold text-white">{q.q}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {q.options?.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 text-sm font-bold transition hover:scale-102 active:scale-98"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Generic Arcade Game Challenger (Color Flood, Archery, Coin Pusher, etc.)
function GenericScoreChallenger({ gameType, onAction, p1, p2, isP1 }: any) {
  const [localScore, setLocalScore] = useState(0);

  const handleScoreAction = () => {
    sounds.playClick();
    setLocalScore(s => s + 10);
    onAction('arcade_action', { subAction: 'action', data: { score: 10 } });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none">
      <ScoreHeader p1={p1} p2={p2} isP1={isP1} unit="pts" />

      <div className="w-full p-8 rounded-3xl glass-panel border border-indigo-500/30 text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-4xl shadow-inner">
          🎮
        </div>

        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-white uppercase tracking-tight">
            {gameType.replace('_', ' ')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Tap the arcade action button to score points and outpace your opponent!</p>
        </div>

        <button
          onClick={handleScoreAction}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
        >
          ARCADE ACTION (+10 PTS) 💥
        </button>
      </div>
    </div>
  );
}
