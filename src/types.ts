export type GameType = 'hand_cricket' | 'chess' | 'ludo' | 'tictactoe';

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

// Hand Cricket Specific Types
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
  players: {
    p1: Player;
    p2: Player;
  };
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

// Chess Specific Types
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

// Ludo Specific Types
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayerState {
  id: string;
  name: string;
  avatar: string;
  color: LudoColor;
  isBot: boolean;
  tokens: [number, number, number, number]; // -1 to 56
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

// Tic-Tac-Toe Specific Types
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
