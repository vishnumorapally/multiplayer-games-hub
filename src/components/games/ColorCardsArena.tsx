import React, { useState } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Sparkles, Layers } from 'lucide-react';

interface Card {
  color: 'red' | 'blue' | 'green' | 'yellow';
  value: string;
}

interface ColorCardsArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

const COLORS: Card['color'][] = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'SKIP'];

function createRandomCard(): Card {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    value: VALUES[Math.floor(Math.random() * VALUES.length)]
  };
}

export const ColorCardsArena: React.FC<ColorCardsArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const [myHand, setMyHand] = useState<Card[]>(() =>
    Array.from({ length: 6 }).map(createRandomCard)
  );
  const [oppHandCount, setOppHandCount] = useState<number>(6);
  const [topCard, setTopCard] = useState<Card>({ color: 'red', value: '7' });
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  const colorStyles: Record<Card['color'], string> = {
    red: 'bg-rose-600 border-rose-400 text-white',
    blue: 'bg-blue-600 border-blue-400 text-white',
    green: 'bg-emerald-600 border-emerald-400 text-white',
    yellow: 'bg-amber-500 border-amber-300 text-slate-950'
  };

  const canPlay = (card: Card) => {
    return card.color === topCard.color || card.value === topCard.value;
  };

  const playCard = (index: number) => {
    if (!isMyTurn || isGameOver) return;
    const card = myHand[index];
    if (!canPlay(card)) return;

    sounds.playClick();
    const nextHand = myHand.filter((_, i) => i !== index);
    setMyHand(nextHand);
    setTopCard(card);

    if (nextHand.length === 0) {
      setIsGameOver(true);
      sounds.playVictory();
      onAction('arcade_action', { subAction: 'uno_win', data: { winner: me.id, score: 50, gameOver: true } });
      return;
    }

    // Check special cards
    let skipOpponent = false;
    if (card.value === 'SKIP') skipOpponent = true;
    if (card.value === '+2') {
      setOppHandCount(c => c + 2);
      skipOpponent = true;
    }

    if (skipOpponent) {
      sounds.playVictory();
      return; // Stays my turn!
    }

    setIsMyTurn(false);
    onAction('arcade_action', { subAction: 'play_card', data: { card, remaining: nextHand.length } });

    if (opp?.isBot) {
      triggerBotTurn(card);
    }
  };

  const drawCard = () => {
    if (!isMyTurn || isGameOver) return;
    sounds.playClick();
    const newCard = createRandomCard();
    setMyHand(prev => [...prev, newCard]);
    setIsMyTurn(false);

    if (opp?.isBot) {
      triggerBotTurn(topCard);
    }
  };

  const triggerBotTurn = (currentTop: Card) => {
    setTimeout(() => {
      // Bot plays or draws
      const botPlays = Math.random() < 0.7;
      if (botPlays) {
        // Bot plays a matching card
        const matchingColor = currentTop.color;
        const matchingVal = VALUES[Math.floor(Math.random() * VALUES.length)];
        const botCard: Card = { color: matchingColor, value: matchingVal };
        setTopCard(botCard);
        setOppHandCount(c => {
          const next = Math.max(0, c - 1);
          if (next === 0) {
            setIsGameOver(true);
            sounds.playWicket();
            onAction('arcade_action', { subAction: 'uno_win', data: { winner: opp.id, score: 50, gameOver: true } });
          }
          return next;
        });
      } else {
        // Bot draws
        setOppHandCount(c => c + 1);
      }
      setIsMyTurn(true);
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🃏</span>
          <div>
            <h2 className="font-['Outfit'] font-black text-white text-base">Color Cards Duel (Uno Style)</h2>
            <p className="text-[10px] text-slate-400">Match top card by color or number. First to 0 cards wins!</p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
          isMyTurn ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          {isMyTurn ? 'Your Turn' : `${opp.name}'s Turn`}
        </div>
      </div>

      {/* Center Deck Table */}
      <div className="w-full p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl flex items-center justify-center gap-8">
        {/* Draw Pile */}
        <button
          onClick={drawCard}
          disabled={!isMyTurn || isGameOver}
          className="w-20 h-28 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-950 border-2 border-indigo-500/40 shadow-xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-50"
        >
          <Layers className="w-6 h-6 text-indigo-300 mb-1" />
          <span className="text-[10px] font-bold text-indigo-300">DRAW</span>
        </button>

        {/* Top Discard Card */}
        <div className={`w-24 h-36 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center ${colorStyles[topCard.color]}`}>
          <span className="text-3xl font-black font-['Outfit']">{topCard.value}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{topCard.color}</span>
        </div>

        {/* Opponent Cards Count Preview */}
        <div className="w-20 h-28 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center p-2">
          <span className="text-xs text-slate-400 font-bold">{opp.name}</span>
          <span className="text-2xl font-black text-pink-400 mt-1">{oppHandCount}</span>
          <span className="text-[9px] text-slate-500">cards</span>
        </div>
      </div>

      {/* Your Hand of Cards */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
          <span>YOUR HAND ({myHand.length} cards)</span>
          {isMyTurn && <span className="text-indigo-400 animate-pulse">Choose a matching card to play</span>}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto p-2 pb-3">
          {myHand.map((card, i) => {
            const playable = isMyTurn && canPlay(card);
            return (
              <button
                key={i}
                onClick={() => playCard(i)}
                disabled={!playable}
                className={`w-20 h-28 flex-shrink-0 rounded-2xl border-2 shadow-lg flex flex-col items-center justify-center transition hover:-translate-y-2 active:scale-95 ${colorStyles[card.color]} ${
                  playable ? 'ring-4 ring-white/60 cursor-pointer' : 'opacity-40 grayscale-[30%] cursor-not-allowed'
                }`}
              >
                <span className="text-2xl font-black font-['Outfit']">{card.value}</span>
                <span className="text-[9px] font-bold uppercase mt-1">{card.color}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
