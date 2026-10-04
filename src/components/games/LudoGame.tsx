import React, { useState } from 'react';
import { LudoState, LudoColor } from '../../types';
import { COLOR_OFFSETS, SAFE_GLOBAL_TILES } from '../../utils/ludoConstants';
import { sounds } from '../../utils/sound';
import { Dices, Sparkles, Star } from 'lucide-react';

interface LudoGameProps {
  gameState: LudoState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

// Global 52 track coordinate mapping on 15x15 board (row, col)
const TRACK_COORDS: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0]
];

// Colored home columns (5 steps)
const HOME_COLUMNS: Record<LudoColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};

// Yard spawn positions (row, col) for 4 tokens
const YARD_SLOTS: Record<LudoColor, [number, number][]> = {
  red: [[1, 1], [1, 4], [4, 1], [4, 4]],
  green: [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]]
};

const COLOR_THEMES: Record<LudoColor, {
  bg: string;
  border: string;
  badge: string;
  tokenFill: string;
  tokenBorder: string;
  lightBg: string;
}> = {
  red: {
    bg: 'bg-rose-600',
    border: 'border-rose-500',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    tokenFill: 'bg-rose-500',
    tokenBorder: 'border-rose-300 shadow-rose-500/50',
    lightBg: 'bg-rose-950/40'
  },
  green: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    tokenFill: 'bg-emerald-500',
    tokenBorder: 'border-emerald-300 shadow-emerald-500/50',
    lightBg: 'bg-emerald-950/40'
  },
  yellow: {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    tokenFill: 'bg-amber-400',
    tokenBorder: 'border-amber-100 shadow-amber-400/50',
    lightBg: 'bg-amber-950/40'
  },
  blue: {
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    tokenFill: 'bg-blue-500',
    tokenBorder: 'border-blue-300 shadow-blue-500/50',
    lightBg: 'bg-blue-950/40'
  }
};

const DICE_DOT_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

