import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessState } from '../../types';
import { sounds } from '../../utils/sound';
import { AlertCircle } from 'lucide-react';

interface ChessGameProps {
  gameState: ChessState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

// Unicode Chess Pieces with stylized SVG fallbacks
const CHESS_PIECES: Record<string, string> = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessGame: React.FC<ChessGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargetSquares, setLegalTargetSquares] = useState<string[]>([]);

  const isWhite = gameState.players.w.id === myPlayerId;
  const isBlack = gameState.players.b.id === myPlayerId;
  const myColor = isWhite ? 'w' : isBlack ? 'b' : null;
  const isMyTurn = gameState.turn === myColor;

  // Board orientation (flip for Black player)
  const files = myColor === 'b' ? [...FILES].reverse() : FILES;
  const ranks = myColor === 'b' ? [...RANKS].reverse() : RANKS;

  const chess = new Chess(gameState.fen);
  const board = chess.board();

  // Play sound on check or move
  useEffect(() => {
    if (gameState.inCheck) {
      sounds.playCheck();
    } else if (gameState.lastMove) {
      sounds.playClick();
    }
  }, [gameState.lastMove?.san, gameState.inCheck]);

  const handleSquareClick = (square: string) => {
    if (!isMyTurn) return;

    // If a piece was already selected and clicked a legal target square -> make move!
    if (selectedSquare && legalTargetSquares.includes(square)) {
      onAction('move', {
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });
      setSelectedSquare(null);
      setLegalTargetSquares([]);
      return;
    }

    // Otherwise inspect clicked square
    const piece = chess.get(square as any);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalTargetSquares(moves.map(m => m.to));
      sounds.playClick();
    } else {
      setSelectedSquare(null);
      setLegalTargetSquares([]);
    }
  };

  // Find king position if in check
  let checkKingSquare: string | null = null;
  if (gameState.inCheck) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === gameState.turn) {
          checkKingSquare = `${FILES[c]}${8 - r}`;
        }
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-center animate-in fade-in">
      {/* Main Board Section */}
      <div className="flex-1 flex flex-col items-center">
        {/* Opponent Player Bar */}
        <div className="w-full max-w-[480px] mb-3 flex items-center justify-between px-3 py-2 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow">
              {myColor === 'w' ? gameState.players.b.avatar : gameState.players.w.avatar}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>{myColor === 'w' ? gameState.players.b.name : gameState.players.w.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${myColor === 'w' ? 'bg-slate-700 text-slate-200' : 'bg-amber-100 text-slate-900'}`}>
                  {myColor === 'w' ? 'Black' : 'White'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {gameState.turn === (myColor === 'w' ? 'b' : 'w') ? (
                  <span className="text-indigo-400 font-semibold animate-pulse">Thinking...</span>
                ) : 'Waiting'}
              </div>
            </div>
          </div>
        </div>

        {/* 8x8 Chess Board */}
        <div className="relative p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl border border-slate-700/80">
          <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] border border-slate-900 shadow-inner rounded-lg overflow-hidden select-none">
            {ranks.map((rank) =>
              files.map((file) => {
                const square = `${file}${rank}`;
                const fileIdx = FILES.indexOf(file);
                const rankIdx = 8 - parseInt(rank);
                const isLight = (fileIdx + rankIdx) % 2 === 0;

                const piece = chess.get(square as any);
                const isSelected = selectedSquare === square;
                const isLegalTarget = legalTargetSquares.includes(square);
                const isLastMove = gameState.lastMove && (gameState.lastMove.from === square || gameState.lastMove.to === square);
                const isKingInCheck = checkKingSquare === square;

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                      isKingInCheck
                        ? 'bg-rose-600/80 animate-pulse'
                        : isSelected
                        ? 'bg-indigo-600/70'
                        : isLastMove
                        ? isLight ? 'bg-amber-200/60' : 'bg-amber-600/40'
                        : isLight
                        ? 'bg-[#ececd0]'
                        : 'bg-[#779556]'
                    }`}
                  >
                    {/* Legal Target Dot */}
                    {isLegalTarget && (
                      <div className={`absolute z-10 rounded-full ${
                        piece ? 'w-full h-full border-4 border-indigo-400/80' : 'w-4 h-4 bg-indigo-500/80 shadow-md'
                      }`}></div>
                    )}

                    {/* Coordinates on board edge */}
                    {file === files[0] && (
                      <span className={`absolute top-0.5 left-1 text-[9px] font-bold ${isLight ? 'text-[#779556]' : 'text-[#ececd0]'}`}>
                        {rank}
                      </span>
                    )}
                    {rank === ranks[7] && (
                      <span className={`absolute bottom-0.5 right-1 text-[9px] font-bold ${isLight ? 'text-[#779556]' : 'text-[#ececd0]'}`}>
                        {file}
                      </span>
                    )}

                    {/* Chess Piece */}
                    {piece && (
                      <span
                        className={`text-3xl sm:text-4xl md:text-5xl select-none transform transition hover:scale-110 drop-shadow ${
                          piece.color === 'w'
                            ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                            : 'text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                        }`}
                      >
                        {CHESS_PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Your Player Bar */}
        <div className="w-full max-w-[480px] mt-3 flex items-center justify-between px-3 py-2 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow">
              {myColor === 'w' ? gameState.players.w.avatar : gameState.players.b.avatar}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>{myColor === 'w' ? gameState.players.w.name : gameState.players.b.name} (You)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${myColor === 'w' ? 'bg-amber-100 text-slate-900' : 'bg-slate-700 text-slate-200'}`}>
                  {myColor === 'w' ? 'White' : 'Black'}
                </span>
              </div>
              <div className="text-xs">
                {isMyTurn ? (
                  <span className="text-emerald-400 font-bold animate-pulse">Your Turn to Move!</span>
                ) : (
                  <span className="text-slate-400">Waiting for opponent...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Move Notation & Status */}
      <div className="w-full lg:w-72 glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col h-[400px] lg:h-[540px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-slate-200 font-['Outfit']">Move History</h3>
          <span className="text-xs text-slate-400 font-mono">{gameState.history.length} moves</span>
        </div>

        {gameState.inCheck && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>King is in Check!</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto my-3 space-y-1 text-xs font-mono">
          {gameState.history.length === 0 ? (
            <div className="text-slate-500 italic py-8 text-center">Game started. Make the first move!</div>
          ) : (
            // Group moves by pairs (White, Black)
            Array.from({ length: Math.ceil(gameState.history.length / 2) }).map((_, moveIdx) => {
              const whiteMove = gameState.history[moveIdx * 2];
              const blackMove = gameState.history[moveIdx * 2 + 1];
              return (
                <div key={moveIdx} className="flex items-center px-2 py-1 rounded hover:bg-slate-800/60">
                  <span className="w-8 text-slate-500">{moveIdx + 1}.</span>
                  <span className="w-16 font-semibold text-slate-200">{whiteMove}</span>
                  <span className="w-16 font-semibold text-slate-300">{blackMove || ''}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Turn Indicator */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <div className="text-xs text-slate-400">Current Turn:</div>
          <div className="mt-1 font-bold text-sm text-indigo-300 flex items-center justify-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{gameState.turn === 'w' ? "White's Turn" : "Black's Turn"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
