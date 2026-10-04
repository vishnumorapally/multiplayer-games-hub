import React, { useEffect } from 'react';
import { BattleshipState } from '../../types';
import { sounds } from '../../utils/sound';
import { Target, Shield, Crosshair } from 'lucide-react';

interface BattleshipGameProps {
  gameState: BattleshipState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const BattleshipGame: React.FC<BattleshipGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isMyTurn = gameState.turn === myPlayerId;
  const oppId = gameState.playerIds.find(id => id !== myPlayerId) || gameState.playerIds[0];

  const myState = gameState.players[myPlayerId] || gameState.players[gameState.playerIds[0]];
  const oppState = gameState.players[oppId] || gameState.players[gameState.playerIds[1]];

  useEffect(() => {
    if (gameState.lastShot) {
      if (gameState.lastShot.result === 'hit') sounds.playCricketHit();
      else sounds.playClick();
    }
  }, [gameState.lastShot]);

  const handleCellFire = (r: number, c: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;
    if (oppState.shotsReceived[r][c] !== null) return;
    onAction('fire', { r, c });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* HUD Bar */}
      <div className="w-full flex flex-wrap items-center justify-between p-3.5 mb-4 rounded-2xl glass-card border border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-xl">
            {myState.avatar}
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-400">COMMANDER (YOU)</div>
            <div className="text-sm font-bold text-white">{myState.name}</div>
          </div>
        </div>

        {/* Turn Status */}
        <div className="text-center px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-extrabold uppercase text-slate-400">RADAR STATUS</div>
          <div className="text-sm font-black text-white flex items-center space-x-1.5 justify-center">
            {isMyTurn ? (
              <span className="text-emerald-400 animate-pulse flex items-center space-x-1">
                <Crosshair className="w-4 h-4" />
                <span>YOUR TURN TO FIRE!</span>
              </span>
            ) : (
              <span className="text-amber-400">ENEMY PREPARING MISSILE...</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="text-xs font-bold text-rose-400">ENEMY ADMIRAL</div>
            <div className="text-sm font-bold text-white">{oppState.name}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-xl">
            {oppState.avatar}
          </div>
        </div>
      </div>

      {/* Main Dual Grid View (Enemy Radar vs My Fleet) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* ENEMY WATERS (RADAR TARGETING) */}
        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-cyan-300 font-['Outfit'] flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>ENEMY RADAR (TARGET & FIRE)</span>
            </h3>
            <span className="text-xs text-slate-400">Sunk: {oppState.shipsSunk}/5</span>
          </div>

          <div className="grid grid-cols-11 gap-1 text-[10px] text-slate-500 font-mono text-center">
            <div></div>
            {LETTERS.map(l => <div key={l} className="font-bold">{l}</div>)}

            {Array.from({ length: 10 }).map((_, r) => (
              <React.Fragment key={r}>
                <div className="font-bold self-center text-slate-400">{r + 1}</div>
                {Array.from({ length: 10 }).map((_, c) => {
                  const shot = oppState.shotsReceived[r][c];
                  return (
                    <div
                      key={c}
                      onClick={() => handleCellFire(r, c)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition ${
                        shot === 'hit'
                          ? 'bg-rose-600/90 border-rose-400 text-white font-bold'
                          : shot === 'miss'
                          ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300 text-xs'
                          : isMyTurn
                          ? 'bg-slate-900/80 hover:bg-cyan-600/40 border-slate-800 hover:border-cyan-400 cursor-crosshair'
                          : 'bg-slate-900/50 border-slate-800/80'
                      }`}
                    >
                      {shot === 'hit' && '💥'}
                      {shot === 'miss' && '•'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* MY FLEET (DEFENSE VIEW) */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-indigo-300 font-['Outfit'] flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>MY FLEET (DEFENSE)</span>
            </h3>
            <span className="text-xs text-slate-400">My Ships Left: {5 - myState.shipsSunk}/5</span>
          </div>

          <div className="grid grid-cols-11 gap-1 text-[10px] text-slate-500 font-mono text-center">
            <div></div>
            {LETTERS.map(l => <div key={l} className="font-bold">{l}</div>)}

            {Array.from({ length: 10 }).map((_, r) => (
              <React.Fragment key={r}>
                <div className="font-bold self-center text-slate-400">{r + 1}</div>
                {Array.from({ length: 10 }).map((_, c) => {
                  const shipName = myState.board[r][c];
                  const shot = myState.shotsReceived[r][c];

                  return (
                    <div
                      key={c}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-xs ${
                        shot === 'hit'
                          ? 'bg-rose-600/90 border-rose-400 text-white'
                          : shot === 'miss'
                          ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                          : shipName
                          ? 'bg-indigo-600/40 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      {shot === 'hit' ? '💥' : shot === 'miss' ? '•' : shipName ? '🚢' : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Ships status list */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {myState.fleet.map(s => (
              <div key={s.name} className={`px-2.5 py-1.5 rounded-xl border text-[11px] flex items-center justify-between ${
                s.isSunk ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 line-through' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <span>{s.icon} {s.name}</span>
                <span className="font-mono text-[10px]">{s.size} cells</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
