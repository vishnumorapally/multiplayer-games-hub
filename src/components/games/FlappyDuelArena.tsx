import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../../utils/sound';
import { Play, RotateCcw, Trophy, Flame } from 'lucide-react';

interface FlappyDuelArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const FlappyDuelArena: React.FC<FlappyDuelArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  // Game state refs for 60fps render
  const stateRef = useRef({
    birdY: 180,
    birdVy: 0,
    birdAngle: 0,
    oppY: 180,
    oppScore: 0,
    pipes: [] as { x: number; top: number; bottom: number; passed: boolean }[],
    score: 0,
    dead: false,
    frame: 0
  });

  const flap = () => {
    if (stateRef.current.dead) return;
    if (!isPlaying) {
      setIsPlaying(true);
      stateRef.current.dead = false;
      setIsDead(false);
    }
    stateRef.current.birdVy = -6.5;
    sounds.playClick();
  };

  const restart = () => {
    stateRef.current = {
      birdY: 180,
      birdVy: -4,
      birdAngle: 0,
      oppY: 180,
      oppScore: 0,
      pipes: [],
      score: 0,
      dead: false,
      frame: 0
    };
    setScore(0);
    setOpponentScore(0);
    setIsDead(false);
    setIsPlaying(true);
    sounds.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update
      if (isPlaying && !s.dead) {
        s.frame++;
        s.birdVy += 0.32; // Gravity
        s.birdY += s.birdVy;
        s.birdAngle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, s.birdVy * 0.08));

        // Ground / Ceiling collision
        if (s.birdY >= height - 35) {
          s.birdY = height - 35;
          s.dead = true;
          setIsDead(true);
          sounds.playWicket();
          onAction('arcade_action', { subAction: 'flappy_crash', data: { score: s.score } });
        }
        if (s.birdY <= 15) {
          s.birdY = 15;
          s.birdVy = 0;
        }

        // Generate pipes
        if (s.frame % 95 === 0) {
          const gap = 110;
          const minPipe = 40;
          const maxPipe = height - 35 - gap - minPipe;
          const top = Math.floor(Math.random() * (maxPipe - minPipe)) + minPipe;
          s.pipes.push({
            x: width,
            top,
            bottom: height - 35 - top - gap,
            passed: false
          });
        }

        // Move pipes
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= 2.6;

          // Check score pass
          if (!p.passed && p.x + 50 < 80) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            sounds.playClick();
            onAction('arcade_action', { subAction: 'flappy_score', data: { score: s.score } });
          }

          // Check collision
          const birdX = 80;
          const birdR = 14;
          if (birdX + birdR > p.x && birdX - birdR < p.x + 50) {
            const gapY = p.top;
            const gapBottomY = height - 35 - p.bottom;
            if (s.birdY - birdR < gapY || s.birdY + birdR > gapBottomY) {
              s.dead = true;
              setIsDead(true);
              sounds.playWicket();
              onAction('arcade_action', { subAction: 'flappy_crash', data: { score: s.score } });
            }
          }

          // Remove offscreen
          if (p.x < -60) {
            s.pipes.splice(i, 1);
          }
        }

        // Simulate Opponent / Bot flight
        if (opp?.isBot) {
          // Find next pipe
          const nextPipe = s.pipes.find(p => p.x + 50 > 60);
          if (nextPipe) {
            const targetY = nextPipe.top + 55;
            if (s.oppY > targetY + 10 && Math.random() < 0.25) {
              s.oppY -= 5;
            } else {
              s.oppY += 1.8;
            }
          } else {
            s.oppY = 180 + Math.sin(s.frame * 0.05) * 20;
          }
          if (s.frame % 95 === 0 && Math.random() < 0.85) {
            s.oppScore += 1;
            setOpponentScore(s.oppScore);
          }
        }
      }

      // Draw Sky & Clouds
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.6, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.beginPath();
      ctx.arc(80, 70, 35, 0, Math.PI * 2);
      ctx.arc(120, 60, 45, 0, Math.PI * 2);
      ctx.arc(160, 70, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 100, 30, 0, Math.PI * 2);
      ctx.arc(360, 90, 40, 0, Math.PI * 2);
      ctx.arc(400, 100, 30, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pipes
      for (const p of s.pipes) {
        // Top pipe
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + 50, 0);
        pipeGrad.addColorStop(0, '#10b981');
        pipeGrad.addColorStop(0.5, '#34d399');
        pipeGrad.addColorStop(1, '#059669');

        ctx.fillStyle = pipeGrad;
        ctx.fillRect(p.x, 0, 50, p.top);
        // Top cap
        ctx.fillStyle = '#047857';
        ctx.fillRect(p.x - 4, p.top - 20, 58, 20);

        // Bottom pipe
        const bottomY = height - 35 - p.bottom;
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(p.x, bottomY, 50, p.bottom);
        // Bottom cap
        ctx.fillStyle = '#047857';
        ctx.fillRect(p.x - 4, bottomY, 58, 20);
      }

      // Draw Ground
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, height - 35, width, 35);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, height - 35, width, 6);

      // Draw Opponent / Bot Bird (Ghost avatar)
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.translate(65, s.oppY);
      ctx.font = '22px sans-serif';
      ctx.fillText(opp?.avatar || '🤖', -12, 8);
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.fillStyle = '#f472b6';
      ctx.fillText(opp?.name || 'Bot', -15, -16);
      ctx.restore();

      // Draw Player Bird
      ctx.save();
      ctx.translate(80, s.birdY);
      ctx.rotate(s.birdAngle);

      // Bird body
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wing
      ctx.beginPath();
      ctx.ellipse(-5, Math.sin(s.frame * 0.3) * 3, 8, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(7, -5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8, -5, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Beak
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(20, 3);
      ctx.lineTo(12, 7);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Score Header */}
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{me.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-amber-400">YOU</div>
              <div className="text-xs font-bold text-white truncate max-w-[90px]">{me.name}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-['Outfit'] text-amber-300">{score}</span>
            <span className="text-[10px] text-slate-400 block -mt-1">pipes</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-pink-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{opp.avatar}</span>
            <div>
              <div className="text-[10px] font-bold text-pink-400">OPPONENT</div>
              <div className="text-xs font-bold text-white truncate max-w-[90px]">{opp.name}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-['Outfit'] text-pink-300">{opponentScore}</span>
            <span className="text-[10px] text-slate-400 block -mt-1">pipes</span>
          </div>
        </div>
      </div>

      {/* Flappy Canvas Arena */}
      <div
        onClick={flap}
        className="relative w-full rounded-3xl overflow-hidden glass-panel border border-indigo-500/40 shadow-2xl cursor-pointer active:scale-99 transition"
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={380}
          className="w-full h-[380px] block"
        />

        {/* Start Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl mb-3 shadow-xl">
              🐤
            </div>
            <h3 className="text-2xl font-black font-['Outfit'] text-white">Flappy Rush Duel</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Tap screen or press <strong className="text-amber-300">Spacebar</strong> to flap through green pipes!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                flap();
              }}
              className="mt-5 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>TAP TO FLAP & START</span>
            </button>
          </div>
        )}

        {/* Game Over Crash Overlay */}
        {isDead && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mb-2">
              💥
            </div>
            <h3 className="text-xl font-black font-['Outfit'] text-white">Crash!</h3>
            <p className="text-sm font-bold text-amber-300 mt-1">
              You scored {score} {score === 1 ? 'pipe' : 'pipes'}!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 flex items-center gap-2">
        <span>💡 Tap anywhere on screen or hit Spacebar to flap wings!</span>
      </div>
    </div>
  );
};
