'use client';

import { Action } from '@/types/game';
import styles from './ActionButtons.module.scss';

const ACTIONS: { key: Action; emoji: string; label: string }[] = [
  { key: 'ROCK',     emoji: '✊', label: 'Rock' },
  { key: 'PAPER',    emoji: '✋', label: 'Paper' },
  { key: 'SCISSORS', emoji: '✌️', label: 'Scissors' },
];

interface ActionButtonsProps {
  onAction: (action: Action) => void;
  isLocked: boolean;
  lastAction: Action | null;
}

export function ActionButtons({ onAction, isLocked, lastAction }: ActionButtonsProps) {
  return (
    <div className={styles.row} role="group" aria-label="Choose your action">
      <span className={styles.label}>YOUR ACTION</span>
      <div className={styles.buttons}>
        {ACTIONS.map(({ key, emoji, label }) => (
          <button
            key={key}
            className={`${styles.btn} ${lastAction === key && !isLocked ? styles.chosen : ''}`}
            onClick={() => onAction(key)}
            disabled={isLocked}
            aria-label={label}
            aria-pressed={lastAction === key}
          >
            <span className={styles.emoji}>{emoji}</span>
            <span className={styles.name}>{key}</span>
          </button>
        ))}
      </div>
      {isLocked && (
        <p className={styles.lockMsg} role="status">
          Waiting for result…
        </p>
      )}
    </div>
  );
}
