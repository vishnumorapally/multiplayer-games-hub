import React, { useState } from 'react';
import { CheckersState } from '../../types';
import { getLegalCheckersMoves } from '../../utils/checkersUtils';
import { sounds } from '../../utils/sound';

interface CheckersGameProps {
  gameState: CheckersState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const CheckersGame: React.FC<CheckersGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const isRed = gameState.players.r.id === myPlayerId;
  const isBlack = gameState.players.b.id === myPlayerId;
  const myColor = isRed ? 'r' : isBlack ? 'b' : null;
  const isMyTurn = gameState.turn === myColor;

  const playerRed = gameState.players.r;
  const playerBlack = gameState.players.b;

  const legalMoves = selectedCell ? getLegalCheckersMoves(gameState.board, selectedCell[0], selectedCell[1]) : [];

  const handleCellClick = (r: number, c: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;

    // If already selected, check if clicked a valid target square
    if (selectedCell) {
      const targetMove = legalMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (targetMove) {
        sounds.playClick();
        onAction('move', { from: selectedCell, to: [r, c] });
        setSelectedCell(null);
        return;
      }
    }

    // Inspect clicked piece
    const piece = gameState.board[r][c];
    if (piece && piece.toLowerCase() === myColor) {
      sounds.playClick();
      setSelectedCell([r, c]);
    } else {
      setSelectedCell(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Player Header HUD */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Red Player */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === 'r' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-xl">
              {playerRed.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-400">RED {isRed && '(YOU)'}</div>
              <div className="text-sm font-bold text-white">{playerRed.name}</div>
              <div className="text-xs text-slate-400">Pieces left: {playerRed.piecesLeft}</div>
            </div>
          </div>
        </div>

        {/* Black Player */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === 'b' ? 'border-slate-400 ring-2 ring-slate-400/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-xl">
              {playerBlack.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-300">BLACK {isBlack && '(YOU)'}</div>
              <div className="text-sm font-bold text-white">{playerBlack.name}</div>
              <div className="text-xs text-slate-400">Pieces left: {playerBlack.piecesLeft}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Prompt */}
      <div className="mb-3 text-xs font-bold text-center">
        {isMyTurn ? (
          <span className="text-emerald-400 animate-pulse">Your turn! Select a piece to move.</span>
        ) : (
          <span className="text-slate-400">Waiting for {gameState.turn === 'r' ? playerRed.name : playerBlack.name}...</span>
        )}
      </div>

      {/* 8x8 Checkers Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl">
        <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-xl overflow-hidden border border-slate-800">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => {
              const isDark = (r + c) % 2 === 1;
              const piece = gameState.board[r][c];
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isLegal = legalMoves.some(m => m.to[0] === r && m.to[1] === c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => isDark && handleCellClick(r, c)}
                  className={`relative flex items-center justify-center transition ${
                    isDark ? 'bg-[#5c3c24]' : 'bg-[#e2c499]'
                  } ${isDark && isMyTurn ? 'cursor-pointer' : ''}`}
                >
                  {/* Legal move dot */}
                  {isLegal && (
                    <div className="absolute w-4 h-4 rounded-full bg-emerald-400/80 shadow-md ring-2 ring-white z-20"></div>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition transform ${
                        piece.toLowerCase() === 'r'
                          ? 'bg-rose-600 border-2 border-rose-300 text-white shadow-rose-600/50'
                          : 'bg-slate-950 border-2 border-slate-600 text-white shadow-black/80'
                      } ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
                    >
                      {(piece === 'R' || piece === 'B') ? '👑' : ''}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
