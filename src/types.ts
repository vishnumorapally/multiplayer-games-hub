export type GameType =
  | 'hand_cricket'
  | 'ludo'
  | 'chess'
  | 'tictactoe'
  | 'connect4'
  | 'battleship'
  | 'checkers'
  | 'memory_match'
  | 'dots_and_boxes'
  | 'wordle_duel'
  | 'game_2048'
  | 'snake_battle'
  | 'pong_duel';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  senderId: string;
  text: string;
  type: 'text' | 'reaction';
  timestamp: string;
}

export interface RoomData {
  code: string;
  hostId: string;
  gameType: GameType;
  maxPlayers: number;
  status: 'lobby' | 'playing';
  players: Player[];
  gameState: any;
  chat: ChatMessage[];
}

// Hand Cricket Specific
export interface HandCricketBallResult {
  ball: number;
  batNum: number;
  bowlNum: number;
  isOut: boolean;
  runs: number;
  totalScore: number;
  commentary: string;
}

export interface HandCricketState {
  gameType: 'hand_cricket';
  status: 'toss' | 'choose_action' | 'innings1' | 'innings2' | 'game_over';
  players: { p1: Player; p2: Player };
  toss: {
    callerId: string;
    callChoice: 'heads' | 'tails' | null;
    coinResult: 'heads' | 'tails' | null;
    winnerId: string | null;
  };
  battingFirstId: string | null;
  bowlingFirstId: string | null;
  currentBatsmanId: string | null;
  currentBowlerId: string | null;
  innings: 1 | 2;
  maxBalls: number;
  innings1: {
    batsmanId: string | null;
    bowlerId: string | null;
    score: number;
    wickets: number;
    balls: number;
    history: HandCricketBallResult[];
  };
  innings2: {
    batsmanId: string | null;
    bowlerId: string | null;
    score: number;
    wickets: number;
    balls: number;
    target: number;
    history: HandCricketBallResult[];
  };
  currentTurnSelections: Record<string, number>;
  lastBallResult: HandCricketBallResult | null;
  winner: string | 'tie' | null;
  winReason: string;
}

// Chess Specific
export interface ChessState {
  gameType: 'chess';
  status: 'playing' | 'game_over';
  fen: string;
  turn: 'w' | 'b';
  players: {
    w: Player & { color: 'w'; timeLeft: number };
    b: Player & { color: 'b'; timeLeft: number };
  };
  timerMinutes: number;
  history: string[];
  lastMove: {
    from: string;
    to: string;
    san: string;
    piece: string;
    color: string;
    captured?: string;
  } | null;
  inCheck: boolean;
  winner: string | 'draw' | null;
  winReason: string;
}

// Ludo Specific
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayerState {
  id: string;
  name: string;
  avatar: string;
  color: LudoColor;
  isBot: boolean;
  tokens: [number, number, number, number];
  finishedTokens: number;
  hasWon: boolean;
  rank: number | null;
}

export interface LudoState {
  gameType: 'ludo';
  status: 'playing' | 'game_over';
  activeOrder: LudoColor[];
  currentTurnIndex: number;
  currentColor: LudoColor;
  diceValue: number | null;
  consecutiveSixes: number;
  awaitingMove: boolean;
  movableTokens: number[];
  winner: string | null;
  winReason: string;
  rankings: LudoColor[];
  history: string[];
  players: Record<LudoColor, LudoPlayerState>;
}

// Tic-Tac-Toe Specific
export interface TicTacToeState {
  gameType: 'tictactoe';
  status: 'playing' | 'game_over';
  board: (string | null)[];
  turn: 'X' | 'O';
  players: {
    X: Player & { symbol: 'X'; score: number };
    O: Player & { symbol: 'O'; score: number };
  };
  winningLine: number[] | null;
  winner: string | 'draw' | null;
  winReason: string;
}

// Connect 4 Specific
export interface Connect4State {
  gameType: 'connect4';
  status: 'playing' | 'game_over';
  board: ('R' | 'Y' | null)[][];
  turn: 'R' | 'Y';
  players: {
    R: Player & { color: 'R'; score: number };
    Y: Player & { color: 'Y'; score: number };
  };
  winningCells: [number, number][] | null;
  lastDrop: { row: number; col: number; color: 'R' | 'Y' } | null;
  winner: string | 'draw' | null;
  winReason: string;
}

