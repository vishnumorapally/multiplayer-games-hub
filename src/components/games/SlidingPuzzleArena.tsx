import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

interface SlidingPuzzleArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const SlidingPuzzleArena: React.FC<SlidingPuzzleArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  // 4x4 puzzle with tiles 1..15 and 0 as empty slot
  const [tiles, setTiles] = useState<number[]>(() => {
    // Solvable configuration
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 12, 13, 14, 11, 15];
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [timerSec, setTimerSec] = useState(0);

  useEffect(() => {
    if (isSolved) return;
    const interval = setInterval(() => setTimerSec(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isSolved]);

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      sounds.playClick();
      const nextTiles = [...tiles];
      nextTiles[emptyIndex] = tiles[index];
      nextTiles[index] = 0;
      setTiles(nextTiles);
      setMoves(m => m + 1);

      // Check solved
      const solved = nextTiles.slice(0, 15).every((val, i) => val === i + 1) && nextTiles[15] === 0;
      if (solved) {
        setIsSolved(true);
        sounds.playVictory();
        onAction('arcade_action', { subAction: 'puzzle_solved', data: { moves: moves + 1, timeSeconds: timerSec, gameOver: true } });
      }
    }
  };

  const handleShuffle = () => {
    sounds.playClick();
    const shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 12, 13, 14, 11, 15].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setMoves(0);
    setIsSolved(false);
    setTimerSec(0);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header Info */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="font-['Outfit'] font-black text-white text-base">15 Sliding Puzzle</h2>
          <p className="text-[10px] text-slate-400">Slide tiles in order from 1 to 15</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono font-bold">
          <span className="text-indigo-400">Moves: {moves}</span>
          <span className="text-amber-400">⏱️ {timerSec}s</span>
        </div>
      </div>

      {/* 4x4 Grid */}
      <div className="p-4 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2.5 p-1 rounded-2xl bg-slate-950/80 shadow-inner">
          {tiles.map((num, i) => {
            const isCorrect = num === i + 1;
            if (num === 0) {
              return (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/40 border border-slate-800/40"
                />
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleTileClick(i)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl font-black font-['Outfit'] text-2xl transition hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center border ${
                  isCorrect
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-400/50 shadow-emerald-600/20'
                    : 'bg-slate-800 hover:bg-indigo-600 text-slate-100 hover:text-white border-slate-700 hover:border-indigo-400'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {isSolved && (
        <div className="w-full p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95">
          <h3 className="text-base font-black text-emerald-300 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>PUZZLE SOLVED! Completed in {moves} moves ({timerSec}s)! 🏆</span>
          </h3>
        </div>
      )}

      <button
        onClick={handleShuffle}
        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
      >
        <Shuffle className="w-3.5 h-3.5" />
        <span>Shuffle Tiles</span>
      </button>
    </div>
  );
};
