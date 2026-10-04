import React, { useEffect } from 'react';
import { HandCricketState } from '../../types';
import { sounds } from '../../utils/sound';
import { ShieldAlert, Award, Flame, Disc, CheckCircle2 } from 'lucide-react';

interface HandCricketGameProps {
  gameState: HandCricketState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

const NUMBER_EMOJIS: Record<number, string> = {
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
  5: '🖐️',
  6: '🤙'
};

export const HandCricketGame: React.FC<HandCricketGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const isP1 = gameState.players.p1.id === myPlayerId;
  const isP2 = gameState.players.p2.id === myPlayerId;
  const isBatsman = gameState.currentBatsmanId === myPlayerId;
  const isBowler = gameState.currentBowlerId === myPlayerId;

  const currentInnings = gameState.innings === 1 ? gameState.innings1 : gameState.innings2;
  const batsmanPlayer = gameState.players.p1.id === gameState.currentBatsmanId ? gameState.players.p1 : gameState.players.p2;
  const bowlerPlayer = gameState.players.p1.id === gameState.currentBowlerId ? gameState.players.p1 : gameState.players.p2;

  const mySelectedNumber = gameState.currentTurnSelections[myPlayerId];
  const hasOpponentSelected = (() => {
    const oppId = isP1 ? gameState.players.p2.id : gameState.players.p1.id;
    return gameState.currentTurnSelections[oppId] !== undefined;
  })();

  // Play sound on last ball update
  useEffect(() => {
    if (gameState.lastBallResult) {
      if (gameState.lastBallResult.isOut) {
        sounds.playWicket();
      } else {
        sounds.playCricketHit();
      }
    }
  }, [gameState.lastBallResult?.ball, gameState.innings]);

