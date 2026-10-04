import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // In dev, vite proxies /socket.io to 3001. In prod, backend serves frontend on same origin.
    // If running standalone frontend without proxy, fallback to 3001
    const serverUrl = window.location.port === '5173'
      ? 'http://localhost:3001'
      : window.location.origin;

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('✅ Connected to GameVerse Socket Server:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket Server:', reason);
    });
  }

  return socket;
}
