import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/sound';
import { Trophy, Clock, Zap, RotateCcw, Award, Sparkles } from 'lucide-react';

interface TypingRaceArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
  targetText?: string;
}

const CHALLENGE_TEXTS: Record<number, string[]> = {
  30: [
    "Fast fingers spark lightning across the neon arcade. Focus your mind, find your rhythm, and never miss a keystroke.",
    "Victory belongs to those who react with precision and unwavering confidence under the glowing stadium lights.",
    "A journey of a thousand lines of code begins with a single confident keystroke. Keep typing and conquer the arena."
  ],
  60: [
    "In the heart of the digital cyber realm, speed and precision decide who rises to legendary grandmaster status. Every sentence typed is a step closer to glory, while hesitation and mistyped words can cost you the crown. Breathe deeply, watch the cursor pulse, and let your fingers dance across the keyboard.",
    "Multiplayer gaming brings competitors from across the globe together into one shared arena of skill and passion. Whether calculating chess tactics, deflecting speeding pucks, or racing keystrokes in a speed duel, true champions prove their mastery with steady nerves and relentless determination."
  ],
  120: [
    "The golden age of arcade gaming was defined by flashing neon marquees, the clinking of brass coins, and the cheers of friends gathered around glowing cabinets. Today, that classic arcade spirit lives on in modern multiplayer arenas where competitors challenge each other in tests of reflex, memory, and strategy. To triumph in the typing duel, you must master both pace and accuracy. Rushing leads to costly mistakes, while hesitation lets your rival take the lead. Balance speed with control, stay in the zone, and let your keyboard hum with unbroken momentum until the very last word is completed."
  ],
  300: [
    "Throughout computing history, the art of typing has evolved from heavy mechanical typewriters with striking hammers to feather-light mechanical keyboards with glowing RGB backlights. Early typists had to strike each key with deliberate force, ensuring that the inked ribbon made clean contact with paper without jamming the mechanism. Today, competitive typing has become an esports discipline where players reach speeds exceeding one hundred and fifty words per minute with staggering accuracy. Precision typing requires relaxed shoulders, curved fingers floating effortlessly above the home row, and muscle memory cultivated through thousands of hours of practice. When words flow naturally from thought directly onto the screen without conscious mechanical effort, a typist reaches the elusive flow state. In this state, distractions vanish, errors disappear, and the rhythm of the keyboard becomes a mesmerizing digital symphony that outpaces any challenger."
  ],
  600: [
    "Deep within the digital infrastructure of modern computing lies the simple yet profound interface between human intellect and silicon circuits: the keyboard. Long before graphical user interfaces and voice recognition, the written character was the supreme vehicle of digital thought. Programmers wrote operating systems one line at a time, hackers navigated terminal consoles, and gamers mapped complex maneuvers to tactile keybinds. In competitive typing challenges, the relationship between cognitive processing and finger dexterity is pushed to its absolute limits. Typists must scan ahead several words into the future, buffering the phonetic shapes in short-term memory while their fingers execute the current phrase with microsecond precision. Every error incurs a mental penalty, breaking the cognitive momentum and forcing a split-second recalculation. True typing masters do not simply move fast; they maintain a state of calm equilibrium, letting each sentence unfold with flawless cadence until victory is secured."
  ]
};

