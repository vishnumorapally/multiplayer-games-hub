import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/sound';
import { Target, Trophy, Sparkles } from 'lucide-react';

interface ArcheryArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const ArcheryArena: React.FC<ArcheryArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number }>({ x: 150, y: 150 });
  const [arrowsLeft, setArrowsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [lastShot, setLastShot] = useState<{ ring: string; pts: number } | null>(null);
  const [arrowHits, setArrowHits] = useState<{ x: number; y: number; pts: number }[]>([]);
  const [isDone, setIsDone] = useState(false);

  // Animate moving reticle
  useEffect(() => {
    if (isDone) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.08;
      const rx = 150 + Math.cos(angle) * 75 + Math.sin(angle * 1.5) * 20;
      const ry = 150 + Math.sin(angle) * 60 + Math.cos(angle * 2) * 25;
      setReticlePos({ x: rx, y: ry });
    }, 30);
    return () => clearInterval(interval);
  }, [isDone]);

  const shootArrow = () => {
    if (arrowsLeft <= 0 || isDone) return;

    sounds.playClick();
    const targetCenterX = 150;
    const targetCenterY = 150;
    const dist = Math.hypot(reticlePos.x - targetCenterX, reticlePos.y - targetCenterY);

    let pts = 0;
    let ring = 'Miss';

    if (dist < 18) {
      pts = 10;
      ring = 'BULLSEYE 🎯 (10 pts)';
      sounds.playVictory();
    } else if (dist < 40) {
      pts = 8;
      ring = 'Gold Ring (8 pts)';
      sounds.playClick();
    } else if (dist < 65) {
      pts = 6;
      ring = 'Red Ring (6 pts)';
      sounds.playClick();
    } else if (dist < 90) {
      pts = 4;
      ring = 'Blue Ring (4 pts)';
      sounds.playClick();
    } else if (dist < 120) {
      pts = 2;
      ring = 'White Ring (2 pts)';
      sounds.playClick();
    } else {
      pts = 0;
      ring = 'Off Target (0 pts)';
      sounds.playWicket();
    }

    const newScore = score + pts;
    setScore(newScore);
    setLastShot({ ring, pts });
    setArrowHits(prev => [...prev, { x: reticlePos.x, y: reticlePos.y, pts }]);

    const nextArrows = arrowsLeft - 1;
    setArrowsLeft(nextArrows);

    if (nextArrows <= 0) {
      setIsDone(true);
      onAction('arcade_action', { subAction: 'archery_finish', data: { score: newScore, gameOver: true } });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-rose-400" />
          <h2 className="font-['Outfit'] font-black text-white text-base">Target Archery Duel</h2>
        </div>
        <div className="flex items-center space-x-3 font-mono font-bold text-xs">
          <span className="text-amber-400">Score: {score}</span>
          <span className="text-slate-400">🏹 {arrowsLeft} left</span>
        </div>
      </div>

      {/* Target Canvas Board */}
      <div className="relative w-[300px] h-[300px] rounded-full p-2 bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* White Ring */}
        <div className="w-[240px] h-[240px] rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center">
          {/* Black Ring */}
          <div className="w-[180px] h-[180px] rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
            {/* Blue Ring */}
            <div className="w-[130px] h-[130px] rounded-full bg-sky-500 border-2 border-sky-600 flex items-center justify-center">
              {/* Red Ring */}
              <div className="w-[80px] h-[80px] rounded-full bg-rose-500 border-2 border-rose-600 flex items-center justify-center">
                {/* Gold Bullseye */}
                <div className="w-[36px] h-[36px] rounded-full bg-amber-400 border-2 border-amber-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Hits */}
        {arrowHits.map((hit, i) => (
          <div
            key={i}
            style={{ left: `${hit.x}px`, top: `${hit.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-lg animate-ping" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white absolute top-0 left-0" />
          </div>
        ))}

        {/* Moving Aiming Reticle */}
        {!isDone && (
          <div
            style={{ left: `${reticlePos.x}px`, top: `${reticlePos.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          >
            <div className="w-8 h-8 rounded-full border-2 border-red-500 shadow-lg shadow-red-500/50 flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          </div>
        )}
      </div>

      {lastShot && (
        <div className="text-sm font-bold text-amber-300 animate-in zoom-in-95">
          {lastShot.ring}
        </div>
      )}

      {/* Release Button */}
      <button
        onClick={shootArrow}
        disabled={arrowsLeft <= 0 || isDone}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white font-black text-sm shadow-xl shadow-rose-600/30 transition hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
      >
        <span>🎯 RELEASE ARROW</span>
      </button>

      {isDone && (
        <div className="w-full p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95">
          <h3 className="text-base font-black text-emerald-300 flex items-center justify-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Target Practice Finished! Total Score: {score} pts! 🏆</span>
          </h3>
        </div>
      )}
    </div>
  );
};
