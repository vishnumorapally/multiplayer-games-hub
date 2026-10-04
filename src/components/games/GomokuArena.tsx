import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Crown, Sparkles, RotateCcw } from 'lucide-react';

interface GomokuArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const GomokuArena: React.FC<GomokuArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(15).fill(null).map(() => Array(15).fill(null))
  );
  const [currentTurn, setCurrentTurn] = useState<string>(p1.id);
  const [winningLine, setWinningLine] = useState<{ r: number; c: number }[] | null>(null);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;
  const isMyTurn = currentTurn === me.id;

  const myPiece = isP1 ? 'B' : 'W';
  const oppPiece = isP1 ? 'W' : 'B';

  const checkFiveInARow = (b: (string | null)[][], r: number, c: number, piece: string) => {
    const dirs = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal down-right
      [1, -1]  // Diagonal down-left
    ];

    for (const [dr, dc] of dirs) {
      const line = [{ r, c }];
      // Forward
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && b[nr][nc] === piece) {
          line.push({ r: nr, c: nc });
          step++;
        } else break;
      }
      // Backward
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && b[nr][nc] === piece) {
          line.push({ r: nr, c: nc });
          step++;
        } else break;
      }

      if (line.length >= 5) {
        return line;
      }
    }
    return null;
  };

  const handleClickCell = (r: number, c: number) => {
    if (!isMyTurn || board[r][c] || winningLine) return;

    sounds.playClick();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = myPiece;
    setBoard(newBoard);

    const win = checkFiveInARow(newBoard, r, c, myPiece);
    if (win) {
      setWinningLine(win);
      sounds.playVictory();
      onAction('arcade_action', { subAction: 'gomoku_win', data: { winner: me.id, score: 50, gameOver: true } });
      return;
    }

    setCurrentTurn(opp.id);
    onAction('arcade_action', { subAction: 'place_stone', data: { r, c, piece: myPiece } });

    // Bot move in solo
    if (opp?.isBot) {
      setTimeout(() => {
        makeBotMove(newBoard);
      }, 500);
    }
  };

  const makeBotMove = (curBoard: (string | null)[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (!curBoard[r][c]) {
          // Priority to cells near existing stones
          let near = false;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && curBoard[nr][nc]) {
                near = true;
                break;
              }
            }
          }
          if (near) emptyCells.push({ r, c });
        }
      }
    }

    const chosen = emptyCells.length > 0
      ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
      : { r: 7, c: 7 };

    sounds.playClick();
    const nextBoard = curBoard.map(row => [...row]);
    nextBoard[chosen.r][chosen.c] = oppPiece;
    setBoard(nextBoard);

    const win = checkFiveInARow(nextBoard, chosen.r, chosen.c, oppPiece);
    if (win) {
      setWinningLine(win);
      sounds.playWicket();
      onAction('arcade_action', { subAction: 'gomoku_win', data: { winner: opp.id, score: 50, gameOver: true } });
    } else {
      setCurrentTurn(me.id);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚪</span>
          <div>
            <h2 className="font-['Outfit'] font-black text-white text-base">Gomoku (Five in a Row)</h2>
            <p className="text-[10px] text-slate-400">Align 5 stones horizontally, vertically, or diagonally</p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
          isMyTurn ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <span>{isMyTurn ? 'Your Turn' : `${opp.name}'s Turn`}</span>
        </div>
      </div>

      {/* 15x15 Wooden Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-amber-950/80 border-2 border-amber-700/60 shadow-2xl relative">
        <div className="grid grid-cols-15 gap-0 bg-amber-200/90 rounded-2xl p-1.5 shadow-inner" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWinCell = winningLine?.some(w => w.r === r && w.c === c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClickCell(r, c)}
                  disabled={!isMyTurn || !!cell || !!winningLine}
                  className={`w-5 h-5 sm:w-7 sm:h-7 border border-amber-900/30 flex items-center justify-center relative transition hover:bg-amber-400/40 active:scale-95 ${
                    isWinCell ? 'bg-amber-400/60 ring-2 ring-amber-500 animate-pulse' : ''
                  }`}
                >
                  {cell === 'B' && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950 border border-slate-700 shadow-md"></div>
                  )}
                  {cell === 'W' && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border border-slate-300 shadow-md"></div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {winningLine && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95">
          <h3 className="text-base font-black text-emerald-300 flex items-center justify-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>FIVE IN A ROW! {board[winningLine[0].r][winningLine[0].c] === myPiece ? 'You Win! 🏆' : `${opp.name} Wins!`}</span>
          </h3>
        </div>
      )}
    </div>
  );
};
