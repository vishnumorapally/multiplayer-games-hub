import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, RotateCcw } from 'lucide-react';

interface OthelloArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const OthelloArena: React.FC<OthelloArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [board, setBoard] = useState<(string | null)[][]>(() => {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    b[3][3] = 'W'; b[3][4] = 'B';
    b[4][3] = 'B'; b[4][4] = 'W';
    return b;
  });

  const [currentTurn, setCurrentTurn] = useState<string>(p1.id);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;
  const myPiece = isP1 ? 'B' : 'W';
  const oppPiece = isP1 ? 'W' : 'B';
  const isMyTurn = currentTurn === me.id;

  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  const getFlips = (b: (string | null)[][], r: number, c: number, piece: string) => {
    if (b[r][c]) return [];
    const otherPiece = piece === 'B' ? 'W' : 'B';
    const allFlips: { r: number; c: number }[] = [];

    for (const [dr, dc] of DIRS) {
      const flipsInDir: { r: number; c: number }[] = [];
      let step = 1;
      let matched = false;

      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8 || !b[nr][nc]) break;
        if (b[nr][nc] === otherPiece) {
          flipsInDir.push({ r: nr, c: nc });
          step++;
        } else if (b[nr][nc] === piece) {
          matched = true;
          break;
        }
      }

      if (matched && flipsInDir.length > 0) {
        allFlips.push(...flipsInDir);
      }
    }
    return allFlips;
  };

  const getValidMoves = (b: (string | null)[][], piece: string) => {
    const moves: { r: number; c: number; flips: { r: number; c: number }[] }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const flips = getFlips(b, r, c, piece);
        if (flips.length > 0) moves.push({ r, c, flips });
      }
    }
    return moves;
  };

  const validMoves = isMyTurn && !isGameOver ? getValidMoves(board, myPiece) : [];

  const handleCellClick = (r: number, c: number) => {
    if (!isMyTurn || isGameOver) return;
    const flips = getFlips(board, r, c, myPiece);
    if (flips.length === 0) return;

    sounds.playClick();
    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = myPiece;
    for (const f of flips) {
      nextBoard[f.r][f.c] = myPiece;
    }
    setBoard(nextBoard);

    // Count pieces
    let bCount = 0, wCount = 0;
    for (const row of nextBoard) {
      for (const cell of row) {
        if (cell === 'B') bCount++;
        if (cell === 'W') wCount++;
      }
    }

    if (bCount + wCount === 64) {
      setIsGameOver(true);
      sounds.playVictory();
      onAction('arcade_action', { subAction: 'othello_game_over', data: { bCount, wCount, gameOver: true } });
      return;
    }

    setCurrentTurn(opp.id);
    onAction('arcade_action', { subAction: 'place_disc', data: { r, c } });

    // Bot move
    if (opp?.isBot) {
      setTimeout(() => {
        makeBotMove(nextBoard);
      }, 550);
    }
  };

  const makeBotMove = (b: (string | null)[][]) => {
    const oppMoves = getValidMoves(b, oppPiece);
    if (oppMoves.length === 0) {
      // Pass back to player
      setCurrentTurn(me.id);
      return;
    }

    // Pick move that captures most, or corners (0,0), (0,7), (7,0), (7,7)
    oppMoves.sort((m1, m2) => {
      const isCorner1 = (m1.r === 0 || m1.r === 7) && (m1.c === 0 || m1.c === 7) ? 10 : 0;
      const isCorner2 = (m2.r === 0 || m2.r === 7) && (m2.c === 0 || m2.c === 7) ? 10 : 0;
      return (m2.flips.length + isCorner2) - (m1.flips.length + isCorner1);
    });

    const chosen = oppMoves[0];
    sounds.playClick();
    const nextBoard = b.map(row => [...row]);
    nextBoard[chosen.r][chosen.c] = oppPiece;
    for (const f of chosen.flips) {
      nextBoard[f.r][f.c] = oppPiece;
    }
    setBoard(nextBoard);
    setCurrentTurn(me.id);
  };

  // Count
  let bCount = 0, wCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'B') bCount++;
      if (cell === 'W') wCount++;
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Score Header */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 shadow" />
            <span className="text-xs font-bold text-slate-200">{p1.name} (Black)</span>
          </div>
          <span className="text-2xl font-black font-['Outfit'] text-white">{bCount}</span>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow" />
            <span className="text-xs font-bold text-slate-200">{p2.name} (White)</span>
          </div>
          <span className="text-2xl font-black font-['Outfit'] text-white">{wCount}</span>
        </div>
      </div>

      {/* 8x8 Felt Board */}
      <div className="p-4 rounded-3xl bg-emerald-950 border-4 border-emerald-800 shadow-2xl">
        <div className="grid grid-cols-8 gap-1 bg-emerald-800/80 rounded-2xl p-1 shadow-inner">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLegal = validMoves.some(m => m.r === r && m.c === c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={!isLegal}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/90 border border-emerald-900/40 flex items-center justify-center transition active:scale-95 ${
                    isLegal ? 'hover:bg-emerald-600/80 cursor-pointer' : ''
                  }`}
                >
                  {cell === 'B' && (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950 border border-slate-700 shadow-md transform transition" />
                  )}
                  {cell === 'W' && (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-300 shadow-md transform transition" />
                  )}
                  {!cell && isLegal && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-300/60 animate-pulse" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        {isMyTurn ? 'Your turn! Tap a square with a glowing dot to flip opponent discs.' : `Waiting for ${opp.name}...`}
      </div>
    </div>
  );
};
