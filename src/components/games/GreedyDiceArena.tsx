import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Dices, Trophy, Landmark, Flame } from 'lucide-react';

interface GreedyDiceArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const GreedyDiceArena: React.FC<GreedyDiceArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [dieValue, setDieValue] = useState<number>(1);
  const [turnScore, setTurnScore] = useState<number>(0);
  const [myTotal, setMyTotal] = useState<number>(0);
  const [oppTotal, setOppTotal] = useState<number>(0);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Roll the die to accumulate points or Bank them!');

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  const rollDie = () => {
    if (!isMyTurn || isRolling) return;

    setIsRolling(true);
    sounds.playClick();

    // Roll animation
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDieValue(rolled);
      setIsRolling(false);

      if (rolled === 1) {
        // PIG OUT!
        sounds.playWicket();
        setMessage('💥 PIG OUT! Rolled a 1! All turn points lost!');
        setTurnScore(0);
        setIsMyTurn(false);
        onAction('arcade_action', { subAction: 'greedy_pig_out', data: { score: 0 } });

        // Bot turn in solo
        if (opp?.isBot) {
          triggerBotTurn();
        }
      } else {
        sounds.playClick();
        const nextTurn = turnScore + rolled;
        setTurnScore(nextTurn);
        setMessage(`Rolled a ${rolled}! Current turn pot: +${nextTurn}`);
      }
    }, 350);
  };

  const bankScore = () => {
    if (!isMyTurn || turnScore === 0) return;

    sounds.playVictory();
    const newTotal = myTotal + turnScore;
    setMyTotal(newTotal);
    setTurnScore(0);
    setMessage(`Banked +${turnScore} points! Turn passed to ${opp.name}.`);

    if (newTotal >= 50) {
      onAction('arcade_action', { subAction: 'greedy_win', data: { winner: me.id, score: newTotal, gameOver: true } });
      return;
    }

    setIsMyTurn(false);
    onAction('arcade_action', { subAction: 'greedy_bank', data: { bankedScore: newTotal } });

    if (opp?.isBot) {
      triggerBotTurn();
    }
  };

  const triggerBotTurn = () => {
    setTimeout(() => {
      // Bot rolls 2-3 times then banks
      const botRolls = Math.random() < 0.6 ? 2 : 3;
      let botTurn = 0;
      let pigged = false;

      for (let r = 0; r < botRolls; r++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll === 1) {
          pigged = true;
          break;
        }
        botTurn += roll;
      }

      if (!pigged) {
        setOppTotal(t => t + botTurn);
        setMessage(`${opp.name} rolled and banked +${botTurn} points! Your turn!`);
      } else {
        setMessage(`${opp.name} pigged out on a 1! Your turn!`);
      }
      setIsMyTurn(true);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Total Score Cards */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/40 text-center">
          <div className="text-[10px] uppercase font-bold text-emerald-400">{me.name} (YOU)</div>
          <div className="text-3xl font-black font-['Outfit'] text-white mt-0.5">{myTotal}</div>
          <div className="text-[10px] text-slate-400">/ 50 pts to win</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-pink-500/40 text-center">
          <div className="text-[10px] uppercase font-bold text-pink-400">{opp.name}</div>
          <div className="text-3xl font-black font-['Outfit'] text-white mt-0.5">{oppTotal}</div>
          <div className="text-[10px] text-slate-400">/ 50 pts to win</div>
        </div>
      </div>

      {/* Die Arena Panel */}
      <div className="w-full p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
          {isMyTurn ? 'YOUR TURN' : `${opp.name}'s TURN`}
        </div>

        {/* Die Face */}
        <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center text-7xl text-amber-300 shadow-2xl shadow-amber-500/10">
          <span className={isRolling ? 'animate-spin' : ''}>
            {DICE_FACES[dieValue - 1]}
          </span>
        </div>

        {/* Current Turn Pot */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Turn Pot (Unbanked)</div>
          <div className="text-2xl font-black text-amber-300 font-mono">+{turnScore} PTS</div>
        </div>

        <p className="text-xs text-slate-300 font-medium">{message}</p>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={rollDie}
            disabled={!isMyTurn || isRolling}
            className="py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <Dices className="w-4 h-4" />
            <span>ROLL DIE 🎲</span>
          </button>

          <button
            onClick={bankScore}
            disabled={!isMyTurn || turnScore === 0}
            className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <Landmark className="w-4 h-4" />
            <span>BANK POINTS 🏦</span>
          </button>
        </div>
      </div>
    </div>
  );
};