  // 1. TOSS PHASE
  if (gameState.status === 'toss') {
    const isCaller = gameState.toss.callerId === myPlayerId;
    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 glass-panel rounded-3xl border border-indigo-500/30 text-center animate-in fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
          🪙
        </div>
        <h2 className="text-2xl font-black font-['Outfit'] text-white">THE TOSS</h2>
        <p className="text-sm text-slate-300 mt-1">
          {isCaller ? 'You are calling the toss! Choose Heads or Tails:' : 'Opponent is calling the toss...'}
        </p>

        {isCaller ? (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => {
                sounds.playClick();
                onAction('toss_call', { choice: 'heads' });
              }}
              className="flex-1 max-w-[160px] py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition hover:scale-105 active:scale-95"
            >
              <span className="text-2xl block mb-1">👑</span>
              HEADS
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onAction('toss_call', { choice: 'tails' });
              }}
              className="flex-1 max-w-[160px] py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/25 transition hover:scale-105 active:scale-95"
            >
              <span className="text-2xl block mb-1">🦅</span>
              TAILS
            </button>
          </div>
        ) : (
          <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
            <span>Waiting for caller to flip the coin...</span>
          </div>
        )}
      </div>
    );
  }

  // 2. CHOOSE BAT OR BOWL
  if (gameState.status === 'choose_action') {
    const isWinner = gameState.toss.winnerId === myPlayerId;
    const winnerName = gameState.players.p1.id === gameState.toss.winnerId ? gameState.players.p1.name : gameState.players.p2.name;

    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 glass-panel rounded-3xl border border-indigo-500/30 text-center animate-in fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
          🎉
        </div>
        <h2 className="text-2xl font-black font-['Outfit'] text-white">TOSS WON!</h2>
        <p className="text-slate-300 text-sm mt-1">
          Coin landed on <span className="font-bold text-amber-300 uppercase">{gameState.toss.coinResult}</span>.
        </p>
        <p className="text-base text-indigo-300 font-semibold mt-1">
          {winnerName} won the toss!
        </p>

        {isWinner ? (
          <div className="mt-8">
            <p className="text-sm text-slate-300 mb-4 font-medium">What would you like to do first?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  onAction('choose_action', { action: 'bat' });
                }}
                className="flex-1 max-w-[160px] py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95"
              >
                <span className="text-3xl block mb-1">🏏</span>
                BAT FIRST
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onAction('choose_action', { action: 'bowl' });
                }}
                className="flex-1 max-w-[160px] py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-rose-600/30 transition hover:scale-105 active:scale-95"
              >
                <span className="text-3xl block mb-1">⚾</span>
                BOWL FIRST
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{winnerName} is deciding to Bat or Bowl...</span>
          </div>
        )}
      </div>
    );
  }

  // 3. INNINGS 1 & 2 ACTIVE PLAY
  const remainingBalls = gameState.maxBalls - currentInnings.balls;
  const currentRunRate = currentInnings.balls > 0 ? ((currentInnings.score / currentInnings.balls) * 6).toFixed(1) : '0.0';
  const target = gameState.innings === 2 ? gameState.innings2.target : null;
  const runsNeeded = target !== null ? Math.max(0, target - currentInnings.score) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in">
      {/* Top Match Scoreboard Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-indigo-500/25 shadow-xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Batsman & Score */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20">
                {batsmanPlayer.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-bold">
                BAT
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-['Outfit'] text-lg font-bold text-white">{batsmanPlayer.name}</span>
                {isBatsman && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold border border-indigo-500/40">
                    YOU
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-['Outfit'] text-amber-300 tracking-tight">
                  {currentInnings.score}
                </span>
                <span className="text-lg text-slate-400 font-bold">/ {currentInnings.wickets}</span>
                <span className="text-xs text-slate-400 ml-2">
                  ({Math.floor(currentInnings.balls / 6)}.{(currentInnings.balls % 6)} / {gameState.maxBalls / 6} ov)
                </span>
              </div>
            </div>
          </div>

          {/* Middle Badge / Target / Innings */}
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              INNINGS {gameState.innings} of 2
            </div>
            {target !== null ? (
              <div className="mt-1">
                <div className="text-xs font-bold text-amber-400">TARGET: {target}</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                  Need {runsNeeded} runs in {remainingBalls} balls
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300 mt-1">
                CR: <span className="font-bold text-indigo-300">{currentRunRate}</span> RPO
              </div>
            )}
          </div>

          {/* Bowler */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2">
                {isBowler && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold border border-indigo-500/40">
                    YOU
                  </span>
                )}
                <span className="font-['Outfit'] text-lg font-bold text-white">{bowlerPlayer.name}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Bowling · Balls: <span className="font-bold text-slate-200">{currentInnings.balls}</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20">
                {bowlerPlayer.avatar}
              </div>
              <span className="absolute -bottom-1 -left-1 text-xs px-1.5 py-0.2 rounded-md bg-rose-400 text-slate-950 font-bold">
                BOWL
              </span>
            </div>
          </div>
        </div>

        {/* Live Commentary Marquee */}
        {gameState.lastBallResult && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-xs sm:text-sm">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <span className="text-slate-300 font-medium italic">
              {gameState.lastBallResult.commentary}
            </span>
          </div>
        )}
      </div>

      {/* Arena / Pitch View with Last Ball Display */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 relative text-center">
        <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-4">
          PITCH BATTLE · SHOW YOUR HAND
        </div>

        {/* Reveal Showcase */}
        {gameState.lastBallResult ? (
          <div className="flex items-center justify-center gap-6 sm:gap-12 my-2">
            <div className="text-center">
              <div className="text-xs font-bold text-amber-400 mb-1">BATSMAN</div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
                <span className="text-3xl sm:text-4xl">{NUMBER_EMOJIS[gameState.lastBallResult.batNum]}</span>
                <span className="text-lg font-black text-amber-300 font-['Outfit'] mt-1">{gameState.lastBallResult.batNum}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xl font-black text-slate-500">VS</div>
              {gameState.lastBallResult.isOut ? (
                <div className="mt-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black tracking-wider uppercase animate-pulse">
                  WICKET!
                </div>
              ) : (
                <div className="mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black tracking-wider uppercase">
                  +{gameState.lastBallResult.runs} RUNS
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-rose-400 mb-1">BOWLER</div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 flex flex-col items-center justify-center shadow-lg shadow-rose-500/10">
                <span className="text-3xl sm:text-4xl">{NUMBER_EMOJIS[gameState.lastBallResult.bowlNum]}</span>
                <span className="text-lg font-black text-rose-300 font-['Outfit'] mt-1">{gameState.lastBallResult.bowlNum}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-slate-500 text-sm italic">
            Select your number below to bowl the first ball!
          </div>
        )}

        {/* Hand Cricket Number Selector (1 to 6) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="mb-3 flex items-center justify-center space-x-2">
            <span className="text-sm font-bold text-slate-200">
              {isBatsman ? 'Pick your Shot (Runs):' : isBowler ? 'Pick your Delivery:' : 'Spectating:'}
            </span>
            {mySelectedNumber !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>You chose {mySelectedNumber}!</span>
              </span>
            )}
          </div>

          {(isBatsman || isBowler) ? (
            <div className="grid grid-cols-6 gap-2 sm:gap-3 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = mySelectedNumber === num;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      sounds.playClick();
                      onAction('select_number', { number: num });
                    }}
                    disabled={mySelectedNumber !== undefined}
                    className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white scale-105 shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                        : mySelectedNumber !== undefined
                        ? 'bg-slate-900/60 text-slate-600 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900/90 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-400 hover:scale-105 active:scale-95 shadow-md'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{NUMBER_EMOJIS[num]}</span>
                    <span className="text-base sm:text-lg font-black font-['Outfit']">{num}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-500 text-sm">You are watching as spectator.</div>
          )}

          {mySelectedNumber !== undefined && !hasOpponentSelected && (
            <div className="mt-3 text-xs text-amber-400 flex items-center justify-center space-x-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span>Waiting for opponent to reveal their hand...</span>
            </div>
          )}
        </div>

        {/* Ball History Over Timeline */}
        {currentInnings.history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">This Innings:</span>
            {currentInnings.history.map((ball, idx) => (
              <span
                key={idx}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-['Outfit'] shadow ${
                  ball.isOut
                    ? 'bg-rose-600 text-white shadow-rose-600/40 ring-2 ring-rose-400'
                    : ball.runs === 6
                    ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/30'
                    : ball.runs === 4
                    ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
                title={`Ball ${ball.ball}: ${ball.isOut ? 'WICKET' : ball.runs + ' runs'}`}
              >
                {ball.isOut ? 'W' : ball.runs}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
