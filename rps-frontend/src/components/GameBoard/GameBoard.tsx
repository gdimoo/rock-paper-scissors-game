'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Action } from '@/types/game';
import { useGame } from '@/hooks/useGame';
import { api } from '@/services/api';
import { ScorePanel } from '@/components/ScorePanel/ScorePanel';
import { BotDisplay } from '@/components/BotDisplay/BotDisplay';
import { ActionButtons } from '@/components/ActionButtons/ActionButtons';
import styles from './GameBoard.module.scss';

interface GameBoardProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout?: () => void;
}

export function GameBoard({ isLoggedIn, username: usernameProp, onLogout }: GameBoardProps) {
  const router = useRouter();
  const { state, play, resetScore } = useGame(isLoggedIn);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const [username, setUsername] = useState(usernameProp ?? '');

  useEffect(() => {
    if (isLoggedIn && !usernameProp) {
      api.getMe().then(u => setUsername(u.username)).catch(() => {});
    }
  }, [isLoggedIn, usernameProp]);

  function handleAction(action: Action) {
    setLastAction(action);
    play(action);
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <div className={styles.board}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>RPS<span className={styles.slash}>//</span>ARENA</h1>
        <div className={styles.headerRight}>
          {isLoggedIn && username && (
            <span className={styles.user}>{username}</span>
          )}
          {isLoggedIn && (
            <button className={styles.logoutBtn} onClick={handleLogout} disabled={state.isLocked}>
              LOGOUT
            </button>
          )}
          {!isLoggedIn && (
            <a href="/login" className={`${styles.loginLink} ${state.isLocked ? styles.loginLinkDisabled : ''}`} onClick={e => state.isLocked && e.preventDefault()}>LOGIN</a>
          )}
        </div>
      </header>

      {/* Scores */}
      <ScorePanel
        yourScore={state.yourScore}
        highScore={state.highScore}
        onReset={resetScore}
        lastResult={state.lastResult}
        isLocked={state.isLocked}
      />

      {/* Arena */}
      <div className={styles.arena}>
        <BotDisplay
          botAction={state.botAction}
          lastResult={state.lastResult}
          isLocked={state.isLocked}
        />
      </div>

      {/* Actions */}
      <ActionButtons
        onAction={handleAction}
        isLocked={state.isLocked}
        lastAction={state.isLocked ? lastAction : lastAction}
      />
    </div>
  );
}
