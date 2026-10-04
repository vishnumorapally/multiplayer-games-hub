import React, { useState } from 'react';
import { GameType, Difficulty } from '../types';
import { sounds } from '../utils/sound';
import {
  Search, Bot, Users, Sparkles, Play, Trophy, Flame,
  Compass, PlusCircle, LogIn, X, ChevronRight, Swords,
  Zap, Gauge, ShieldAlert
} from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (playerName: string, avatar: string, gameType: GameType, difficulty?: Difficulty) => void;
  onJoinRoom: (code: string, playerName: string, avatar: string) => void;
  onSoloBotPlay: (playerName: string, avatar: string, gameType: GameType, difficulty?: Difficulty) => void;
  initialRoomCode?: string;
}

const AVATARS = ['🦁', '🐯', '🦊', '🐼', '🐨', '🦄', '🐲', '🤖', '⚡', '🚀', '👑', '🎯', '🦅', '🦈'];

interface GameMeta {
  type: GameType;
  title: string;
  tagline: string;
  category: 'board' | 'action' | 'strategy' | 'puzzle' | 'reflex';
  badge: string;
  badgeColor: string;
  players: string;
  icon: string;
  gradient: string;
  playsCount: string;
  rating: string;
}

export const ALL_GAMES: GameMeta[] = [
  // 1. Hand Cricket
  {
    type: 'hand_cricket',
    title: 'Hand Cricket',
    tagline: 'Legendary bat & bowl duel! Guess numbers 1-6, score boundaries & chase targets.',
    category: 'strategy',
    badge: 'TRENDING 🔥',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    players: '2 Players',
    icon: '🏏',
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    playsCount: '48.2k',
    rating: '4.9'
  },
  // 2. Ludo Supreme
  {
    type: 'ludo',
    title: 'Ludo Supreme',
    tagline: 'Authentic 4-color board! Roll 6 to exit, capture tokens, and race to center home.',
    category: 'board',
    badge: 'CLASSIC 🎲',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    players: '2-4 Players',
    icon: '🎲',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    playsCount: '89.1k',
    rating: '4.8'
  },
  // 3. Chess Grandmaster
  {
    type: 'chess',
    title: 'Chess Grandmaster',
    tagline: 'Official FIDE rules, move highlights, king threat alert, checkmate & notation log.',
    category: 'board',
    badge: 'MASTER ♟️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    players: '2 Players',
    icon: '♟️',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    playsCount: '62.4k',
    rating: '4.9'
  },
  // 4. Snake Arena Battle
  {
    type: 'snake_battle',
    title: 'Snake Arena Battle',
    tagline: 'Real-time 2-player combat! Eat apples, grow massive, and trap opponent trails.',
    category: 'action',
    badge: 'REALTIME ⚡',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    players: '2 Players',
    icon: '🐍',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    playsCount: '54.0k',
    rating: '4.9'
  },
  // 5. Battleship Sea Battle
  {
    type: 'battleship',
    title: 'Sea Battle (Battleship)',
    tagline: 'Command 5 naval warships across 10x10 ocean grids with radar missile strikes.',
    category: 'strategy',
    badge: 'TACTICAL ⚓',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    players: '2 Players',
    icon: '⚓',
    gradient: 'from-cyan-600 via-blue-700 to-indigo-800',
    playsCount: '37.8k',
    rating: '4.7'
  },
  // 6. Connect 4
  {
    type: 'connect4',
    title: 'Connect 4 (Four in a Row)',
    tagline: 'Drop discs into 7 columns with gravity physics. First to align 4 wins!',
    category: 'board',
    badge: 'POPULAR 🔴',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    players: '2 Players',
    icon: '🔴',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    playsCount: '41.5k',
    rating: '4.8'
  },
  // 7. Pong Duel
  {
    type: 'pong_duel',
    title: 'Air Hockey / Pong Duel',
    tagline: 'High-speed paddle deflection arena. Defend your goal and score first to 5 points!',
    category: 'action',
    badge: 'FAST PACED 🏓',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    players: '2 Players',
    icon: '🏓',
    gradient: 'from-pink-600 via-rose-600 to-amber-600',
    playsCount: '33.2k',
    rating: '4.8'
  },
  // 8. Wordle Duel
  {
    type: 'wordle_duel',
    title: 'Wordle Guess Duel',
    tagline: 'Head-to-head word race! Solve the 5-letter hidden word with color tile clues.',
    category: 'puzzle',
    badge: 'BRAIN 🔤',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    players: '2 Players',
    icon: '🔤',
    gradient: 'from-teal-500 via-emerald-600 to-green-700',
    playsCount: '45.1k',
    rating: '4.9'
  },
  // 9. Checkers (Draughts)
  {
    type: 'checkers',
    title: 'Checkers (Draughts)',
    tagline: 'Diagonal jump captures, multi-leaps, and crowning kings on 8x8 dark squares.',
    category: 'board',
    badge: 'CLASSIC 🏁',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    players: '2 Players',
    icon: '🏁',
    gradient: 'from-amber-700 via-orange-800 to-red-900',
    playsCount: '29.3k',
    rating: '4.7'
  },
  // 10. 2048 Speed Rush
  {
    type: 'game_2048',
    title: '2048 Speed Rush',
    tagline: 'Slide and merge identical numbered tiles. Compete for the highest score!',
    category: 'puzzle',
    badge: 'HIGH SCORE 🔢',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    players: 'Solo / 2P Race',
    icon: '🔢',
    gradient: 'from-amber-500 via-yellow-600 to-orange-700',
    playsCount: '52.7k',
    rating: '4.8'
  },
  // 11. Dots & Boxes
  {
    type: 'dots_and_boxes',
    title: 'Dots & Boxes',
    tagline: 'Connect grid dots, complete boxes to claim territory, and seize bonus turns.',
    category: 'board',
    badge: 'STRATEGY 📦',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    players: '2 Players',
    icon: '📦',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-700',
    playsCount: '26.8k',
    rating: '4.6'
  },
  // 12. Memory Match
  {
    type: 'memory_match',
    title: 'Memory Card Flip Battle',
    tagline: 'Flip cards to discover animal pairs! Fast memory matching duel with bonus turns.',
    category: 'reflex',
    badge: 'MEMORY 🃏',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    players: '2 Players',
    icon: '🃏',
    gradient: 'from-violet-600 via-purple-700 to-pink-700',
    playsCount: '31.2k',
    rating: '4.7'
  },
  // 13. Neon Tic-Tac-Toe
  {
    type: 'tictactoe',
    title: 'Neon Tic-Tac-Toe',
    tagline: 'Ultra-fast 3x3 neon blitz with score counters. Best of 3 / 5 instant rematches.',
    category: 'reflex',
    badge: 'BLITZ ⭕',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    players: '2 Players',
    icon: '⭕',
    gradient: 'from-cyan-500 via-sky-600 to-blue-700',
    playsCount: '67.0k',
    rating: '4.7'
  },
  // 14. Rock Paper Scissors Boom
  {
    type: 'rps_boom',
    title: 'RPS Boom (Bomb & Shield)',
    tagline: 'Extended Rock-Paper-Scissors with tactical Bomb & Shield moves. First to 3 wins!',
    category: 'reflex',
    badge: 'HOT ARCADE ✂️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    players: '2 Players',
    icon: '✂️',
    gradient: 'from-red-600 via-rose-600 to-amber-600',
    playsCount: '38.4k',
    rating: '4.8'
  },
  // 15. Minesweeper Duel
  {
    type: 'minesweeper',
    title: 'Minesweeper Duel',
    tagline: 'Head-to-head grid defusal! Reveal safe cells, flag hidden mines, and avoid bombs.',
    category: 'puzzle',
    badge: 'TACTICAL 💣',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    players: '2 Players',
    icon: '💣',
    gradient: 'from-amber-600 via-stone-700 to-zinc-800',
    playsCount: '24.9k',
    rating: '4.7'
  },
  // 16. Math Blitz Race
  {
    type: 'math_blitz',
    title: 'Math Blitz Race',
    tagline: 'Rapid mental arithmetic duel! Solve rapid equations (+, -, ×) before your opponent.',
    category: 'reflex',
    badge: 'SPEED ⚡',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    players: '2 Players',
    icon: '⚡',
    gradient: 'from-emerald-600 via-teal-600 to-blue-700',
    playsCount: '29.1k',
    rating: '4.9'
  },
  // 17. Speed Typing Duel
  {
    type: 'typing_race',
    title: 'Speed Typing Duel',
    tagline: 'Competitive WPM keyboard race! Type arcade words with high accuracy and speed.',
    category: 'reflex',
    badge: 'REFLEX ⌨️',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    players: '2 Players',
    icon: '⌨️',
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    playsCount: '34.5k',
    rating: '4.8'
  },
  // 18. Simon Memory Matrix
  {
    type: 'simon_says',
    title: 'Simon Memory Matrix',
    tagline: 'Repeat the expanding 4-color audio-visual sequence. How many tones can you recall?',
    category: 'reflex',
    badge: 'MEMORY 🔮',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    players: '2 Players',
    icon: '🔮',
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-700',
    playsCount: '27.3k',
    rating: '4.8'
  },
  // 19. Lightning Tap Reflex
  {
    type: 'reaction_tap',
    title: 'Lightning Tap Reflex',
    tagline: 'Wait for green signal then TAP with millisecond reaction time! False start penalty.',
    category: 'reflex',
    badge: 'INTENSE ⏱️',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    players: '2 Players',
    icon: '⏱️',
    gradient: 'from-yellow-500 via-amber-600 to-orange-700',
    playsCount: '42.0k',
    rating: '4.9'
  },
  // 20. Quiz Master Trivia
  {
    type: 'trivia_quiz',
    title: 'Quiz Master Trivia',
    tagline: 'Multiplayer trivia battle! Science, geography, pop culture, sports, and world lore.',
    category: 'puzzle',
    badge: 'TRIVIA 🎓',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    players: '2 Players',
    icon: '🎓',
    gradient: 'from-purple-600 via-indigo-600 to-cyan-700',
    playsCount: '36.8k',
    rating: '4.8'
  },
  // 21. Brick Breaker Smash
  {
    type: 'brick_breaker',
    title: 'Brick Breaker Smash',
    tagline: 'Retro paddle breakout arena! Shatter neon bricks and race for maximum destruction.',
    category: 'action',
    badge: 'RETRO 🧱',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    players: '2 Players',
    icon: '🧱',
    gradient: 'from-red-600 via-orange-600 to-amber-700',
    playsCount: '31.4k',
    rating: '4.7'
  },
  // 22. Gomoku (Five in a Row)
  {
    type: 'gomoku',
    title: 'Gomoku (Five in a Row)',
    tagline: 'Ancient 15x15 board master duel! Align 5 stones uninterrupted horizontally, vertically, or diagonally.',
    category: 'board',
    badge: 'ZEN ⚪',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    players: '2 Players',
    icon: '⚪',
    gradient: 'from-slate-700 via-teal-800 to-cyan-900',
    playsCount: '25.6k',
    rating: '4.9'
  },
  // 23. Othello (Reversi)
  {
    type: 'othello',
    title: 'Othello (Reversi)',
    tagline: 'Trap and flip opponent discs across the 8x8 grid. A minute to learn, a lifetime to master!',
    category: 'board',
    badge: 'STRATEGY 🌓',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    players: '2 Players',
    icon: '🌓',
    gradient: 'from-blue-700 via-indigo-800 to-slate-900',
    playsCount: '23.1k',
    rating: '4.8'
  },
  // 24. Flappy Rush Duel
  {
    type: 'flappy_duel',
    title: 'Flappy Rush Duel',
    tagline: 'Tap to flap through pipes! Survive longer and rack up points in head-to-head flight.',
    category: 'action',
    badge: 'ADDICTIVE 🐤',
    badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    players: '2 Players',
    icon: '🐤',
    gradient: 'from-amber-400 via-yellow-500 to-emerald-600',
    playsCount: '49.8k',
    rating: '4.8'
  },
  // 25. 15 Sliding Tile Puzzle
  {
    type: 'sliding_puzzle',
    title: '15 Sliding Tile Puzzle',
    tagline: 'Classic sliding number grid! Move tiles into numerical order 1 to 15 in minimum moves.',
    category: 'puzzle',
    badge: 'PUZZLE 🧩',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    players: '2 Players',
    icon: '🧩',
    gradient: 'from-indigo-700 via-violet-800 to-purple-900',
    playsCount: '19.8k',
    rating: '4.6'
  },
  // 26. Whack-A-Mole Blitz
  {
    type: 'whack_a_mole',
    title: 'Whack-A-Mole Blitz',
    tagline: 'Hit popup moles fast across 9 holes! Golden moles give +3 bonus points.',
    category: 'reflex',
    badge: 'FUN 🔨',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    players: '2 Players',
    icon: '🔨',
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    playsCount: '35.9k',
    rating: '4.8'
  },
  // 27. Color Flood Conquest
  {
    type: 'color_flood',
    title: 'Color Flood Conquest',
    tagline: 'Flood-fill and conquer territory from your starting corner. Capture more cells to win!',
    category: 'strategy',
    badge: 'TERRITORY 🎨',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    players: '2 Players',
    icon: '🎨',
    gradient: 'from-cyan-600 via-pink-600 to-amber-600',
    playsCount: '28.4k',
    rating: '4.7'
  },
  // 28. Tower Blocks Stacker
  {
    type: 'tower_stack',
    title: 'Tower Blocks Stacker',
    tagline: 'Time your drops to stack oscillating blocks! Perfect alignment keeps your tower wide.',
    category: 'reflex',
    badge: 'PRECISION 🏗️',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    players: '2 Players',
    icon: '🏗️',
    gradient: 'from-teal-600 via-cyan-600 to-blue-700',
    playsCount: '32.1k',
    rating: '4.8'
  },
  // 29. Bullseye Target Archery
  {
    type: 'target_archery',
    title: 'Bullseye Target Archery',
    tagline: 'Aim the moving reticle and release arrows into the yellow 10-point bullseye rings!',
    category: 'action',
    badge: 'AIM 🎯',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    players: '2 Players',
    icon: '🎯',
    gradient: 'from-rose-600 via-red-600 to-orange-600',
    playsCount: '27.7k',
    rating: '4.9'
  },
  // 30. Greedy Pig Dice
  {
    type: 'greedy_dice',
    title: 'Greedy Pig Dice Game',
    tagline: 'Roll dice to accumulate turn score. Bank your points, but rolling a 1 wipes your round!',
    category: 'reflex',
    badge: 'RISK & REWARD 🎲',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    players: '2 Players',
    icon: '🎲',
    gradient: 'from-emerald-600 via-green-600 to-teal-800',
    playsCount: '21.5k',
    rating: '4.7'
  },
  // 31. Uno Color Blitz
  {
    type: 'color_cards',
    title: 'Color Cards Duel (Uno Style)',
    tagline: 'Match cards by color or number! Play Skip, Reverse, and +2 cards. First to empty hand wins.',
    category: 'strategy',
    badge: 'CARD PARTY 🃏',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    players: '2 Players',
    icon: '🃏',
    gradient: 'from-violet-600 via-fuchsia-600 to-rose-600',
    playsCount: '44.6k',
    rating: '4.9'
  },
  // 32. Word Anagram Scramble
  {
    type: 'anagram_duel',
    title: 'Word Anagram Scramble',
    tagline: 'Unscramble jumbled letters into valid words before time runs out. Fastest speller wins!',
    category: 'puzzle',
    badge: 'VOCAB 📝',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    players: '2 Players',
    icon: '📝',
    gradient: 'from-blue-600 via-sky-600 to-teal-700',
    playsCount: '26.0k',
    rating: '4.7'
  },
  // 33. Vegas Coin Pusher
  {
    type: 'coin_pusher',
    title: 'Vegas Arcade Coin Pusher',
    tagline: 'Drop shiny coins onto moving pusher tiers! Trigger cascades of coins and jackpot prizes.',
    category: 'action',
    badge: 'CASUAL 🪙',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    players: 'Solo / 2P Duel',
    icon: '🪙',
    gradient: 'from-amber-500 via-yellow-600 to-orange-700',
    playsCount: '39.2k',
    rating: '4.8'
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(() => {
    return (localStorage.getItem('gv_difficulty') as Difficulty) || 'medium';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'board' | 'action' | 'strategy' | 'puzzle' | 'reflex'>('all');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [modalTab, setModalTab] = useState<'create' | 'join'>('create');
  const [selectedGameForRoom, setSelectedGameForRoom] = useState<GameType>('hand_cricket');
  const [joinCode, setJoinCode] = useState(initialRoomCode);

  // Difficulty selection modal state for Solo play
  const [difficultyModalGame, setDifficultyModalGame] = useState<GameMeta | null>(null);

  const saveProfile = (name: string, av: string, diff: Difficulty) => {
    localStorage.setItem('gv_player_name', name);
    localStorage.setItem('gv_avatar', av);
    localStorage.setItem('gv_difficulty', diff);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    saveProfile(e.target.value, selectedAvatar, selectedDifficulty);
  };

  const handleAvatarSelect = (av: string) => {
    setSelectedAvatar(av);
    saveProfile(playerName, av, selectedDifficulty);
    sounds.playClick();
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    saveProfile(playerName, selectedAvatar, diff);
    sounds.playClick();
  };

  const openDifficultyModal = (game: GameMeta) => {
    sounds.playClick();
    setDifficultyModalGame(game);
  };

  const launchSoloMatch = (gameType: GameType, diff: Difficulty) => {
    sounds.playClick();
    setDifficultyModalGame(null);
    onSoloBotPlay(playerName.trim() || 'Player', selectedAvatar, gameType, diff);
  };

  const openMultiplayerModal = (gameType: GameType) => {
    setSelectedGameForRoom(gameType);
    setModalTab('create');
    setShowRoomModal(true);
    sounds.playClick();
  };

  const filteredGames = ALL_GAMES.filter(g => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured hero game
  const featured = ALL_GAMES[0]; // Hand Cricket

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-2 sm:py-6 animate-in fade-in select-none">
      {/* Top Banner Community Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 rounded-2xl glass-panel border border-slate-800 gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>2,340 PLAYERS ONLINE NOW</span>
          </div>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline">33 Games Available</span>
        </div>

        {/* Player Profile & Difficulty Quick Selector */}
        <div className="flex items-center space-x-3">
          {/* Difficulty Toggle Pill */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-[11px] font-bold">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Bot:</span>
            </span>
            <button
              onClick={() => handleDifficultyChange('easy')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
                selectedDifficulty === 'easy'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
              title="Easy: Relaxed bot with delays & mistakes"
            >
              <span>🟢</span>
              <span>Easy</span>
            </button>
            <button
              onClick={() => handleDifficultyChange('medium')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
                selectedDifficulty === 'medium'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Medium: Balanced bot tactics"
            >
              <span>🟡</span>
              <span>Medium</span>
            </button>
            <button
              onClick={() => handleDifficultyChange('hard')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
                selectedDifficulty === 'hard'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
              title="Hard: Grandmaster bot with instant optimal moves"
            >
              <span>🔴</span>
              <span>Hard</span>
            </button>
          </div>

          {/* Profile Name & Avatar */}
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-lg">{selectedAvatar}</span>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Your name"
              maxLength={15}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none w-20 sm:w-28"
            />
          </div>

          <button
            onClick={() => {
              setModalTab('join');
              setShowRoomModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Join Code</span>
          </button>
        </div>
      </div>

      {/* FEATURED GAME HERO SHOWCASE (AAA Arcade Style) */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/30 p-6 sm:p-10 shadow-2xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5" />
            <span>FEATURED ARCADE HIT · 33 TOTAL GAMES LIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight text-white flex items-center space-x-3">
            <span>{featured.icon}</span>
            <span>{featured.title}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {featured.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => openDifficultyModal(featured)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Bot className="w-4 h-4 fill-slate-950" />
              <span>PLAY SOLO (SELECT DIFFICULTY)</span>
            </button>

            <button
              onClick={() => openMultiplayerModal(featured.type)}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>CREATE MULTIPLAYER ROOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'all', label: 'All Games', count: ALL_GAMES.length, icon: '🎮' },
            { id: 'board', label: 'Board & Classics', count: ALL_GAMES.filter(g => g.category === 'board').length, icon: '🎲' },
            { id: 'strategy', label: 'Strategy & Battles', count: ALL_GAMES.filter(g => g.category === 'strategy').length, icon: '⚔️' },
            { id: 'action', label: 'Action & Arcade', count: ALL_GAMES.filter(g => g.category === 'action').length, icon: '⚡' },
            { id: 'puzzle', label: 'Brain & Puzzle', count: ALL_GAMES.filter(g => g.category === 'puzzle').length, icon: '🧠' },
            { id: 'reflex', label: 'Reflex & Speed', count: ALL_GAMES.filter(g => g.category === 'reflex').length, icon: '⏱️' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setActiveCategory(cat.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.id ? 'bg-indigo-500/50' : 'bg-slate-800'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Real-time Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across 33 games...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GAME CARDS GRID (33 Games) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.type}
            className="group relative rounded-3xl glass-card border border-slate-800 hover:border-indigo-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden"
          >
            {/* Top Row: Icon + Badge */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${game.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition duration-300`}>
                  {game.icon}
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              <h3 className="font-['Outfit'] font-black text-lg text-white group-hover:text-indigo-300 transition">
                {game.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {game.tagline}
              </p>

              <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono mt-3">
                <span>{game.players}</span>
                <span>•</span>
                <span>⭐ {game.rating}</span>
                <span>•</span>
                <span>🔥 {game.playsCount}</span>
              </div>
            </div>

            {/* Action Buttons: Solo Bot (with Difficulty) & Multiplayer */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => openDifficultyModal(game)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow"
                title="Play solo against Bot with Easy, Medium, or Hard difficulty"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Solo Bot</span>
              </button>

              <button
                onClick={() => openMultiplayerModal(game.type)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-1.5"
                title="Create a room and invite a friend"
              >
                <Users className="w-3.5 h-3.5" />
                <span>2-4 Players</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DIFFICULTY SELECTION MODAL (Easy, Medium, Hard) */}
      {difficultyModalGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/40 bg-slate-950/95 shadow-2xl">
            <button
              onClick={() => setDifficultyModalGame(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr ${difficultyModalGame.gradient} flex items-center justify-center text-4xl shadow-xl mb-3`}>
                {difficultyModalGame.icon}
              </div>
              <h2 className="text-xl font-black font-['Outfit'] text-white">
                {difficultyModalGame.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose AI Bot difficulty level for Solo Mode
              </p>
            </div>

            {/* 3 Difficulty Options */}
            <div className="space-y-3 mb-6">
              {/* Easy */}
              <button
                onClick={() => launchSoloMatch(difficultyModalGame.type, 'easy')}
                className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 transition hover:scale-102 flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-500/20 text-emerald-400">🟢</span>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-emerald-300">
                      Easy (Casual & Relaxed)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Relaxed reaction time, occasional errors. Great for learning!
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </button>

              {/* Medium */}
              <button
                onClick={() => launchSoloMatch(difficultyModalGame.type, 'medium')}
                className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500 transition hover:scale-102 flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="text-2xl p-2 rounded-xl bg-amber-500/20 text-amber-400">🟡</span>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-amber-300">
                      Medium (Competitive)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Smart tactical decisions with standard pacing. Balanced match!
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </button>

              {/* Hard */}
              <button
                onClick={() => launchSoloMatch(difficultyModalGame.type, 'hard')}
                className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500 transition hover:scale-102 flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="text-2xl p-2 rounded-xl bg-rose-500/20 text-rose-400">🔴</span>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-rose-300">
                      Hard (Grandmaster AI)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ultra-fast calculations, minimax logic & zero forgiveness.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-500">
              Matches start instantly in less than a second against the local bot server!
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLAYER / ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/40 bg-slate-950/95 shadow-2xl">
            <button
              onClick={() => setShowRoomModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6">
              <button
                onClick={() => setModalTab('create')}
                className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                  modalTab === 'create'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Room</span>
              </button>
              <button
                onClick={() => setModalTab('join')}
                className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                  modalTab === 'join'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            {modalTab === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Select Game (33 Available)
                  </label>
                  <select
                    value={selectedGameForRoom}
                    onChange={(e) => setSelectedGameForRoom(e.target.value as GameType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_GAMES.map(g => (
                      <option key={g.type} value={g.type}>
                        {g.icon} {g.title} ({g.players})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Room AI Bot Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDifficulty(d)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                          selectedDifficulty === d
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d === 'easy' ? '🟢 Easy' : d === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowRoomModal(false);
                    onCreateRoom(playerName.trim() || 'Player', selectedAvatar, selectedGameForRoom, selectedDifficulty);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
                >
                  CREATE ROOM & INVITE FRIENDS 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Enter 6-Digit Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 5PDEXG"
                    maxLength={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-center font-mono text-2xl font-black text-indigo-300 tracking-widest focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!joinCode.trim()) return;
                    sounds.playClick();
                    setShowRoomModal(false);
                    onJoinRoom(joinCode.trim(), playerName.trim() || 'Guest', selectedAvatar);
                  }}
                  disabled={!joinCode.trim()}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
                >
                  JOIN ROOM 🎮
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
