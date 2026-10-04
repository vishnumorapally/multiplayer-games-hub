import React, { useEffect } from 'react';
import { TicTacToeState } from '../../types';
import { sounds } from '../../utils/sound';

interface TicTacToeGameProps {
  gameState: TicTacToeState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isX = gameState.players.X.id === myPlayerId;
  const isO = gameState.players.O.id === myPlayerId;
  const mySymbol = isX ? 'X' : isO ? 'O' : null;
  const isMyTurn = gameState.turn === mySymbol;

  const playerX = gameState.players.X;
  const playerO = gameState.players.O;

  useEffect(() => {
    if (gameState.winner) {
      sounds.playVictory();
    }
  }, [gameState.winner]);

  const handleCellClick = (index: number) => {
    if (!isMyTurn || gameState.board[index] !== null || gameState.status !== 'playing') return;
    sounds.playClick();
    onAction('move', { cellIndex: index });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Score Board */}
      <div className="w-full grid grid-cols-2 gap-4 mb-6">
        {/* Player X */}
        <div className={`p-4 rounded-2xl glass-card border transition ${
          gameState.turn === 'X' ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
              {playerX.avatar}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold">PLAYER X {isX && '(YOU)'}</div>
              <div className="text-sm font-bold text-slate-100">{playerX.name}</div>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-2xl font-black font-['Outfit'] text-cyan-400">{playerX.score}</span>
            <span className="text-xs text-slate-400 ml-1">pts</span>
          </div>
        </div>

        {/* Player O */}
        <div className={`p-4 rounded-2xl glass-card border transition ${
          gameState.turn === 'O' ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl">
              {playerO.avatar}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold">PLAYER O {isO && '(YOU)'}</div>
              <div className="text-sm font-bold text-slate-100">{playerO.name}</div>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-2xl font-black font-['Outfit'] text-pink-400">{playerO.score}</span>
            <span className="text-xs text-slate-400 ml-1">pts</span>
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="mb-4 text-center">
        {isMyTurn ? (
          <span className="text-emerald-400 font-bold text-sm animate-pulse">
            Your turn to place {mySymbol}!
          </span>
        ) : (
          <span className="text-slate-400 text-sm">
            Waiting for {gameState.turn === 'X' ? playerX.name : playerO.name}...
          </span>
        )}
      </div>

      {/* 3x3 Neon Grid */}
      <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80 p-3 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl">
        {gameState.board.map((cell, idx) => {
          const isWinningCell = gameState.winningLine?.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`rounded-2xl border flex items-center justify-center transition transform ${
                cell === null && isMyTurn
                  ? 'cursor-pointer hover:bg-slate-800/80 hover:scale-102 border-slate-700 bg-slate-950/60'
                  : 'border-slate-800 bg-slate-950/80'
              } ${isWinningCell ? 'ring-4 ring-amber-400 bg-amber-500/20' : ''}`}
            >
              {cell === 'X' && (
                <span className="text-5xl font-black font-['Outfit'] text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-in zoom-in-50 duration-200">
                  X
                </span>
              )}
              {cell === 'O' && (
                <span className="text-5xl font-black font-['Outfit'] text-pink-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-in zoom-in-50 duration-200">
                  O
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
