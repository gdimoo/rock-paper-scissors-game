'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface UseWebSocketOptions {
  onHighScoreUpdate: (score: number) => void;
}

export function useWebSocket({ onHighScoreUpdate }: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
    });

    socket.on('score:updated', (data: { highScore: number }) => {
      onHighScoreUpdate(data.highScore);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  return { disconnect };
}
