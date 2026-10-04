import React, { useState, useEffect } from 'react';
import { RoomData } from '../types';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

interface TurnTimerBarProps {
  room: RoomData;
  myPlayerId: string;
}

export const TurnTimerBar: React.FC<TurnTimerBarProps> = ({ room, myPlayerId }) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const totalDuration = room.turnTimeLimit || 30;

  useEffect(() => {
    if (!room.turnDeadline) return;

    const updateTimer = () => {
      const remainingMs = room.turnDeadline! - Date.now();
      const sec = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(sec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [room.turnDeadline]);

  if (!room.turnDeadline || room.status !== 'playing' || room.gameState?.status === 'game_over') {
    return null;
  }

  // Determine active player
  const game = room.gameState;
  const gt = room.gameType;
  let activeId: string | null = null;

  if (gt === 'chess') {
    activeId = game.turn === 'w' ? game.players?.white?.id : game.players?.black?.id;
  } else if (
    gt === 'ludo' ||
    gt === 'tictactoe' ||
    gt === 'connect4' ||
    gt === 'battleship' ||
    gt === 'checkers' ||
    gt === 'memory_match' ||
    gt === 'dots_and_boxes'
  ) {
    activeId = game.currentTurn;
  } else if (gt === 'hand_cricket') {
    if (game.status === 'toss') activeId = game.toss?.callerId;
    else if (game.status === 'choose_action') activeId = game.toss?.winnerId;
  } else if (game.turn) {
    activeId = game.turn;
  } else if (game.data?.currentTurn) {
    activeId = game.data.currentTurn;
  }

  const activePlayer = room.players.find(p => p.id === activeId) || null;
  const isMyTurn = activeId === myPlayerId;
  const percent = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  const isLowTime = timeLeft <= 5;
  const isMidTime = timeLeft <= 15;

  const barColor = isLowTime
    ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
    : isMidTime
    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  const borderColor = isLowTime
    ? 'border-rose-500/60 shadow-lg shadow-rose-500/20'
    : isMidTime
    ? 'border-amber-500/40'
    : 'border-slate-800';

  return (
    <div className={`w-full max-w-xl mx-auto mb-4 p-3 rounded-2xl glass-panel border transition-all duration-300 ${borderColor} select-none`}>
      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
        <div className="flex items-center space-x-2">
          {isLowTime ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Clock className={`w-4 h-4 ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`} />
          )}

          {activePlayer ? (
            <span>
              {isMyTurn ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                  YOUR TURN
                </span>
              ) : (
                <span className="text-slate-300">
                  {activePlayer.avatar} {activePlayer.name}'s Turn
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">Turn Timer</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`font-mono text-sm font-black ${isLowTime ? 'text-rose-400 text-base' : isMidTime ? 'text-amber-400' : 'text-slate-200'}`}>
            {timeLeft}s
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (Auto-Pass / Forfeit at 0s)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-500 ease-linear rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
