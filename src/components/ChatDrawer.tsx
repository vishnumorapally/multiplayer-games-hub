import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Smile, Flame } from 'lucide-react';
import { ChatMessage } from '../types';
import { sounds } from '../utils/sound';

interface ChatDrawerProps {
  chat: ChatMessage[];
  onSendMessage: (text: string, type?: 'text' | 'reaction') => void;
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
}

const QUICK_REACTIONS = [
  "🔥 Good shot!",
  "🏏 Howzat!!",
  "🎯 Nice move!",
  "🎲 Lucky roll!",
  "♟️ Check!",
  "🤝 GG!",
  "⚔️ Rematch?",
  "😅 Oops!"
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  chat,
  onSendMessage,
  isOpen,
  onToggle,
  unreadCount
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    sounds.playClick();
  };

  const handleQuickReaction = (text: string) => {
    onSendMessage(text, 'reaction');
    sounds.playClick();
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 border border-indigo-400/40 transition hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Live Chat</span>
        {unreadCount > 0 && (
          <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-[11px] font-bold text-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-panel border-l border-slate-700/80 flex flex-col shadow-2xl bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 font-['Outfit']">Room Chat & Reactions</h3>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Reaction Pills */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Reactions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REACTIONS.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReaction(r)}
                  className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-400/50 transition active:scale-95"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <Smile className="w-10 h-10 mb-2 opacity-40 text-indigo-400" />
                <p className="text-sm">No messages yet!</p>
                <p className="text-xs text-slate-600">Send a greeting or reaction to your opponents.</p>
              </div>
            ) : (
              chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl border ${
                    msg.type === 'reaction'
                      ? 'bg-indigo-950/40 border-indigo-500/30'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold flex items-center space-x-1 text-indigo-300">
                      <span>{msg.avatar}</span>
                      <span>{msg.sender}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div className={`text-sm ${msg.type === 'reaction' ? 'font-semibold text-indigo-200' : 'text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              maxLength={120}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
