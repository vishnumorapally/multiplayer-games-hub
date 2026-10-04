import React, { useState } from 'react';
import { RoomData, GameType, Difficulty } from '../types';
import { sounds } from '../utils/sound';
import { Copy, Check, Bot, Play, UserCheck, UserX, Crown, Shield, Gauge } from 'lucide-react';

interface RoomLobbyProps {
  room: RoomData;
  myPlayerId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemovePlayer: (playerId: string) => void;
  onChangeGame: (gameType: GameType) => void;
}

const GAME_INFO: Record<GameType, { title: string; icon: string; min: number; max: number; desc: string }> = {
  // 13 Original
  hand_cricket: {
    title: 'Hand Cricket',
    icon: '🏏',
    min: 2,
    max: 2,
    desc: 'The iconic bat & bowl battle! Guess numbers 1-6, score boundaries & chase targets.'
  },
  chess: {
    title: 'Chess Grandmaster',
    icon: '♟️',
    min: 2,
    max: 2,
    desc: 'Classic 8x8 strategy with full FIDE rules, move highlights, check & checkmate.'
  },
  ludo: {
    title: 'Ludo Supreme',
    icon: '🎲',
    min: 2,
    max: 4,
    desc: 'Roll 6 to exit, capture opponent tokens, and race 4 tokens to home stretch!'
  },
  tictactoe: {
    title: 'Neon Tic-Tac-Toe',
    icon: '⭕',
    min: 2,
    max: 2,
    desc: 'Rapid-fire 3x3 neon grid match. Best for quick warmups and instant rematches.'
  },
  connect4: {
    title: 'Connect 4 (Four in a Row)',
    icon: '🔴',
    min: 2,
    max: 2,
    desc: 'Drop discs into 7 columns with gravity. Connect 4 horizontally, vertically, or diagonally!'
  },
  battleship: {
    title: 'Sea Battle (Battleship)',
    icon: '⚓',
    min: 2,
    max: 2,
    desc: 'Deploy 5 secret naval warships on 10x10 ocean grids and fire radar missiles.'
  },
  checkers: {
    title: 'Checkers (Draughts)',
    icon: '🏁',
    min: 2,
    max: 2,
    desc: 'Jump over opponent pieces, make multiple leaps, and crown your pieces to Kings!'
  },
  memory_match: {
    title: 'Memory Card Flip Battle',
    icon: '🃏',
    min: 2,
    max: 2,
    desc: 'Turn-based card matching duel. Match emoji pairs to seize extra turns!'
  },
  dots_and_boxes: {
    title: 'Dots & Boxes',
    icon: '📦',
    min: 2,
    max: 2,
    desc: 'Connect dots on the grid. Complete 1x1 boxes to claim territory and score points!'
  },
  wordle_duel: {
    title: 'Wordle Guess Duel',
    icon: '🔤',
    min: 2,
    max: 2,
    desc: 'Head-to-head word race! Solve the 5-letter hidden word with color tile clues.'
  },
  game_2048: {
    title: '2048 Speed Rush',
    icon: '🔢',
    min: 2,
    max: 2,
    desc: 'Slide and merge identical numbered tiles. Compete for the highest score!'
  },
  snake_battle: {
    title: 'Snake Arena Battle',
    icon: '🐍',
    min: 2,
    max: 2,
    desc: 'Realtime 2-player combat! Eat apples, grow massive, and trap opponent trails.'
  },
  pong_duel: {
    title: 'Air Hockey / Pong Duel',
    icon: '🏓',
    min: 2,
    max: 2,
    desc: 'High-speed paddle deflection arena. Defend your goal and score first to 5 points!'
  },

  // 20 New Games
  rps_boom: {
    title: 'RPS Boom (Bomb & Shield)',
    icon: '✂️',
    min: 2,
    max: 2,
    desc: 'Extended Rock-Paper-Scissors with tactical Bomb & Shield. First to 3 round wins!'
  },
  minesweeper: {
    title: 'Minesweeper Duel',
    icon: '💣',
    min: 2,
    max: 2,
    desc: 'Head-to-head grid defusal! Reveal safe cells, flag hidden mines, and avoid bombs.'
  },
  math_blitz: {
    title: 'Math Blitz Race',
    icon: '⚡',
    min: 2,
    max: 2,
    desc: 'Rapid mental arithmetic duel! Solve rapid equations before your opponent.'
  },
  typing_race: {
    title: 'Speed Typing Duel',
    icon: '⌨️',
    min: 2,
    max: 2,
    desc: 'Competitive WPM keyboard race! Type arcade words with high accuracy and speed.'
  },
  simon_says: {
    title: 'Simon Memory Matrix',
    icon: '🔮',
    min: 2,
    max: 2,
    desc: 'Repeat the expanding 4-color audio-visual sequence with perfect recall.'
  },
  reaction_tap: {
    title: 'Lightning Tap Reflex',
    icon: '⏱️',
    min: 2,
    max: 2,
    desc: 'Wait for green signal then TAP with millisecond reaction time!'
  },
  trivia_quiz: {
    title: 'Quiz Master Trivia',
    icon: '🎓',
    min: 2,
    max: 2,
    desc: 'Multiplayer trivia battle! Science, geography, pop culture, sports, and world lore.'
  },
  brick_breaker: {
    title: 'Brick Breaker Smash',
    icon: '🧱',
    min: 2,
    max: 2,
    desc: 'Retro paddle breakout arena! Shatter neon bricks and race for maximum score.'
  },
  gomoku: {
    title: 'Gomoku (Five in a Row)',
    icon: '⚪',
    min: 2,
    max: 2,
    desc: 'Ancient 15x15 board duel! Align 5 stones horizontally, vertically, or diagonally.'
  },
  othello: {
    title: 'Othello (Reversi)',
    icon: '🌓',
    min: 2,
    max: 2,
    desc: 'Trap and flip opponent discs across the 8x8 grid to dominate the board.'
  },
  flappy_duel: {
    title: 'Flappy Rush Duel',
    icon: '🐤',
    min: 2,
    max: 2,
    desc: 'Tap to flap through pipes! Survive longer and rack up points in flight.'
  },
  sliding_puzzle: {
    title: '15 Sliding Tile Puzzle',
    icon: '🧩',
    min: 2,
    max: 2,
    desc: 'Slide number tiles into numerical order 1 to 15 in minimum moves.'
  },
  whack_a_mole: {
    title: 'Whack-A-Mole Blitz',
    icon: '🔨',
    min: 2,
    max: 2,
    desc: 'Hit popup moles fast across 9 holes! Golden moles give +3 bonus points.'
  },
  color_flood: {
    title: 'Color Flood Conquest',
    icon: '🎨',
    min: 2,
    max: 2,
    desc: 'Flood-fill and conquer territory from your starting corner to claim victory.'
  },
  tower_stack: {
    title: 'Tower Blocks Stacker',
    icon: '🏗️',
    min: 2,
    max: 2,
    desc: 'Time your drops to stack oscillating blocks! Perfect alignment keeps towers wide.'
  },
  target_archery: {
    title: 'Bullseye Target Archery',
    icon: '🎯',
    min: 2,
    max: 2,
    desc: 'Aim the moving reticle and release arrows into the 10-point yellow bullseye.'
  },
  greedy_dice: {
    title: 'Greedy Pig Dice Game',
    icon: '🎲',
    min: 2,
    max: 2,
    desc: 'Roll dice to accumulate points. Bank wisely, rolling a 1 wipes your round score!'
  },
  color_cards: {
    title: 'Color Cards Duel (Uno Style)',
    icon: '🃏',
    min: 2,
    max: 2,
    desc: 'Match cards by color or number! Play Skip, Reverse, and +2. Empty hand to win.'
  },
  anagram_duel: {
    title: 'Word Anagram Scramble',
    icon: '📝',
    min: 2,
    max: 2,
    desc: 'Unscramble jumbled letters into valid words before time runs out.'
  },
  coin_pusher: {
    title: 'Vegas Arcade Coin Pusher',
    icon: '🪙',
    min: 2,
    max: 2,
    desc: 'Drop shiny coins onto moving pusher tiers! Trigger cascades of coins and jackpot prizes.'
  }
};

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  myPlayerId,
  onToggleReady,
  onStartGame,
  onAddBot,
  onRemovePlayer,
  onChangeGame
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === myPlayerId;
  const myPlayer = room.players.find(p => p.id === myPlayerId);

  const currentGame = GAME_INFO[room.gameType] || GAME_INFO.hand_cricket;
  const unreadyPlayers = room.players.filter(p => !p.isHost && !p.isBot && !p.isReady);
  const allPlayersReady = room.players.length >= 2 && unreadyPlayers.length === 0;
  const canStart = allPlayersReady;

  const copyInvite = () => {
    const url = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyBadge = {
    easy: { label: 'EASY BOT', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    medium: { label: 'MEDIUM BOT', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    hard: { label: 'HARD BOT (EXPERT)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
  }[room.difficulty || 'medium'];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in select-none">
      {/* Room Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            WAITING ROOM
          </span>
          <span className={`text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border ${difficultyBadge.color}`}>
            {difficultyBadge.label}
          </span>
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white flex items-center justify-center space-x-3">
          <span>{currentGame.icon}</span>
          <span>{currentGame.title}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">{currentGame.desc}</p>

        {/* Room Code Badge & Copy */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-indigo-500/40 rounded-2xl px-5 py-3 shadow-inner">
            <span className="text-xs font-bold text-slate-400">ROOM CODE:</span>
            <span className="font-mono text-xl font-black tracking-widest text-indigo-300">
              {room.code}
            </span>
          </div>

          <button
            onClick={copyInvite}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>

        {/* Host Game Switcher (33 Games) */}
        {isHost && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-center space-x-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Host: Switch Game in this Room (33 Games):</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-40 overflow-y-auto p-1">
              {(Object.keys(GAME_INFO) as GameType[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    sounds.playClick();
                    onChangeGame(g);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    room.gameType === g
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{GAME_INFO[g].icon}</span>
                  <span>{GAME_INFO[g].title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Players Slots Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-base text-slate-200 font-['Outfit']">
              Player Roster ({room.players.length}/{room.maxPlayers})
            </h2>
          </div>

          {/* Add Bot button if slots remain and isHost */}
          {isHost && room.players.length < room.maxPlayers && (
            <button
              onClick={() => {
                sounds.playClick();
                onAddBot();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>+ Add Bot</span>
            </button>
          )}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {room.players.map((p) => {
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isMe
                    ? 'bg-indigo-950/40 border-indigo-500/40 shadow'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow">
                    {p.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-slate-100">{p.name}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-semibold border border-indigo-500/40">
                          YOU
                        </span>
                      )}
                      {p.isHost && (
                        <span title="Host">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                      {p.isBot && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p.isReady ? (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Not Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                {isHost && p.id !== myPlayerId && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onRemovePlayer(p.id);
                    }}
                    title="Remove"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Empty slot indicators */}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
            <div
              key={`empty_${i}`}
              className="p-3.5 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-between text-slate-600"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600">
                  ?
                </div>
                <div className="text-xs font-medium">Empty Slot</div>
              </div>
              {isHost && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onAddBot();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add Bot
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Start Game & Ready Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isHost && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleReady();
              }}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition ${
                myPlayer?.isReady
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
              }`}
            >
              {myPlayer?.isReady ? 'Cancel Ready' : "I'm Ready!"}
            </button>
          )}

          {isHost && (
            <button
              onClick={() => {
                sounds.playClick();
                onStartGame();
              }}
              disabled={!canStart}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl transition hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 ${
                canStart
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {room.players.length < 2
                  ? `WAITING FOR PLAYERS (1/${room.maxPlayers})`
                  : unreadyPlayers.length > 0
                  ? `WAITING FOR ${unreadyPlayers.map(p => p.name).join(', ')} TO BE READY`
                  : `START MATCH (${room.players.length}/${room.maxPlayers}) 🚀`}
              </span>
            </button>
          )}
        </div>

        {!canStart && isHost && (
          <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center space-x-1.5">
            {room.players.length < 2 ? (
              <span>Waiting for at least 2 players to join or click "+ Add Bot" to play against AI!</span>
            ) : (
              <span className="text-amber-400 font-bold animate-pulse">
                ⚠️ Waiting for {unreadyPlayers.map(p => p.name).join(', ')} to click "I'm Ready!" before match can start.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
