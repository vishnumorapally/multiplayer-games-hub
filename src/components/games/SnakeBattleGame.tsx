import React, { useEffect, useRef } from 'react';
import { SnakeBattleState } from '../../types';
import { sounds } from '../../utils/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SnakeBattleGameProps {
  gameState: SnakeBattleState;
  myPlayerId: string;
  onAction: (action: string, payload: any) => void;
}

export const SnakeBattleGame: React.FC<SnakeBattleGameProps> = ({
  gameState,
  myPlayerId,
  onAction
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [p1Id, p2Id] = gameState.playerIds;
  const p1 = gameState.players[p1Id];
  const p2 = gameState.players[p2Id];

  const handleDirection = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    onAction('change_dir', { direction });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) handleDirection('UP');
      else if (['ArrowDown', 'KeyS'].includes(e.code)) handleDirection('DOWN');
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) handleDirection('LEFT');
      else if (['ArrowRight', 'KeyD'].includes(e.code)) handleDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const gridSize = gameState.gridSize;
    const cellSize = size / gridSize;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = '#1e293b22';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    const [fr, fc] = gameState.food;
    ctx.font = `${cellSize * 0.9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍎', (fc + 0.5) * cellSize, (fr + 0.5) * cellSize);

    // Draw snakes
    [p1, p2].forEach(p => {
      if (!p) return;
      p.body.forEach(([r, c], idx) => {
        ctx.fillStyle = p.color;
        if (idx === 0) {
          // Head glow
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.roundRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });
  }, [gameState]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-in fade-in select-none">
      {/* Player Scores HUD */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Player 1 */}
        <div className="p-3.5 rounded-2xl glass-card border border-emerald-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p1.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-emerald-400">{p1Id === myPlayerId ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p1.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-emerald-400">{p1.score}</span>
              <span className="text-xs text-slate-400 block -mt-1">pts</span>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className="p-3.5 rounded-2xl glass-card border border-purple-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{p2.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-purple-400">{p2Id === myPlayerId ? 'YOU' : 'OPPONENT'}</div>
                <div className="text-sm font-bold text-white">{p2.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-['Outfit'] text-purple-400">{p2.score}</span>
              <span className="text-xs text-slate-400 block -mt-1">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Snake Arena Canvas */}
      <div className="p-2 sm:p-3 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="rounded-2xl shadow-inner max-w-full"
        />
      </div>

      {/* Mobile Touch Direction Controls */}
      <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
        <button onClick={() => handleDirection('UP')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white shadow">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <button onClick={() => handleDirection('LEFT')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white shadow">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => handleDirection('DOWN')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white shadow">
            <ArrowDown className="w-5 h-5" />
          </button>
          <button onClick={() => handleDirection('RIGHT')} className="p-3 rounded-xl bg-slate-800 active:bg-indigo-600 text-white shadow">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 hidden sm:block">Control your snake with arrow keys or W, A, S, D.</p>
    </div>
  );
};
