import React, { useEffect, useRef } from 'react';
import { PongDuelState } from '../../types';
import { COURT_WIDTH, COURT_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE } from '../../utils/pongConstants';

interface PongGameProps {
  gameState: PongDuelState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const PongGame: React.FC<PongGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [p1Id, p2Id] = gameState.playerIds;
  const p1 = gameState.players[p1Id];
  const p2 = gameState.players[p2Id];

  const isP1 = p1Id === myPlayerId;
  const isP2 = p2Id === myPlayerId;

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = COURT_HEIGHT / rect.height;
    const clientY = (e.clientY - rect.top) * scaleY;
    const targetY = clientY - PADDLE_HEIGHT / 2;

    if (isP1 || isP2) {
      onAction('move_paddle', { targetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = COURT_HEIGHT / rect.height;
    const clientY = (e.touches[0].clientY - rect.top) * scaleY;
    const targetY = clientY - PADDLE_HEIGHT / 2;

    if (isP1 || isP2) {
      onAction('move_paddle', { targetY });
    }
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

    // Center dotted line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(COURT_WIDTH / 2, 0);
    ctx.lineTo(COURT_WIDTH / 2, COURT_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left Paddle (Player 1 - Cyan)
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(30, p1.paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    // Right Paddle (Player 2 - Pink)
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(COURT_WIDTH - 30 - PADDLE_WIDTH, p2.paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    // Ball (Glowing White/Amber)
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(gameState.ball.x + BALL_SIZE / 2, gameState.ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [gameState]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Score Header */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Player 1 */}
        <div className="p-3.5 rounded-2xl glass-card border border-cyan-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p1.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-cyan-400">{isP1 ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p1.name}</div>
              </div>
            </div>
            <span className="text-3xl font-black font-['Outfit'] text-cyan-400">{p1.score}</span>
          </div>
        </div>

        {/* Player 2 */}
        <div className="p-3.5 rounded-2xl glass-card border border-pink-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p2.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-pink-400">{isP2 ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p2.name}</div>
              </div>
            </div>
            <span className="text-3xl font-black font-['Outfit'] text-pink-400">{p2.score}</span>
          </div>
        </div>
      </div>

      {/* Pong Arena Canvas */}
      <div className="p-2 sm:p-3 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={COURT_WIDTH}
          height={COURT_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="rounded-2xl shadow-inner cursor-pointer w-full max-w-3xl aspect-[8/5]"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">Move your mouse or finger up/down on the court to control your paddle. First to 5 points wins!</p>
    </div>
  );
};
