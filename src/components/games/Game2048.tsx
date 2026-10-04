import React, { useEffect } from 'react';
import { Game2048State } from '../../types';
import { sounds } from '../../utils/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flame } from 'lucide-react';

interface Game2048Props {
  gameState: Game2048State;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

const TILE_COLORS: Record<number, string> = {
  0: 'bg-slate-900/60 border-slate-800 text-transparent',
  2: 'bg-slate-800 text-slate-100 border-slate-700',
  4: 'bg-slate-700 text-slate-100 border-slate-600',
  8: 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30',
  16: 'bg-orange-600 text-white border-orange-500 shadow-orange-600/30',
  32: 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30',
  64: 'bg-red-600 text-white border-red-500 shadow-red-600/40',
  128: 'bg-yellow-500 text-slate-950 font-black border-yellow-400 shadow-yellow-500/40',
  256: 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-amber-400/50',
  512: 'bg-emerald-500 text-white font-black border-emerald-400 shadow-emerald-500/50',
  1024: 'bg-cyan-500 text-white font-black border-cyan-400 shadow-cyan-500/50',
  2048: 'bg-purple-600 text-white font-black border-purple-400 ring-4 ring-yellow-400 shadow-purple-600/60'
};

export const Game2048: React.FC<Game2048Props> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const oppId = gameState.playerIds.find(id => id !== myPlayerId) || gameState.playerIds[0];
  const myState = gameState.players[myPlayerId] || gameState.players[gameState.playerIds[0]];
  const oppState = gameState.players[oppId] || gameState.players[gameState.playerIds[1]];

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.status !== 'playing' || myState.gameOver) return;
    sounds.playClick();
    onAction('slide', { direction });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) handleMove('up');
      else if (['ArrowDown', 'KeyS'].includes(e.code)) handleMove('down');
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) handleMove('left');
      else if (['ArrowRight', 'KeyD'].includes(e.code)) handleMove('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, myState.gameOver]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Live Duel Scores */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* My Score */}
        <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{myState.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-indigo-400">YOU</div>
                <div className="text-sm font-bold text-white">{myState.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">SCORE</div>
              <div className="text-xl font-black font-['Outfit'] text-indigo-300">{myState.score}</div>
            </div>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-xs text-amber-300 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Highest: {myState.highestTile}</span>
          </div>
        </div>

        {/* Opponent Score */}
        <div className="p-3.5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{oppState.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-slate-400">OPPONENT</div>
                <div className="text-sm font-bold text-white">{oppState.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">SCORE</div>
              <div className="text-xl font-black font-['Outfit'] text-slate-300">{oppState.score}</div>
            </div>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-xs text-slate-400 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Highest: {oppState.highestTile}</span>
          </div>
        </div>
      </div>

      {/* 2048 4x4 Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-72 h-72 sm:w-80 sm:h-80">
          {myState.board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-2xl border flex items-center justify-center font-['Outfit'] font-black text-xl sm:text-2xl transition transform ${
                  TILE_COLORS[val] || 'bg-purple-700 text-white border-purple-400'
                }`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* On-screen directional buttons for mobile */}
      <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
        <button onClick={() => handleMove('up')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <button onClick={() => handleMove('left')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => handleMove('down')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white">
            <ArrowDown className="w-5 h-5" />
          </button>
          <button onClick={() => handleMove('right')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 hidden sm:block">Use arrow keys (↑, ↓, ←, →) or W, A, S, D to slide tiles.</p>
    </div>
  );
};
