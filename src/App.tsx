import React, { useState, useEffect } from 'react';
import { getSocket } from './utils/socket';
import { RoomData, GameType, ChatMessage } from './types';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { RoomLobby } from './components/RoomLobby';
import { ChatDrawer } from './components/ChatDrawer';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { HandCricketGame } from './components/games/HandCricketGame';
import { ChessGame } from './components/games/ChessGame';
import { LudoGame } from './components/games/LudoGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { sounds } from './utils/sound';

export function App() {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read ?room= query param on load
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      setUrlRoomCode(codeParam.toUpperCase());
    }

    const socket = getSocket();

    const onConnect = () => {
      setMyPlayerId(socket.id || '');
    };

    const onRoomUpdated = (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
      setErrorMessage(null);
    };

    const onGameStarted = (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
      sounds.playClick();
    };

    const onGameStateUpdated = (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
    };

    const onNewChatMessage = (msg: ChatMessage) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          chat: [...prev.chat, msg]
        };
      });

      if (!isChatOpen && msg.senderId !== socket.id) {
        setUnreadChatCount((c) => c + 1);
        sounds.playClick();
      }
    };

    socket.on('connect', onConnect);
    socket.on('room_updated', onRoomUpdated);
    socket.on('game_started', onGameStarted);
    socket.on('game_state_updated', onGameStateUpdated);
    socket.on('new_chat_message', onNewChatMessage);

    if (socket.connected && socket.id) {
      setMyPlayerId(socket.id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_updated', onRoomUpdated);
      socket.off('game_started', onGameStarted);
      socket.off('game_state_updated', onGameStateUpdated);
      socket.off('new_chat_message', onNewChatMessage);
    };
  }, [isChatOpen]);

  // Handle URL history state when room code changes
  useEffect(() => {
    if (room?.code) {
      window.history.replaceState(null, '', `?room=${room.code}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [room?.code]);

  // Actions
  const handleCreateRoom = (playerName: string, avatar: string, gameType: GameType) => {
    const socket = getSocket();
    socket.emit('create_room', { playerName, avatar, gameType }, (res: any) => {
      if (res?.success) {
        setRoom(res.room);
        setMyPlayerId(socket.id || '');
      } else {
        setErrorMessage(res?.message || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (code: string, playerName: string, avatar: string) => {
    const socket = getSocket();
    socket.emit('join_room', { code, playerName, avatar }, (res: any) => {
      if (res?.success) {
        setRoom(res.room);
        setMyPlayerId(socket.id || '');
      } else {
        setErrorMessage(res?.message || 'Could not join room');
      }
    });
  };

  const handleSoloBotPlay = (playerName: string, avatar: string, gameType: GameType) => {
    const socket = getSocket();
    socket.emit('create_room', { playerName, avatar, gameType }, (res: any) => {
      if (res?.success) {
        const roomCode = res.room.code;
        setRoom(res.room);
        setMyPlayerId(socket.id || '');

        // Add Bot immediately
        socket.emit('add_bot', { roomCode }, (botRes: any) => {
          if (botRes?.success) {
            // Start game immediately!
            setTimeout(() => {
              socket.emit('start_game', { roomCode });
            }, 300);
          }
        });
      }
    });
  };

  const handleToggleReady = () => {
    if (!room) return;
    getSocket().emit('toggle_ready', { roomCode: room.code });
  };

  const handleStartGame = () => {
    if (!room) return;
    getSocket().emit('start_game', { roomCode: room.code }, (res: any) => {
      if (!res?.success) {
        setErrorMessage(res?.message || 'Cannot start match yet');
      }
    });
  };

  const handleAddBot = () => {
    if (!room) return;
    getSocket().emit('add_bot', { roomCode: room.code });
  };

  const handleRemovePlayer = (targetId: string) => {
    if (!room) return;
    getSocket().emit('remove_player', { roomCode: room.code, targetId });
  };

  const handleChangeGame = (gameType: GameType) => {
    if (!room) return;
    getSocket().emit('change_game', { roomCode: room.code, gameType });
  };

  const handleGameAction = (action: string, payload: any) => {
    if (!room) return;
    getSocket().emit('game_action', { roomCode: room.code, action, payload });
  };

  const handleRematch = () => {
    if (!room) return;
    getSocket().emit('rematch_game', { roomCode: room.code });
  };

  const handleReturnToLobby = () => {
    if (!room) return;
    getSocket().emit('return_to_lobby', { roomCode: room.code });
  };

  const handleLeaveRoom = () => {
    sounds.playClick();
    setRoom(null);
    window.location.href = window.location.pathname;
  };

  const handleSendMessage = (text: string, type: 'text' | 'reaction' = 'text') => {
    if (!room) return;
    getSocket().emit('send_chat', { roomCode: room.code, text, type });
  };

  const toggleChat = () => {
    sounds.playClick();
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadChatCount(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        room={room}
        onLeaveRoom={handleLeaveRoom}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs shadow-xl animate-in slide-in-from-top-2 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 font-black text-sm">×</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col justify-center">
        {!room ? (
          // 1. HOME / ARCADE LOBBY
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onSoloBotPlay={handleSoloBotPlay}
            initialRoomCode={urlRoomCode}
          />
        ) : room.status === 'lobby' ? (
          // 2. IN-ROOM WAITING AREA
          <RoomLobby
            room={room}
            myPlayerId={myPlayerId}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
            onRemovePlayer={handleRemovePlayer}
            onChangeGame={handleChangeGame}
          />
        ) : (
          // 3. IN-GAME ARENA
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            {room.gameType === 'hand_cricket' && room.gameState && (
              <HandCricketGame
                gameState={room.gameState}
                myPlayerId={myPlayerId}
                onAction={handleGameAction}
              />
            )}

            {room.gameType === 'chess' && room.gameState && (
              <ChessGame
                gameState={room.gameState}
                myPlayerId={myPlayerId}
                onAction={handleGameAction}
              />
            )}

            {room.gameType === 'ludo' && room.gameState && (
              <LudoGame
                gameState={room.gameState}
                myPlayerId={myPlayerId}
                onAction={handleGameAction}
              />
            )}

            {room.gameType === 'tictactoe' && room.gameState && (
              <TicTacToeGame
                gameState={room.gameState}
                myPlayerId={myPlayerId}
                onAction={handleGameAction}
              />
            )}
          </div>
        )}
      </main>

      {/* Chat Drawer */}
      {room && (
        <ChatDrawer
          chat={room.chat}
          onSendMessage={handleSendMessage}
          isOpen={isChatOpen}
          onToggle={toggleChat}
          unreadCount={unreadChatCount}
        />
      )}

      {/* Game Over Modal with Confetti */}
      {room?.gameState?.status === 'game_over' && (
        <GameOverModal
          winner={room.gameState.winner}
          winReason={room.gameState.winReason}
          isHost={room.hostId === myPlayerId}
          onRematch={handleRematch}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      {/* How to Play Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        defaultGame={room?.gameType || 'hand_cricket'}
      />
    </div>
  );
}
