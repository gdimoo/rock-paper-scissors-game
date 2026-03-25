'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, Action, GameResult } from '@/types/game';
import { api } from '@/services/api';
import { useWebSocket } from './useWebSocket';

const REVEAL_DELAY_MS = 2000;

const COOKIE_SCORE_KEY = 'rps_your_score';

function getCookieScore(): number {
  if (typeof document === 'undefined') return 0;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_SCORE_KEY}=([^;]*)`));
  return match ? parseInt(decodeURIComponent(match[1]), 10) : 0;
}

function setCookieScore(score: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_SCORE_KEY}=${score}; expires=${expires}; path=/`;
}

export function useGame(isLoggedIn: boolean) {
  const [state, setState] = useState<GameState>({
    yourScore: 0,
    highScore: 0,
    botAction: null,
    lastResult: null,
    isLocked: false,
    isLoggedIn,
  });

  // Load initial high score on mount
  useEffect(() => {
    api.getHighScore()
      .then(({ highScore }) => {
        setState(prev => ({ ...prev, highScore }));
      })
      .catch(console.error);

    // If not logged in, load yourScore from cookie
    if (!isLoggedIn) {
      setState(prev => ({ ...prev, yourScore: getCookieScore() }));
    }
  }, [isLoggedIn]);

  // WebSocket: real-time high score updates from other clients
  useWebSocket({
    onHighScoreUpdate: (score) => {
      setState(prev => ({ ...prev, highScore: score }));
    },
  });

  const play = useCallback(async (action: Action) => {
    if (state.isLocked) return;

    // Lock UI immediately
    setState(prev => ({ ...prev, isLocked: true, botAction: null, lastResult: null }));

    try {
      const response = await api.play(action);

      // Show bot action after 2 seconds (bot "thinking")
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          botAction: response.botAction,
          lastResult: response.result,
          yourScore: response.yourScore,
          highScore: response.highScore,
          isLocked: false,
        }));

        // Sync cookie if not logged in
        if (!isLoggedIn) {
          setCookieScore(response.yourScore);
        }
      }, REVEAL_DELAY_MS);

    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLocked: false }));
    }
  }, [state.isLocked, isLoggedIn]);

  const resetScore = useCallback(async () => {
    try {
      await api.resetScore();
      setState(prev => ({ ...prev, yourScore: 0, botAction: null, lastResult: null }));
      if (!isLoggedIn) setCookieScore(0);
    } catch (err) {
      console.error(err);
    }
  }, [isLoggedIn]);

  return { state, play, resetScore };
}
