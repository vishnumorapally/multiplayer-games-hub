import React, { useState } from 'react';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import { GameType } from '../types';
import { sounds } from '../utils/sound';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGame?: GameType;
}

const RULES: Record<GameType, { title: string; icon: string; sections: { heading: string; text: string }[] }> = {
  hand_cricket: {
    title: 'Hand Cricket Rules',
    icon: '🏏',
    sections: [
      {
        heading: '1. The Toss',
        text: 'Players flip a coin (Heads/Tails). The toss winner chooses whether to Bat or Bowl first.'
      },
      {
        heading: '2. Batting & Bowling Turns',
        text: 'Both players simultaneously pick a number from 1 to 6. If both choices match, the batsman is OUT! If choices differ, the batsman scores runs equal to their chosen number.'
      },
      {
        heading: '3. Innings & Target Chase',
        text: 'When the first innings ends (wicket or overs finish), roles reverse! The 2nd innings team must score (Innings 1 Runs + 1) to win the match.'
      }
    ]
  },
  ludo: {
    title: 'Ludo Supreme Rules',
    icon: '🎲',
    sections: [
      {
        heading: '1. Entering the Board',
        text: 'Each player has 4 tokens in their yard. You must roll a 6 to bring a token out to your starting square.'
      },
      {
        heading: '2. Bonus Rolls',
        text: 'You get a bonus roll if you roll a 6, capture an opponent’s token, or reach the center Home!'
      },
      {
        heading: '3. Captures & Safe Squares',
        text: 'Landing on an opponent token on non-safe squares sends them back to their yard! Squares marked with a Star ⭐ are safe zones.'
      },
      {
        heading: '4. Winning',
        text: 'Navigate all 4 tokens around the 52-step circuit and up your home stretch into the center to win!'
      }
    ]
  },
  chess: {
    title: 'Chess Grandmaster Rules',
    icon: '♟️',
    sections: [
      {
        heading: '1. Piece Movement',
        text: 'Pawns advance forward and capture diagonally. Knights jump in an L-shape. Bishops move diagonally. Rooks move in ranks/files. Queens move in all directions.'
      },
      {
        heading: '2. Check & Checkmate',
        text: 'When your King is under direct attack, you are in Check. You must escape check. If no legal move can save the King, it is Checkmate and game over.'
      },
      {
        heading: '3. Special Rules',
        text: 'Supports castling, pawn promotion upon reaching the 8th rank, and draw detection.'
      }
    ]
  },
  tictactoe: {
    title: 'Neon Tic-Tac-Toe Rules',
    icon: '⭕',
    sections: [
      {
        heading: '1. The Objective',
        text: 'Take turns placing your symbol (X or O) on the 3x3 grid.'
      },
      {
        heading: '2. Winning',
        text: 'The first player to align 3 of their symbols horizontally, vertically, or diagonally wins the round!'
      }
    ]
  }
};

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  defaultGame = 'hand_cricket'
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(defaultGame);

  if (!isOpen) return null;

  const current = RULES[selectedGame];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl glass-panel border border-slate-700 bg-slate-950/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold font-['Outfit'] text-white">How to Play Guide</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {(['hand_cricket', 'ludo', 'chess', 'tictactoe'] as GameType[]).map((g) => (
            <button
              key={g}
              onClick={() => {
                sounds.playClick();
                setSelectedGame(g);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                selectedGame === g
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{RULES[g].icon}</span>
              <span className="hidden sm:inline">{g === 'hand_cricket' ? 'Cricket' : g === 'tictactoe' ? 'TicTacToe' : g.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center space-x-2 text-indigo-300 font-bold text-lg font-['Outfit']">
            <span>{current.icon}</span>
            <span>{current.title}</span>
          </div>

          <div className="space-y-3">
            {current.sections.map((sec, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5 mb-1">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sec.heading}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">{sec.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