export const TypingRaceArena: React.FC<TypingRaceArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1,
  targetText: initialText
}) => {
  const [duration, setDuration] = useState<number>(60); // 30, 60, 120, 300, 600
  const [targetParagraph, setTargetParagraph] = useState<string>(() => {
    const list = CHALLENGE_TEXTS[60];
    return initialText || list[Math.floor(Math.random() * list.length)];
  });

  const [typed, setTyped] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [botProgress, setBotProgress] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Switch challenge duration
  const handleSelectDuration = (sec: number) => {
    sounds.playClick();
    setDuration(sec);
    setTimeLeft(sec);
    const list = CHALLENGE_TEXTS[sec] || CHALLENGE_TEXTS[60];
    setTargetParagraph(list[Math.floor(Math.random() * list.length)]);
    setTyped('');
    setStartTime(null);
    setIsFinished(false);
    setBotProgress(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Timer countdown
  useEffect(() => {
    if (!startTime || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isFinished]);

  // Bot simulation in solo mode
  useEffect(() => {
    if (!startTime || isFinished) return;
    const opp = isP1 ? p2 : p1;
    if (!opp?.isBot) return;

    // Bot typing speed: ~50-65 WPM
    const botInterval = setInterval(() => {
      setBotProgress(prev => {
        const next = prev + Math.random() * 2.2 + 0.8;
        if (next >= 100) {
          clearInterval(botInterval);
          return 100;
        }
        return next;
      });
    }, 400);

    return () => clearInterval(botInterval);
  }, [startTime, isFinished, isP1, p1, p2]);

  // Handle typing change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setTyped(val);

    // Check completion
    if (val.length >= targetParagraph.length) {
      sounds.playVictory();
      finishMatch();
    }
  };

  const finishMatch = () => {
    setIsFinished(true);
    const elapsedMinutes = Math.max(0.1, ((duration - timeLeft) || 1) / 60);
    const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round(wordsTyped / elapsedMinutes);

    onAction('arcade_action', {
      subAction: 'update_progress',
      data: {
        score: wpm,
        wpm,
        gameOver: true
      }
    });
  };

  // Calculate live stats
  const elapsedMinutes = startTime ? Math.max(0.05, ((duration - timeLeft) || 1) / 60) : 0.05;
  const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
  const liveWpm = startTime ? Math.round(wordsTyped / elapsedMinutes) : 0;

  // Accuracy
  let correctCount = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === targetParagraph[i]) correctCount++;
  }
  const accuracy = typed.length > 0 ? Math.round((correctCount / typed.length) * 100) : 100;
  const playerProgress = Math.min(100, Math.round((typed.length / targetParagraph.length) * 100));

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;
  const opponentDisplayProgress = opp?.isBot ? Math.round(botProgress) : (opp?.score || 0);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Top Header & Duration Selector */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h2 className="font-['Outfit'] font-extrabold text-white text-base">Speed Typing Duel</h2>
        </div>

        {/* Challenge Time Buttons: 30s, 60s, 2m, 5m, 10m */}
        <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-800 text-xs font-bold">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Time:</span>
          </span>
          {[
            { sec: 30, label: '30s' },
            { sec: 60, label: '60s (1m)' },
            { sec: 120, label: '2m' },
            { sec: 300, label: '5m' },
            { sec: 600, label: '10m' }
          ].map(t => (
            <button
              key={t.sec}
              onClick={() => handleSelectDuration(t.sec)}
              className={`px-2.5 py-1.5 rounded-xl transition ${
                duration === t.sec
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Race Track Visualizer */}
      <div className="w-full p-5 rounded-3xl glass-panel border border-slate-800 shadow-xl space-y-3">
        <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1 flex items-center justify-between">
          <span>RACE TO FINISH TRACK</span>
          <span className="font-mono text-indigo-300">⏱️ {timeLeft}s remaining</span>
        </div>

        {/* Player 1 Track */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
            <span className="flex items-center gap-1.5">
              <span>{me.avatar}</span>
              <span>{me.name} (YOU)</span>
            </span>
            <span className="text-indigo-400 font-mono">{playerProgress}%</span>
          </div>
          <div className="relative w-full h-4 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 rounded-full"
              style={{ width: `${playerProgress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 text-base transition-all duration-150"
              style={{ left: `${Math.min(96, playerProgress)}%` }}
            >
              🏎️💨
            </div>
          </div>
        </div>

        {/* Player 2 / Bot Track */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
            <span className="flex items-center gap-1.5">
              <span>{opp.avatar}</span>
              <span>{opp.name}</span>
            </span>
            <span className="text-pink-400 font-mono">{opponentDisplayProgress}%</span>
          </div>
          <div className="relative w-full h-4 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-150 rounded-full"
              style={{ width: `${opponentDisplayProgress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 text-base transition-all duration-150"
              style={{ left: `${Math.min(96, opponentDisplayProgress)}%` }}
            >
              🏎️
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats: WPM, Accuracy, Errors */}
      <div className="w-full grid grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl glass-card border border-indigo-500/30 text-center">
          <div className="text-[10px] uppercase font-bold text-indigo-400">Live Speed</div>
          <div className="text-2xl font-black font-['Outfit'] text-white mt-0.5">{liveWpm}</div>
          <div className="text-[10px] text-slate-400">WPM</div>
        </div>

        <div className="p-3 rounded-2xl glass-card border border-emerald-500/30 text-center">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Accuracy</div>
          <div className="text-2xl font-black font-['Outfit'] text-white mt-0.5">{accuracy}%</div>
          <div className="text-[10px] text-slate-400">Accuracy</div>
        </div>

        <div className="p-3 rounded-2xl glass-card border border-amber-500/30 text-center">
          <div className="text-[10px] uppercase font-bold text-amber-400">Words Typed</div>
          <div className="text-2xl font-black font-['Outfit'] text-white mt-0.5">{wordsTyped}</div>
          <div className="text-[10px] text-slate-400">Words</div>
        </div>
      </div>

      {/* Rich Color-Coded Target Paragraph Display */}
      <div className="w-full p-6 rounded-3xl glass-panel border border-slate-800 shadow-2xl bg-slate-950/80 leading-relaxed font-mono text-base sm:text-lg select-none">
        {targetParagraph.split('').map((char, index) => {
          let colorClass = 'text-slate-500';
          if (index < typed.length) {
            colorClass = typed[index] === char ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/20 underline';
          } else if (index === typed.length) {
            colorClass = 'text-white bg-indigo-500/40 rounded px-0.5 animate-pulse';
          }
          return (
            <span key={index} className={colorClass}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleChange}
          disabled={isFinished}
          placeholder={isFinished ? 'Challenge completed!' : 'Start typing the paragraph above...'}
          className="w-full bg-slate-900 border-2 border-indigo-500/60 rounded-2xl px-5 py-4 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
          autoFocus
        />
      </div>

      {isFinished && (
        <div className="w-full p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95">
          <h3 className="text-lg font-black text-emerald-300 font-['Outfit'] flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Challenge Finished! Final Speed: {liveWpm} WPM · Accuracy: {accuracy}%</span>
          </h3>
        </div>
      )}
    </div>
  );
};
