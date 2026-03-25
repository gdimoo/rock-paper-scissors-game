'use client';

import { Action, GameResult } from '@/types/game';
import styles from './BotDisplay.module.scss';

const ACTION_EMOJI: Record<Action, string> = {
  ROCK: '✊',
  PAPER: '✋',
  SCISSORS: '✌️',
};

const RESULT_LABEL: Record<GameResult, string> = {
  WIN: 'YOU WIN',
  LOSE: 'YOU LOSE',
  DRAW: 'DRAW',
};

interface BotDisplayProps {
  botAction: Action | null;
  lastResult: GameResult | null;
  isLocked: boolean;
}

export function BotDisplay({ botAction, lastResult, isLocked }: BotDisplayProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>BOT ACTION</span>

      <div className={`${styles.box} ${isLocked ? styles.thinking : ''} ${botAction ? styles.revealed : ''}`}>
        {isLocked && !botAction ? (
          <span className={styles.mystery}>???</span>
        ) : botAction ? (
          <span className={styles.emoji}>{ACTION_EMOJI[botAction]}</span>
        ) : (
          <span className={styles.mystery}>???</span>
        )}
      </div>

      <div className={`${styles.result} ${lastResult ? styles[lastResult.toLowerCase()] : ''}`}>
        {lastResult ? RESULT_LABEL[lastResult] : '\u00a0'}
      </div>
    </div>
  );
}
