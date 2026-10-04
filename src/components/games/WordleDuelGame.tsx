import React, { useState } from 'react';
import { WordleDuelState } from '../../types';
import { sounds } from '../../utils/sound';
import { Send, Delete } from 'lucide-react';

interface WordleDuelGameProps {
  gameState: WordleDuelState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export const WordleDuelGame: React.FC<WordleDuelGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const [currentGuess, setCurrentGuess] = useState('');

  const oppId = gameState.playerIds.find(id => id !== myPlayerId) || gameState.playerIds[0];
  const myState = gameState.players[myPlayerId] || gameState.players[gameState.playerIds[0]];
  const oppState = gameState.players[oppId] || gameState.players[gameState.playerIds[1]];

  const handleKeyPress = (key: string) => {
    if (gameState.status !== 'playing' || myState.solved || myState.guesses.length >= gameState.maxGuesses) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        sounds.playClick();
        onAction('guess_word', { word: currentGuess });
        setCurrentGuess('');
      }
    } else if (key === 'BACK') {
      sounds.playClick();
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      sounds.playClick();
      setCurrentGuess(prev => prev + key);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Dual Progress HUD */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* My Card */}
        <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/40">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{myState.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-indigo-400">YOU</div>
              <div className="text-sm font-bold text-white">{myState.name}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300 font-mono">
            Attempts: {myState.guesses.length}/6 {myState.solved && '• SOLVED! 🎉'}
          </div>
        </div>

        {/* Opponent Card with Live Progress Tiles */}
        <div className="p-3.5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{oppState.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-slate-400">OPPONENT</div>
              <div className="text-sm font-bold text-white">{oppState.name}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Attempts: {oppState.guesses.length}/6 {oppState.solved && '• SOLVED! 🏆'}
          </div>
        </div>
      </div>

      {/* Main 6x5 Wordle Board */}
      <div className="grid grid-rows-6 gap-2 mb-4 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {Array.from({ length: 6 }).map((_, r) => {
          const guessObj = myState.guesses[r];
          const isCurrentRow = r === myState.guesses.length;

          return (
            <div key={r} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, c) => {
                let char = '';
                let tileColor = 'bg-slate-950/70 border-slate-800 text-white';

                if (guessObj) {
                  char = guessObj.word[c];
                  const evalType = guessObj.evaluation[c];
                  if (evalType === 'green') tileColor = 'bg-emerald-600 border-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30';
                  else if (evalType === 'yellow') tileColor = 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30';
                  else tileColor = 'bg-slate-800 border-slate-700 text-slate-400';
                } else if (isCurrentRow && currentGuess[c]) {
                  char = currentGuess[c];
                  tileColor = 'bg-slate-900 border-indigo-500 text-white font-bold scale-105';
                }

                return (
                  <div
                    key={c}
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-['Outfit'] text-xl sm:text-2xl transition transform ${tileColor}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full max-w-lg space-y-1.5 px-2">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map(k => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center ${
                  k === 'ENTER'
                    ? 'px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold'
                    : k === 'BACK'
                    ? 'px-2.5 sm:px-3 bg-rose-600/80 hover:bg-rose-500 text-white'
                    : 'flex-1 max-w-[42px] bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700'
                }`}
              >
                {k === 'BACK' ? <Delete className="w-4 h-4" /> : k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
