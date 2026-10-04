import React from 'react';
import { DotsAndBoxesState } from '../../types';
import { sounds } from '../../utils/sound';

interface DotsAndBoxesGameProps {
  gameState: DotsAndBoxesState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isMyTurn = gameState.turn === myPlayerId;
  const [p1Id, p2Id] = gameState.playerIds;
  const p1 = gameState.players[p1Id];
  const p2 = gameState.players[p2Id];

  const handleLineClick = (type: 'h' | 'v', r: number, c: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;
    sounds.playClick();
    onAction('draw_line', { type, r, c });
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Player Scores HUD */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Player 1 */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === p1Id ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p1.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-indigo-400">{p1Id === myPlayerId ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p1.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-indigo-300">{p1.score}</span>
              <span className="text-xs text-slate-400 block -mt-1">boxes</span>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === p2Id ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p2.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-rose-400">{p2Id === myPlayerId ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p2.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-rose-300">{p2.score}</span>
              <span className="text-xs text-slate-400 block -mt-1">boxes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="mb-4 text-xs font-bold text-center">
        {isMyTurn ? (
          <span className="text-emerald-400 animate-pulse">Your turn! Connect dots to claim squares.</span>
        ) : (
          <span className="text-slate-400">Waiting for {gameState.turn === p1Id ? p1.name : p2.name}...</span>
        )}
      </div>

      {/* Dots & Boxes Grid (4x4 Dots = 3x3 Boxes) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center">
        {Array.from({ length: 4 }).map((_, r) => (
          <React.Fragment key={r}>
            {/* Horizontal Line Row */}
            <div className="flex items-center">
              {Array.from({ length: 4 }).map((_, c) => (
                <React.Fragment key={c}>
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-slate-200 shadow-md ring-2 ring-slate-700"></div>

                  {/* Horizontal Segment */}
                  {c < 3 && (
                    <div
                      onClick={() => handleLineClick('h', r, c)}
                      className={`h-2.5 w-16 sm:w-20 rounded-full transition ${
                        gameState.hLines[r][c]
                          ? gameState.hLines[r][c] === p1Id ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'
                          : isMyTurn
                          ? 'bg-slate-800 hover:bg-slate-600 cursor-pointer'
                          : 'bg-slate-800/80'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Vertical Segment Row & Boxes */}
            {r < 3 && (
              <div className="flex items-center">
                {Array.from({ length: 4 }).map((_, c) => (
                  <React.Fragment key={c}>
                    {/* Vertical Segment */}
                    <div
                      onClick={() => handleLineClick('v', r, c)}
                      className={`w-2.5 h-16 sm:h-20 rounded-full transition ${
                        gameState.vLines[r][c]
                          ? gameState.vLines[r][c] === p1Id ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'
                          : isMyTurn
                          ? 'bg-slate-800 hover:bg-slate-600 cursor-pointer'
                          : 'bg-slate-800/80'
                      }`}
                    ></div>

                    {/* Box Interior */}
                    {c < 3 && (
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl transition ${
                        gameState.boxes[r][c]
                          ? gameState.boxes[r][c] === p1Id
                            ? 'bg-indigo-500/30 border border-indigo-500/50'
                            : 'bg-rose-500/30 border border-rose-500/50'
                          : 'bg-transparent'
                      }`}>
                        {gameState.boxes[r][c] && (
                          <span className="text-xl sm:text-2xl animate-in zoom-in-50">
                            {gameState.boxes[r][c] === p1Id ? p1.avatar : p2.avatar}
                          </span>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
