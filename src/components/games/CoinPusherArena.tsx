import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Coins, Sparkles } from 'lucide-react';

interface CoinPusherArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const CoinPusherArena: React.FC<CoinPusherArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [pusherPos, setPusherPos] = useState(0); // -40 to 40
  const [coinsLeft, setCoinsLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [cascades, setCascades] = useState<{ id: number; text: string }[]>([]);

  // Moving pusher animation
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      setPusherPos(Math.sin(t) * 35);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const dropCoin = () => {
    if (coinsLeft <= 0) return;

    sounds.playClick();
    setCoinsLeft(c => c - 1);

    // Pusher collision payout chance
    // When pusher is moving forward (derivative > 0 or position > 0), higher cascade chance
    const luck = Math.random();
    let earned = 0;

    if (pusherPos > 15 && luck < 0.45) {
      // Big cascade
      earned = Math.floor(Math.random() * 30) + 20;
      sounds.playVictory();
    } else if (luck < 0.35) {
      // Small cascade
      earned = Math.floor(Math.random() * 10) + 5;
    }

    if (earned > 0) {
      const nextScore = score + earned;
      setScore(nextScore);
      const id = Date.now();
      setCascades(prev => [...prev.slice(-3), { id, text: `+${earned} COINS! 🪙` }]);
      setTimeout(() => {
        setCascades(prev => prev.filter(c => c.id !== id));
      }, 1200);

      if (nextScore >= 150 || coinsLeft <= 1) {
        onAction('arcade_action', { subAction: 'pusher_finish', data: { score: nextScore, gameOver: true } });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <h2 className="font-['Outfit'] font-black text-white text-base">Vegas Arcade Coin Pusher</h2>
        </div>
        <div className="flex items-center space-x-4 font-mono font-bold text-xs">
          <span className="text-amber-400">Score: {score}</span>
          <span className="text-slate-400">🪙 {coinsLeft} left</span>
        </div>
      </div>

      {/* Moving Pusher Chamber */}
      <div className="relative w-full h-72 rounded-3xl bg-slate-950 border-2 border-amber-500/30 shadow-2xl overflow-hidden p-4 flex flex-col justify-between">
        {/* Upper Shelf (Moving Pusher) */}
        <div
          style={{ transform: `translateY(${pusherPos}px)` }}
          className="w-full h-24 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 border-2 border-amber-300 shadow-2xl flex items-center justify-center relative transition-transform duration-75"
        >
          <div className="text-xs font-black tracking-widest text-slate-950 uppercase opacity-75">
            MECHANICAL PUSHER TIER
          </div>
          {/* Surface coins */}
          <div className="absolute inset-x-2 bottom-1 flex justify-around opacity-90 text-lg">
            <span>🪙</span><span>🪙</span><span>🪙</span><span>🪙</span><span>🪙</span><span>🪙</span>
          </div>
        </div>

        {/* Lower Drop Bed */}
        <div className="w-full h-28 rounded-2xl bg-gradient-to-t from-slate-900 to-slate-800 border border-slate-700 p-2 relative flex flex-wrap content-end justify-center gap-1 shadow-inner">
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">💎</span>
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">💎</span>
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">🪙</span>
          <span className="text-2xl">💎</span>

          {/* Cascade alerts */}
          {cascades.map(c => (
            <div
              key={c.id}
              className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm shadow-xl animate-bounce"
            >
              {c.text}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Button */}
      <button
        onClick={dropCoin}
        disabled={coinsLeft <= 0}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
      >
        <Coins className="w-5 h-5 fill-slate-950" />
        <span>DROP COIN (🪙 {coinsLeft} REMAINING)</span>
      </button>

      <div className="text-center text-xs text-slate-500">
        Time your coin drop as the mechanical pusher moves forward to push stacks over the payout ledge!
      </div>
    </div>
  );
};
