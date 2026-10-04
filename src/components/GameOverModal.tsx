import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface GameOverModalProps {
  winner: string | 'draw' | 'tie' | null;
  winReason: string;
  isHost: boolean;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winReason,
  isHost,
  onRematch,
  onReturnToLobby
}) => {
  useEffect(() => {
    sounds.playVictory();
    // Confetti blast
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/40 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 shadow-2xl text-center">
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Trophy icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-xl shadow-amber-500/30">
          <Trophy className="w-10 h-10 text-slate-950" />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
          MATCH FINISHED!
        </h2>

        <p className="mt-3 text-base sm:text-lg text-slate-200 font-semibold leading-relaxed">
          {winReason || 'Great match!'}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onRematch();
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          {isHost && (
            <button
              onClick={() => {
                sounds.playClick();
                onReturnToLobby();
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition"
            >
              <Home className="w-4 h-4" />
              <span>Room Lobby</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
