import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Share2, LogOut, Check, Gamepad2, Users } from 'lucide-react';
import { sounds } from '../utils/sound';
import { RoomData } from '../types';

interface NavbarProps {
  room: RoomData | null;
  onLeaveRoom: () => void;
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ room, onLeaveRoom, onOpenRules }) => {
  const [muted, setMuted] = useState(sounds.isMuted);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  const copyRoomLink = () => {
    if (!room) return;
    const url = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => !room && window.location.reload()}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-['Outfit'] text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent">
                GameVerse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multiplayer
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Realtime Games & Tournaments</p>
          </div>
        </div>

        {/* Room Info (if inside room) */}
        {room && (
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-indigo-500/30 rounded-full px-3 py-1.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400 hidden md:inline">ROOM:</span>
            <span className="font-mono text-sm font-bold text-indigo-300 tracking-wider">{room.code}</span>
            <button
              onClick={copyRoomLink}
              title="Copy Room Link"
              className="ml-1 p-1 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded-full transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <div className="h-3 w-[1px] bg-slate-700 mx-1"></div>
            <div className="flex items-center space-x-1 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.players.length}/{room.maxPlayers}</span>
            </div>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition"
            title="How to Play"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {room && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
