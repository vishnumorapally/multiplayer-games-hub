import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../../utils/sound';
import { Play, RotateCcw, Trophy, Zap } from 'lucide-react';

interface BrickBreakerArenaProps {
  onAction: (action: string, payload: any) => void;
  p1: any;
  p2: any;
  isP1: boolean;
}

export const BrickBreakerArena: React.FC<BrickBreakerArenaProps> = ({
  onAction,
  p1,
  p2,
  isP1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  const me = isP1 ? p1 : p2;
  const opp = isP1 ? p2 : p1;

  const stateRef = useRef({
    paddleX: 180,
    paddleW: 90,
    ballX: 220,
    ballY: 260,
    ballVx: 3.5,
    ballVy: -4,
    ballR: 7,
    bricks: [] as { x: number; y: number; w: number; h: number; color: string; pts: number; alive: boolean }[],
    score: 0,
    lives: 3
  });

  const initBricks = () => {
    const rows = 4;
    const cols = 7;
    const brickW = 54;
    const brickH = 18;
    const padding = 8;
    const offsetTop = 40;
    const offsetLeft = 24;
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    const pts = [40, 30, 20, 10];

    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: colors[r],
          pts: pts[r],
          alive: true
        });
      }
    }
    stateRef.current.bricks = bricks;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    stateRef.current.paddleX = Math.max(0, Math.min(canvas.width - stateRef.current.paddleW, mouseX - stateRef.current.paddleW / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    stateRef.current.paddleX = Math.max(0, Math.min(canvas.width - stateRef.current.paddleW, touchX - stateRef.current.paddleW / 2));
  };

  const startGame = () => {
    initBricks();
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.ballX = 220;
    stateRef.current.ballY = 260;
    stateRef.current.ballVx = 3.5;
    stateRef.current.ballVy = -4;
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsPlaying(true);
    sounds.playClick();
  };

  useEffect(() => {
    initBricks();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Move Ball
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Wall bounce
      if (s.ballX - s.ballR <= 0 || s.ballX + s.ballR >= width) {
        s.ballVx = -s.ballVx;
        sounds.playClick();
      }
      if (s.ballY - s.ballR <= 0) {
        s.ballVy = -s.ballVy;
        sounds.playClick();
      }

      // Paddle bounce
      const paddleY = height - 25;
      if (
        s.ballY + s.ballR >= paddleY &&
        s.ballY - s.ballR <= paddleY + 12 &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + s.paddleW
      ) {
        // Angled deflection based on strike point
        const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
        s.ballVx = hitOffset * 5.5;
        s.ballVy = -Math.abs(s.ballVy);
        sounds.playClick();
      }

      // Bottom fall (Lose life)
      if (s.ballY - s.ballR > height) {
        s.lives -= 1;
        setLives(s.lives);
        sounds.playWicket();

        if (s.lives <= 0) {
          setIsGameOver(true);
          setIsPlaying(false);
          onAction('arcade_action', { subAction: 'breaker_over', data: { score: s.score, gameOver: true } });
          return;
        } else {
          // Reset ball
          s.ballX = s.paddleX + s.paddleW / 2;
          s.ballY = paddleY - 20;
          s.ballVx = 3.5;
          s.ballVy = -4;
        }
      }

      // Brick Collision
      let remainingBricks = 0;
      for (const b of s.bricks) {
        if (!b.alive) continue;
        remainingBricks++;

        if (
          s.ballX + s.ballR > b.x &&
          s.ballX - s.ballR < b.x + b.w &&
          s.ballY + s.ballR > b.y &&
          s.ballY - s.ballR < b.y + b.h
        ) {
          b.alive = false;
          s.ballVy = -s.ballVy;
          s.score += b.pts;
          setScore(s.score);
          sounds.playClick();
          break;
        }
      }

      // Check all cleared
      if (remainingBricks === 0) {
        setIsGameOver(true);
        setIsPlaying(false);
        sounds.playVictory();
        onAction('arcade_action', { subAction: 'breaker_win', data: { score: s.score + 100, gameOver: true } });
        return;
      }

      // Draw Bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
      }

      // Draw Paddle
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.roundRect(s.paddleX, paddleY, s.paddleW, 12, 6);
      ctx.fill();
      ctx.strokeStyle = '#a5b4fc';
      ctx.stroke();

      // Draw Ball
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 10;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="w-full p-4 rounded-3xl glass-panel border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="font-['Outfit'] font-black text-white text-base">Brick Breaker Smash</h2>
        </div>
        <div className="flex items-center space-x-4 font-mono font-bold text-xs">
          <span className="text-amber-400">Score: {score}</span>
          <span className="text-rose-400">❤️ {lives}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-indigo-500/40 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={460}
          height={340}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-full h-[340px] block cursor-none"
        />

        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl mb-2">🧱</span>
            <h3 className="text-xl font-black font-['Outfit'] text-white">Ready to Smash?</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Move mouse or finger left & right to control the paddle and shatter neon bricks!
            </p>
            <button
              onClick={startGame}
              className="mt-4 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm shadow-xl transition hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START SMASHING</span>
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <h3 className="text-xl font-black font-['Outfit'] text-white">Game Over</h3>
            <p className="text-sm font-bold text-amber-300 mt-1">Final Score: {score} points!</p>
            <button
              onClick={startGame}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition hover:scale-105 active:scale-95 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
