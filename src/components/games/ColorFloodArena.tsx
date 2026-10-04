import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Crown, Sparkles } from 'lucide-react';

interface ColorFloodArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

const PALETTE = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const ColorFloodArena: React.FC<ColorFloodArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const SIZE = 10;
  const [grid, setGrid] = useState<string[][]>(() => {
    return Array(SIZE).fill(null).map(() =>
      Array(SIZE).fill(null).map(() => PALETTE[Math.floor(Math.random() * PALETTE.length)])
    );
  });

  const [p1Owned, setP1Owned] = useState<Set<string>>(new Set(['0,0']));
  const [p2Owned, setP2Owned] = useState<Set<string>>(new Set([`${SIZE - 1},${SIZE - 1}`]));
  const [currentTurn, setCurrentTurn] = useState<string>(p1.id);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;
  const isMyTurn = currentTurn === me.id;

  const myOwned = isP1 ? p1Owned : p2Owned;
  const oppOwned = isP1 ? p2Owned : p1Owned;

  const myPercent = Math.round((myOwned.size / (SIZE * SIZE)) * 100);
  const oppPercent = Math.round((oppOwned.size / (SIZE * SIZE)) * 100);

  const flood = (chosenColor: string, isPlayerOne: boolean) => {
    sounds.playClick();
    const owned = new Set(isPlayerOne ? p1Owned : p2Owned);
    const newGrid = grid.map(row => [...row]);

    // Recolor all currently owned cells
    for (const pos of owned) {
      const [r, c] = pos.split(',').map(Number);
      newGrid[r][c] = chosenColor;
    }

    // Expand connected cells of the new chosen color
    let expanded = true;
    while (expanded) {
      expanded = false;
      const toAdd: string[] = [];

      for (const pos of owned) {
        const [r, c] = pos.split(',').map(Number);
        const neighbors = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
        ];

        for (const [nr, nc] of neighbors) {
          const key = `${nr},${nc}`;
          if (
            nr >= 0 && nr < SIZE &&
            nc >= 0 && nc < SIZE &&
            !owned.has(key) &&
            newGrid[nr][nc] === chosenColor
          ) {
            toAdd.push(key);
            expanded = true;
          }
        }
      }

      for (const k of toAdd) owned.add(k);
    }

    setGrid(newGrid);
    if (isPlayerOne) {
      setP1Owned(owned);
    } else {
      setP2Owned(owned);
    }

    const pct = Math.round((owned.size / (SIZE * SIZE)) * 100);
    if (pct >= 50) {
      sounds.playVictory();
      onAction('arcade_action', { subAction: 'flood_win', data: { winner: isPlayerOne ? p1.id : p2.id, score: 50, gameOver: true } });
      return;
    }

    const nextTurn = isPlayerOne ? p2.id : p1.id;
    setCurrentTurn(nextTurn);
    onAction('arcade_action', { subAction: 'flood_color', data: { color: chosenColor, territoryPercent: pct } });

    // Bot move
    if (isPlayerOne && opp?.isBot) {
      setTimeout(() => {
        makeBotMove(newGrid, p2Owned);
      }, 550);
    }
  };

  const makeBotMove = (curGrid: string[][], curBotOwned: Set<string>) => {
    // Pick color that gives max territory
    const available = PALETTE.filter(c => curGrid[SIZE - 1][SIZE - 1] !== c);
    const chosen = available[Math.floor(Math.random() * available.length)];
    flood(chosen, false);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header & Percentage Bars */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="font-['Outfit'] font-black text-white text-base">Color Flood Conquest</h2>
              <p className="text-[10px] text-slate-400">Flood-fill adjacent matching colors to conquer territory</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-xl text-xs font-bold ${isMyTurn ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
            {isMyTurn ? 'Your Turn' : `${opp.name}'s Turn`}
          </div>
        </div>

        {/* Territory Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold font-mono mb-1">
            <span className="text-indigo-400">{me.name}: {myPercent}%</span>
            <span className="text-pink-400">{opp.name}: {oppPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${myPercent}%` }}></div>
            <div className="flex-1 bg-slate-950"></div>
            <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${oppPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl">
        <div className="grid grid-cols-10 gap-1.5 p-1 rounded-2xl bg-slate-900" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
          {grid.map((row, r) =>
            row.map((color, c) => {
              const isP1Cell = p1Owned.has(`${r},${c}`);
              const isP2Cell = p2Owned.has(`${r},${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition duration-200 flex items-center justify-center text-[10px] ${
                    isP1Cell ? 'ring-2 ring-indigo-400 shadow-lg' : isP2Cell ? 'ring-2 ring-pink-400 shadow-lg' : 'opacity-85'
                  }`}
                >
                  {r === 0 && c === 0 && '👑'}
                  {r === SIZE - 1 && c === SIZE - 1 && '⭐'}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Palette Color Pickers */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 flex items-center justify-center gap-3">
        {PALETTE.map((color, i) => (
          <button
            key={i}
            onClick={() => flood(color, isP1)}
            disabled={!isMyTurn}
            style={{ backgroundColor: color }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-xl transition hover:scale-110 active:scale-95 border-2 border-white/20 disabled:opacity-40 disabled:scale-100 hover:ring-4 hover:ring-white/40"
          />
        ))}
      </div>
    </div>
  );
};
