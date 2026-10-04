import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Shuffle, Sparkles, Send } from 'lucide-react';

interface AnagramArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

const PUZZLES = [
  {
    letters: 'PLANET',
    valid: ['PLANET', 'PLANE', 'PLANT', 'PLATE', 'LEAP', 'PALE', 'LATE', 'TALE', 'PLAN', 'LANE', 'NEAT']
  },
  {
    letters: 'CASTLE',
    valid: ['CASTLE', 'SCALE', 'STALE', 'LEAST', 'TALES', 'SLATE', 'SALE', 'LATE', 'TALE', 'CATS']
  },
  {
    letters: 'SILVER',
    valid: ['SILVER', 'LIVER', 'RIVEL', 'LIVE', 'VILE', 'RISE', 'SIRE', 'VEIL']
  },
  {
    letters: 'STREAM',
    valid: ['STREAM', 'MASTER', 'SMART', 'STARE', 'TEAMS', 'MEATS', 'STEAM', 'RATES', 'TEARS', 'TEAM', 'MEAT', 'STAR']
  }
];

export const AnagramArena: React.FC<AnagramArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = PUZZLES[puzzleIndex];

  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Tap letter tiles or type to form valid words!');

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  const handleAddLetter = (char: string) => {
    sounds.playClick();
    setCurrentWord(w => w + char);
  };

  const handleClear = () => {
    sounds.playClick();
    setCurrentWord('');
  };

  const handleSubmit = () => {
    const word = currentWord.toUpperCase().trim();
    if (!word) return;

    if (foundWords.includes(word)) {
      sounds.playWicket();
      setMessage(`"${word}" already discovered!`);
      setCurrentWord('');
      return;
    }

    if (currentPuzzle.valid.includes(word)) {
      sounds.playVictory();
      const pts = word.length * 5;
      const nextFound = [...foundWords, word];
      const nextScore = score + pts;

      setFoundWords(nextFound);
      setScore(nextScore);
      setMessage(`Great job! "${word}" scored +${pts} pts! 🎉`);
      setCurrentWord('');

      if (nextFound.length >= 5 || nextScore >= 50) {
        onAction('arcade_action', { subAction: 'anagram_win', data: { winner: me.id, score: nextScore, gameOver: true } });
      }
    } else {
      sounds.playWicket();
      setMessage(`"${word}" is not on the word list. Try again!`);
      setCurrentWord('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📝</span>
          <div>
            <h2 className="font-['Outfit'] font-black text-white text-base">Word Anagram Scramble</h2>
            <p className="text-[10px] text-slate-400">Discover words hidden inside the anagram letters</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-['Outfit'] text-amber-300 font-mono">{score}</span>
          <span className="text-[10px] text-slate-400 block -mt-1">pts</span>
        </div>
      </div>

      {/* Main Tile Arena */}
      <div className="w-full p-6 rounded-3xl glass-panel border border-slate-800 shadow-2xl text-center space-y-4">
        {/* Current Word Display */}
        <div className="h-16 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 flex items-center justify-center font-mono text-3xl font-black tracking-widest text-indigo-300">
          {currentWord || <span className="text-slate-600 text-sm font-sans font-normal">Tap letters below</span>}
        </div>

        {/* Letter Tiles */}
        <div className="flex items-center justify-center gap-2">
          {currentPuzzle.letters.split('').map((char, i) => (
            <button
              key={i}
              onClick={() => handleAddLetter(char)}
              className="w-12 h-14 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-black font-['Outfit'] text-2xl shadow-lg shadow-indigo-600/30 transition hover:scale-110 active:scale-95 border border-indigo-400/40"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="flex-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SUBMIT WORD</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 font-medium">{message}</p>

        {/* Discovered Words Chips */}
        {foundWords.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Discovered ({foundWords.length}):</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {foundWords.map((w, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-xs font-bold text-indigo-300 font-mono">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
