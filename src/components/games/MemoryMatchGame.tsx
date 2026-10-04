import React, { useEffect } from 'react';
import { MemoryMatchState } from '../../types';
import { sounds } from '../../utils/sound';
import { Sparkles, Trophy } from 'lucide-react';

interface MemoryMatchGameProps {
  gameState: MemoryMatchState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isMyTurn = gameState.turn === myPlayerId;
  const [p1Id, p2Id] = gameState.playerIds;
  const p1 = gameState.players[p1Id];
  const p2 = gameState.players[p2Id];

  useEffect(() => {
    if (gameState.currentFlips.length === 1) {
      sounds.playClick();
    }
  }, [gameState.currentFlips.length]);

  const handleCardClick = (cardIndex: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;
    const card = gameState.deck[cardIndex];
    if (card.isFlipped || card.isMatched) return;
    onAction('flip_card', { cardIndex });
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
              <span className="text-xs text-slate-400 block -mt-1">pairs</span>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className={`p-3.5 rounded-2xl glass-card border transition ${
          gameState.turn === p2Id ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p2.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-pink-400">{p2Id === myPlayerId ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p2.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-pink-300">{p2.score}</span>
              <span className="text-xs text-slate-400 block -mt-1">pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="mb-4 text-xs font-bold text-center">
        {isMyTurn ? (
          <span className="text-emerald-400 animate-pulse flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your turn! Flip 2 cards to find a matching pair.</span>
          </span>
        ) : (
          <span className="text-slate-400">Waiting for {gameState.turn === p1Id ? p1.name : p2.name}...</span>
        )}
      </div>

      {/* 4x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {gameState.deck.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border flex items-center justify-center text-3xl sm:text-4xl transition transform ${
                card.isMatched
                  ? 'bg-emerald-950/60 border-emerald-500/50 opacity-90 scale-95 shadow-inner'
                  : isRevealed
                  ? 'bg-indigo-600/40 border-indigo-400 shadow-lg scale-102'
                  : isMyTurn
                  ? 'bg-slate-950 hover:bg-slate-800 border-slate-700 hover:border-indigo-400 cursor-pointer hover:scale-105 active:scale-95 shadow'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              {isRevealed ? (
                <span className="animate-in zoom-in-75 duration-200">{card.emoji}</span>
              ) : (
                <span className="text-base text-slate-600 font-black">?</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