export const LudoGame: React.FC<LudoGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const [rolling, setRolling] = useState(false);

  const activeColor = gameState.currentColor;
  const activePlayer = gameState.players[activeColor];
  const isMyTurn = activePlayer?.id === myPlayerId;

  // Find user's color if participating
  let myColor: LudoColor | null = null;
  gameState.activeOrder.forEach((color) => {
    if (gameState.players[color].id === myPlayerId) myColor = color;
  });

  const handleRollDice = () => {
    if (!isMyTurn || gameState.awaitingMove || rolling) return;
    setRolling(true);
    sounds.playDiceRoll();
    setTimeout(() => {
      onAction('roll_dice', {});
      setRolling(false);
    }, 450);
  };

  const handleTokenClick = (tokenIndex: number) => {
    if (!isMyTurn || !gameState.awaitingMove) return;
    if (gameState.movableTokens.includes(tokenIndex)) {
      sounds.playClick();
      onAction('move_token', { tokenIndex });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Top Players Turn Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 mb-4 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400">PLAYERS:</div>
          <div className="flex items-center space-x-1.5">
            {gameState.activeOrder.map((color) => {
              const p = gameState.players[color];
              const isCurrent = color === activeColor;
              const theme = COLOR_THEMES[color];
              return (
                <div
                  key={color}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs transition ${
                    isCurrent
                      ? `${theme.badge} ring-2 ring-indigo-400 font-bold scale-105 shadow-md`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span className="hidden sm:inline">{p.name}</span>
                  <span className={`w-2 h-2 rounded-full ${theme.bg}`}></span>
                  {p.hasWon && <span title="Finished!">🏆</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action / Turn Prompt */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Current Turn</div>
            <div className="text-sm font-bold text-white flex items-center space-x-1">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_THEMES[activeColor].bg}`}></span>
              <span>{activePlayer.name} {activePlayer.id === myPlayerId && '(You)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board + Controls Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
        {/* LUDO 15x15 BOARD */}
        <div className="relative p-2 sm:p-3 rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl">
          <div className="grid grid-cols-15 grid-rows-15 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
            
            {/* 4 CORNER YARDS */}
            {/* Red Yard (Top Left: rows 0-5, cols 0-5) */}
            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-rose-600/90 border-r border-b border-slate-900 p-2 flex items-center justify-center">
              <div className="w-[82%] h-[82%] bg-slate-950/80 rounded-2xl border-2 border-rose-400/50 grid grid-cols-2 grid-rows-2 p-2 gap-2">
                {gameState.players.red?.tokens.map((step, idx) => {
                  const isMovable = activeColor === 'red' && isMyTurn && gameState.movableTokens.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTokenClick(idx)}
                      className={`rounded-full flex items-center justify-center transition border ${
                        step === -1 ? 'bg-rose-500/20 border-rose-500/60' : 'bg-slate-900/40 border-slate-800'
                      } ${isMovable ? 'cursor-pointer pulsing-token' : ''}`}
                    >
                      {step === -1 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500 border-2 border-rose-200 shadow-lg shadow-rose-500/50 flex items-center justify-center text-[10px] font-bold text-white">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Green Yard (Top Right: rows 0-5, cols 9-14) */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-600/90 border-l border-b border-slate-900 p-2 flex items-center justify-center">
              <div className="w-[82%] h-[82%] bg-slate-950/80 rounded-2xl border-2 border-emerald-400/50 grid grid-cols-2 grid-rows-2 p-2 gap-2">
                {gameState.players.green?.tokens.map((step, idx) => {
                  const isMovable = activeColor === 'green' && isMyTurn && gameState.movableTokens.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTokenClick(idx)}
                      className={`rounded-full flex items-center justify-center transition border ${
                        step === -1 ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-slate-900/40 border-slate-800'
                      } ${isMovable ? 'cursor-pointer pulsing-token' : ''}`}
                    >
                      {step === -1 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border-2 border-emerald-200 shadow-lg shadow-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-white">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yellow Yard (Bottom Right: rows 9-14, cols 9-14) */}
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-amber-500/90 border-l border-t border-slate-900 p-2 flex items-center justify-center">
              <div className="w-[82%] h-[82%] bg-slate-950/80 rounded-2xl border-2 border-amber-400/50 grid grid-cols-2 grid-rows-2 p-2 gap-2">
                {gameState.players.yellow?.tokens.map((step, idx) => {
                  const isMovable = activeColor === 'yellow' && isMyTurn && gameState.movableTokens.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTokenClick(idx)}
                      className={`rounded-full flex items-center justify-center transition border ${
                        step === -1 ? 'bg-amber-500/20 border-amber-500/60' : 'bg-slate-900/40 border-slate-800'
                      } ${isMovable ? 'cursor-pointer pulsing-token' : ''}`}
                    >
                      {step === -1 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 border-2 border-amber-100 shadow-lg shadow-amber-400/50 flex items-center justify-center text-[10px] font-bold text-slate-950">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blue Yard (Bottom Left: rows 9-14, cols 0-5) */}
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/90 border-r border-t border-slate-900 p-2 flex items-center justify-center">
              <div className="w-[82%] h-[82%] bg-slate-950/80 rounded-2xl border-2 border-blue-400/50 grid grid-cols-2 grid-rows-2 p-2 gap-2">
                {gameState.players.blue?.tokens.map((step, idx) => {
                  const isMovable = activeColor === 'blue' && isMyTurn && gameState.movableTokens.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTokenClick(idx)}
                      className={`rounded-full flex items-center justify-center transition border ${
                        step === -1 ? 'bg-blue-500/20 border-blue-500/60' : 'bg-slate-900/40 border-slate-800'
                      } ${isMovable ? 'cursor-pointer pulsing-token' : ''}`}
                    >
                      {step === -1 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 border-2 border-blue-200 shadow-lg shadow-blue-500/50 flex items-center justify-center text-[10px] font-bold text-white">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER HOME (rows 6-8, cols 6-8 = 20% width/height at center) */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full">
                {/* 4 Colored Center Triangles */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-300 drop-shadow animate-pulse" />
                </div>
              </div>
            </div>

            {/* TRACK TILES (52 track steps) */}
            {TRACK_COORDS.map(([r, c], globalIdx) => {
              const isSafe = SAFE_GLOBAL_TILES.has(globalIdx);
              const isRedStart = globalIdx === 0;
              const isGreenStart = globalIdx === 13;
              const isYellowStart = globalIdx === 26;
              const isBlueStart = globalIdx === 39;

              // Find tokens currently on this global cell
              const tokensOnCell: { color: LudoColor; tokenIdx: number }[] = [];
              gameState.activeOrder.forEach((color) => {
                const player = gameState.players[color];
                player.tokens.forEach((step, tIdx) => {
                  if (step >= 0 && step <= 50) {
                    const gPos = (COLOR_OFFSETS[color] + step) % 52;
                    if (gPos === globalIdx) {
                      tokensOnCell.push({ color, tokenIdx: tIdx });
                    }
                  }
                });
              });

              return (
                <div
                  key={`track_${globalIdx}`}
                  style={{
                    gridRowStart: r + 1,
                    gridColumnStart: c + 1
                  }}
                  className={`relative border border-slate-800/80 flex items-center justify-center ${
                    isRedStart
                      ? 'bg-rose-600/40'
                      : isGreenStart
                      ? 'bg-emerald-600/40'
                      : isYellowStart
                      ? 'bg-amber-500/40'
                      : isBlueStart
                      ? 'bg-blue-600/40'
                      : 'bg-slate-900/60'
                  }`}
                >
                  {isSafe && <Star className="w-2.5 h-2.5 text-yellow-400 opacity-60" />}

                  {/* Render tokens on this cell */}
                  {tokensOnCell.map(({ color, tokenIdx }, i) => {
                    const isMovable = activeColor === color && isMyTurn && gameState.movableTokens.includes(tokenIdx);
                    const theme = COLOR_THEMES[color];
                    return (
                      <div
                        key={i}
                        onClick={() => handleTokenClick(tokenIdx)}
                        className={`absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full ${theme.tokenFill} border ${theme.tokenBorder} flex items-center justify-center text-[8px] font-black text-white shadow transition ${
                          isMovable ? 'cursor-pointer pulsing-token z-20' : ''
                        }`}
                        style={{
                          transform: tokensOnCell.length > 1 ? `translate(${(i - 0.5) * 6}px, ${(i - 0.5) * 6}px)` : 'none'
                        }}
                      >
                        {tokenIdx + 1}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* HOME COLUMNS (5 steps for each color) */}
            {(['red', 'green', 'yellow', 'blue'] as LudoColor[]).map((color) => {
              const coords = HOME_COLUMNS[color];
              const theme = COLOR_THEMES[color];

              return coords.map(([r, c], stepIdx) => {
                const step = 51 + stepIdx; // 51..55

                // Check if any token for this player is on this step
                const tokensOnCell: number[] = [];
                gameState.players[color]?.tokens.forEach((tStep, tIdx) => {
                  if (tStep === step) tokensOnCell.push(tIdx);
                });

                return (
                  <div
                    key={`home_${color}_${stepIdx}`}
                    style={{
                      gridRowStart: r + 1,
                      gridColumnStart: c + 1
                    }}
                    className={`relative border border-slate-800/80 flex items-center justify-center ${theme.bg} opacity-80`}
                  >
                    {tokensOnCell.map((tIdx) => {
                      const isMovable = activeColor === color && isMyTurn && gameState.movableTokens.includes(tIdx);
                      return (
                        <div
                          key={tIdx}
                          onClick={() => handleTokenClick(tIdx)}
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${theme.tokenFill} border ${theme.tokenBorder} flex items-center justify-center text-[8px] font-black text-white shadow ${
                            isMovable ? 'cursor-pointer pulsing-token z-20' : ''
                          }`}
                        >
                          {tIdx + 1}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* RIGHT SIDE: CONTROLS & 3D DICE */}
        <div className="w-full md:w-64 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
            ROLL THE DICE
          </div>

          {/* Big Interactive 3D-styled Dice */}
          <div
            onClick={handleRollDice}
            className={`w-24 h-24 rounded-3xl border-2 shadow-2xl flex items-center justify-center cursor-pointer transition transform ${
              rolling ? 'dice-anim' : ''
            } ${
              isMyTurn && !gameState.awaitingMove
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-300 shadow-indigo-600/40 hover:scale-105 active:scale-95'
                : 'bg-slate-900 border-slate-700 opacity-90'
            }`}
          >
            {gameState.diceValue ? (
              <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-inner grid grid-cols-3 grid-rows-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    {DICE_DOT_LAYOUTS[gameState.diceValue!]?.includes(i) && (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Dices className="w-12 h-12 text-white" />
            )}
          </div>

          {/* Dice Instruction */}
          <div className="mt-4">
            {gameState.awaitingMove ? (
              <div className="text-xs text-amber-300 font-bold flex items-center justify-center space-x-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Select a pulsing token to move!</span>
              </div>
            ) : isMyTurn ? (
              <button
                onClick={handleRollDice}
                disabled={rolling}
                className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
              >
                ROLL DICE 🎲
              </button>
            ) : (
              <div className="text-xs text-slate-400">
                Waiting for {activePlayer.name} to roll...
              </div>
            )}
          </div>

          {/* Rules / Tip */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-left text-[11px] text-slate-400 space-y-1.5 w-full">
            <div className="font-bold text-slate-300 mb-1">Quick Rules:</div>
            <div>• Roll a <span className="font-bold text-amber-300">6</span> to exit the Yard.</div>
            <div>• Rolling 6 grants a <span className="font-bold text-emerald-400">bonus roll</span>!</div>
            <div>• Land on opponent to <span className="font-bold text-rose-400">capture</span> them!</div>
            <div>• Star cells ⭐ are safe zones.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
