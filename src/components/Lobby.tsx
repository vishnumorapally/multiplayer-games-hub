import React, { useState } from 'react';
import { GameType } from '../types';
import { sounds } from '../utils/sound';
import { PlusCircle, LogIn, Bot, Users, Trophy, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (playerName: string, avatar: string, gameType: GameType) => void;
  onJoinRoom: (code: string, playerName: string, avatar: string) => void;
  onSoloBotPlay: (playerName: string, avatar: string, gameType: GameType) => void;
  initialRoomCode?: string;
}

const AVATARS = ['🦁', '🐯', '🦊', '🐼', '🐨', '🦄', '🐲', '🤖', '⚡', '🚀', '👑', '🎯'];

interface GameOption {
  type: GameType;
  title: string;
  tagline: string;
  badge: string;
  players: string;
  icon: string;
  gradient: string;
  highlights: string[];
}

const GAME_OPTIONS: GameOption[] = [
  {
    type: 'hand_cricket',
    title: 'Hand Cricket',
    tagline: 'Iconic Schoolyard Bat & Bowl Duel',
    badge: 'Trending 🔥',
    players: '2 Players',
    icon: '🏏',
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    highlights: ['Coin toss choice', '1-6 Number duel', 'Live commentary & targets']
  },
  {
    type: 'ludo',
    title: 'Ludo Supreme',
    tagline: 'Authentic 4-Player Board Game',
    badge: 'Classic 🎲',
    players: '2 - 4 Players',
    icon: '🎲',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    highlights: ['Safe star squares', 'Capture & bonus rolls', 'Smart bot fill-in']
  },
  {
    type: 'chess',
    title: 'Chess Grandmaster',
    tagline: 'FIDE Rules & Precision Strategy',
    badge: 'Strategy ♟️',
    players: '2 Players',
    icon: '♟️',
    gradient: 'from-indigo-500 via-purple-600 to-pink-600',
    highlights: ['Full check & checkmate', 'Move highlighting', 'Notation history']
  },
  {
    type: 'tictactoe',
    title: 'Neon Tic-Tac-Toe',
    tagline: 'Fast Blitz & Best of 5 Rounds',
    badge: 'Quick Match ⚡',
    players: '2 Players',
    icon: '⭕',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    highlights: ['Instant warmup', 'Scoreboard tracker', 'Neon strike FX']
  }
];

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  onSoloBotPlay,
  initialRoomCode = ''
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('gv_player_name') || `Player_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('gv_avatar') || '🦁';
  });

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [selectedGame, setSelectedGame] = useState<GameType>('hand_cricket');
  const [joinCode, setJoinCode] = useState(initialRoomCode);

  const saveProfile = (name: string, av: string) => {
    localStorage.setItem('gv_player_name', name);
    localStorage.setItem('gv_avatar', av);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    saveProfile(e.target.value, selectedAvatar);
  };

  const handleAvatarSelect = (av: string) => {
    setSelectedAvatar(av);
    saveProfile(playerName, av);
    sounds.playClick();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onCreateRoom(playerName.trim() || 'Player 1', selectedAvatar, selectedGame);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    sounds.playClick();
    onJoinRoom(joinCode.trim(), playerName.trim() || 'Guest', selectedAvatar);
  };

  const handleQuickBot = (gameType: GameType) => {
    sounds.playClick();
    onSoloBotPlay(playerName.trim() || 'Player', selectedAvatar, gameType);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 py-4 sm:py-8 animate-in fade-in select-none">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Real-time Multiplayer Browser Gaming Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
          Play Together. <br className="hidden sm:inline" />
          Anywhere. Anytime.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Create a private room, share your link with friends, or challenge our smart bots in legendary classics like Hand Cricket, Ludo, Chess & Tic-Tac-Toe!
        </p>
      </div>

      {/* User Profile Bar (Avatar + Name) */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/30 max-w-xl mx-auto shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center text-3xl shadow-inner">
            {selectedAvatar}
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Avatar Selector Tray */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">Choose Avatar:</div>
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => handleAvatarSelect(av)}
                className={`w-9 h-9 min-w-9 rounded-xl flex items-center justify-center text-lg transition ${
                  selectedAvatar === av
                    ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110 shadow-lg shadow-indigo-600/40'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room Action Tabs (Create vs Join) */}
      <div className="max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('create');
            }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Room</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('join');
            }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select Game
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {GAME_OPTIONS.map((g) => {
                  const isSelected = selectedGame === g.type;
                  return (
                    <button
                      key={g.type}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedGame(g.type);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-100">{g.title}</div>
                        <div className="text-[11px] text-slate-400">{g.players}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
            >
              CREATE PRIVATE ROOM 🚀
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Enter 6-Digit Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. 7X29KR"
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-center font-mono text-2xl font-black text-indigo-300 tracking-widest placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:scale-100 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
            >
              JOIN ROOM 🎮
            </button>
          </form>
        )}
      </div>

      {/* Featured Games Showcase Grid with Instant Bot Match Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-['Outfit'] text-white">All Arcade Games</h2>
            <p className="text-xs text-slate-400">Play with friends or jump straight into solo bot practice</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_OPTIONS.map((game) => (
            <div
              key={game.type}
              className="glass-card rounded-3xl p-5 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition group hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div>
                {/* Header & Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${game.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                    {game.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {game.badge}
                  </span>
                </div>

                <h3 className="font-['Outfit'] font-black text-lg text-white group-hover:text-indigo-300 transition">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  {game.tagline}
                </p>

                {/* Feature bullets */}
                <div className="space-y-1.5 mb-6 text-xs text-slate-300">
                  {game.highlights.map((h, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bot Play Action */}
              <button
                onClick={() => handleQuickBot(game.type)}
                className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-400 text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Play vs Bot (Solo)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
