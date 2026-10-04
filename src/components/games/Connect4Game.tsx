import React, { useEffect } from 'react';
import { Connect4State } from '../../types';
import { sounds } from '../../utils/sound';

interface Connect4GameProps {
  gameState: Connect4State;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const Connect4Game: React.FC<Connect4GameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isRed = gameState.players.R.id === myPlayerId;
  const isYellow = gameState.players.Y.id === myPlayerId;
  const myColor = isRed ? 'R' : isYellow ? 'Y' : null;
  const isMyTurn = gameState.turn === myColor;

  const playerRed = gameState.players.R;
  const playerYellow = gameState.players.Y;

  useEffect(() => {
    if (gameState.lastDrop) {
      sounds.playClick();
    }
  }, [gameState.lastDrop]);

  const handleColumnClick = (col: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;
    onAction('drop_disc', { col });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Player Header HUD */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Red Player */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === 'R' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-xl">
              {playerRed.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase">RED {isRed && '(YOU)'}</div>
              <div className="text-sm font-bold text-slate-100">{playerRed.name}</div>
            </div>
          </div>
        </div>

        {/* Yellow Player */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === 'Y' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-xl">
              {playerYellow.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase">YELLOW {isYellow && '(YOU)'}</div>
              <div className="text-sm font-bold text-slate-100">{playerYellow.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="mb-4 text-xs font-bold text-center">
        {isMyTurn ? (
          <span className="text-emerald-400 animate-pulse">Your turn! Click a column to drop your disc.</span>
        ) : (
          <span className="text-slate-400">Waiting for {gameState.turn === 'R' ? playerRed.name : playerYellow.name}...</span>
        )}
      </div>

      {/* Connect 4 Board (7 columns x 6 rows) */}
      <div className="p-3 sm:p-5 rounded-3xl bg-blue-700/90 border-4 border-blue-600 shadow-2xl shadow-blue-700/30">
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-2">
          {Array.from({ length: 7 }).map((_, col) => (
            <button
              key={col}
              onClick={() => handleColumnClick(col)}
              disabled={!isMyTurn || gameState.board[0][col] !== null}
              className={`h-8 rounded-xl font-black text-xs transition flex items-center justify-center ${
                isMyTurn && gameState.board[0][col] === null
                  ? 'bg-blue-600 hover:bg-white text-white hover:text-blue-900 shadow hover:scale-105 active:scale-95'
                  : 'opacity-0 cursor-default'
              }`}
            >
              ▼
            </button>
          ))}
        </div>

        {/* 6 Rows Grid */}
        <div className="grid grid-rows-6 gap-2">
          {gameState.board.map((row, r) => (
            <div key={r} className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {row.map((cell, c) => {
                const isWinning = gameState.winningCells?.some(([wr, wc]) => wr === r && wc === c);
                const isLast = gameState.lastDrop?.row === r && gameState.lastDrop?.col === c;

                return (
                  <div
                    key={c}
                    onClick={() => handleColumnClick(c)}
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition border ${
                      cell === 'R'
                        ? 'bg-rose-500 border-rose-300 shadow-inner'
                        : cell === 'Y'
                        ? 'bg-amber-400 border-amber-200 shadow-inner'
                        : 'bg-slate-950/80 border-blue-900/60'
                    } ${isWinning ? 'ring-4 ring-white animate-pulse' : ''} ${
                      isLast ? 'ring-2 ring-white/60' : ''
                    } ${isMyTurn && gameState.board[0][c] === null ? 'cursor-pointer' : ''}`}
                  >
                    {isWinning && <span className="text-white text-lg">★</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