// Battleship Specific
export interface BattleshipState {
  gameType: 'battleship';
  status: 'playing' | 'game_over';
  turn: string;
  players: Record<string, {
    id: string;
    name: string;
    avatar: string;
    isBot: boolean;
    fleet: { name: string; size: number; icon: string; hits: number; isSunk: boolean }[];
    board: (string | null)[][];
    shotsReceived: ('hit' | 'miss' | null)[][];
    shipsSunk: number;
  }>;
  playerIds: [string, string];
  lastShot: { attackerId: string; row: number; col: number; result: 'hit' | 'miss'; sunkShip: string | null } | null;
  winner: string | null;
  winReason: string;
}

// Checkers Specific
export interface CheckersState {
  gameType: 'checkers';
  status: 'playing' | 'game_over';
  board: ('r' | 'b' | 'R' | 'B' | null)[][];
  turn: 'r' | 'b';
  players: {
    r: Player & { color: 'r'; piecesLeft: number };
    b: Player & { color: 'b'; piecesLeft: number };
  };
  lastMove: { from: [number, number]; to: [number, number]; isJump: boolean } | null;
  winner: string | null;
  winReason: string;
}

// Memory Match Specific
export interface MemoryMatchState {
  gameType: 'memory_match';
  status: 'playing' | 'game_over';
  deck: { id: number; emoji: string; isFlipped: boolean; isMatched: boolean; matchedBy: string | null }[];
  turn: string;
  currentFlips: number[];
  players: Record<string, Player & { score: number }>;
  playerIds: [string, string];
  matchesFound: number;
  totalPairs: number;
  winner: string | 'draw' | null;
  winReason: string;
}

// Dots & Boxes Specific
export interface DotsAndBoxesState {
  gameType: 'dots_and_boxes';
  status: 'playing' | 'game_over';
  turn: string;
  players: Record<string, Player & { color: string; score: number }>;
  playerIds: [string, string];
  hLines: (string | null)[][];
  vLines: (string | null)[][];
  boxes: (string | null)[][];
  claimedBoxesCount: number;
  lastLine: { type: 'h' | 'v'; r: number; c: number } | null;
  winner: string | 'draw' | null;
  winReason: string;
}

// Wordle Duel Specific
export interface WordleDuelState {
  gameType: 'wordle_duel';
  status: 'playing' | 'game_over';
  targetWord: string;
  wordLength: number;
  maxGuesses: number;
  players: Record<string, Player & {
    guesses: { word: string; evaluation: ('green' | 'yellow' | 'gray')[] }[];
    solved: boolean;
    attempts: number;
  }>;
  playerIds: [string, string];
  winner: string | 'draw' | null;
  winReason: string;
}

// 2048 Specific
export interface Game2048State {
  gameType: 'game_2048';
  status: 'playing' | 'game_over';
  targetTile: number;
  players: Record<string, Player & {
    board: number[][];
    score: number;
    highestTile: number;
    gameOver: boolean;
  }>;
  playerIds: [string, string];
  winner: string | null;
  winReason: string;
}

// Snake Battle Specific
export interface SnakeBattleState {
  gameType: 'snake_battle';
  status: 'playing' | 'game_over';
  gridSize: number;
  food: [number, number];
  players: Record<string, Player & {
    color: string;
    body: [number, number][];
    direction: string;
    score: number;
    alive: boolean;
  }>;
  playerIds: [string, string];
  winner: string | 'draw' | null;
  winReason: string;
}

// Pong Duel Specific
export interface PongDuelState {
  gameType: 'pong_duel';
  status: 'playing' | 'game_over';
  scoreLimit: number;
  ball: { x: number; y: number; vx: number; vy: number };
  players: Record<string, Player & {
    side: 'left' | 'right';
    paddleY: number;
    score: number;
  }>;
  playerIds: [string, string];
  winner: string | null;
  winReason: string;
}
