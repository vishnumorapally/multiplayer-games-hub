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
      { heading: '1. The Toss', text: 'Call Heads or Tails. Toss winner chooses to Bat or Bowl first.' },
      { heading: '2. Batting & Bowling', text: 'Both players pick numbers 1 to 6. If numbers match -> OUT! If numbers differ -> Batsman scores runs equal to batsman choice.' },
      { heading: '3. Second Innings', text: 'Roles reverse! Chaser needs (1st Innings Runs + 1) to win the match.' }
    ]
  },
  ludo: {
    title: 'Ludo Supreme Rules',
    icon: '🎲',
    sections: [
      { heading: '1. Entering Track', text: 'Roll a 6 to bring a token out of the yard.' },
      { heading: '2. Bonus Rolls', text: 'Rolling 6, capturing an opponent, or reaching home grants an extra roll!' },
      { heading: '3. Safe Star Squares', text: 'Tokens on star squares ⭐ cannot be captured.' }
    ]
  },
  chess: {
    title: 'Chess Grandmaster Rules',
    icon: '♟️',
    sections: [
      { heading: '1. Standard FIDE Rules', text: 'Pawns, Knights, Bishops, Rooks, Queens, and Kings move by official international rules.' },
      { heading: '2. Check & Checkmate', text: 'Escape check when attacked. If king has no legal moves to escape, it is Checkmate!' }
    ]
  },
  tictactoe: {
    title: 'Neon Tic-Tac-Toe Rules',
    icon: '⭕',
    sections: [
      { heading: '1. Goal', text: 'Align 3 of your symbols (X or O) horizontally, vertically, or diagonally on the 3x3 grid.' }
    ]
  },
  connect4: {
    title: 'Connect 4 Rules',
    icon: '🔴',
    sections: [
      { heading: '1. Gravity Drop', text: 'Drop discs into 7 columns. Discs fall to the lowest available space in the column.' },
      { heading: '2. 4-in-a-Row', text: 'First player to connect 4 of their colored discs in a horizontal, vertical, or diagonal line wins!' }
    ]
  },
  battleship: {
    title: 'Battleship Sea Battle Rules',
    icon: '⚓',
    sections: [
      { heading: '1. Secret Fleets', text: 'Both players command 5 hidden naval vessels across a 10x10 ocean grid.' },
      { heading: '2. Radar Targeting', text: 'Fire radar missiles at enemy coordinates. Sinking all 5 enemy ships claims victory!' }
    ]
  },
  checkers: {
    title: 'Checkers (Draughts) Rules',
    icon: '🏁',
    sections: [
      { heading: '1. Movement', text: 'Pieces move 1 step diagonally forward on dark squares.' },
      { heading: '2. Jumps & Kings', text: 'Jump over opponent pieces to capture them. Reaching the opponent back rank crowns your piece into a King 👑 with full backward movement!' }
    ]
  },
  memory_match: {
    title: 'Memory Match Rules',
    icon: '🃏',
    sections: [
      { heading: '1. Turn-Based Flip', text: 'Flip 2 cards on your turn. If they match, you score +1 pair and get a bonus turn!' },
      { heading: '2. Winning', text: 'Player who discovers the most matching pairs wins the match.' }
    ]
  },
  dots_and_boxes: {
    title: 'Dots & Boxes Rules',
    icon: '📦',
    sections: [
      { heading: '1. Drawing Lines', text: 'Connect 2 adjacent dots on the grid.' },
      { heading: '2. Claiming Boxes', text: 'Closing the 4th side of any 1x1 box claims ownership and grants a bonus turn!' }
    ]
  },
  wordle_duel: {
    title: 'Wordle Duel Rules',
    icon: '🔤',
    sections: [
      { heading: '1. Secret Word', text: 'Both players guess the same 5-letter hidden word within 6 tries.' },
      { heading: '2. Letter Clues', text: 'Green = right letter in right spot. Yellow = in word but wrong spot. Gray = not in word.' }
    ]
  },
  game_2048: {
    title: '2048 Speed Rush Rules',
    icon: '🔢',
    sections: [
      { heading: '1. Sliding Tiles', text: 'Slide numbered tiles with arrow keys or swipe. Identical numbers merge into their sum (2+2=4, 4+4=8... 2048)!' },
      { heading: '2. Head-to-Head Duel', text: 'Race your opponent live to reach 2048 or achieve the highest score.' }
    ]
  },
  snake_battle: {
    title: 'Snake Arena Battle Rules',
    icon: '🐍',
    sections: [
      { heading: '1. Eat & Grow', text: 'Guide your snake to eat apples 🍎 and grow longer.' },
      { heading: '2. Arena Combat', text: 'Avoid crashing into outer walls, yourself, or your opponent’s body trail! Last snake standing wins.' }
    ]
  },
  pong_duel: {
    title: 'Air Hockey / Pong Duel Rules',
    icon: '🏓',
    sections: [
      { heading: '1. Paddle Deflection', text: 'Move your paddle up and down to deflect the speeding puck.' },
      { heading: '2. First to 5 Points', text: 'Score goals past your opponent. First player to score 5 points wins!' }
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

  const current = RULES[selectedGame] || RULES.hand_cricket;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel border border-slate-700 bg-slate-950/95 shadow-2xl flex flex-col max-h-[85vh]">
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

        {/* Game Tabs (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 my-3 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          {(Object.keys(RULES) as GameType[]).map((g) => (
            <button
              key={g}
              onClick={() => {
                sounds.playClick();
                setSelectedGame(g);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                selectedGame === g
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{RULES[g].icon}</span>
              <span>{RULES[g].title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
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
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
