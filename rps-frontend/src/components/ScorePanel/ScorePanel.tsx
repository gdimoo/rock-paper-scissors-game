'use client';

import styles from './ScorePanel.module.scss';

interface ScorePanelProps {
  yourScore: number;
  highScore: number;
  onReset: () => void;
  lastResult: 'WIN' | 'LOSE' | 'DRAW' | null;
  isLocked?: boolean;
}

export function ScorePanel({ yourScore, highScore, onReset, lastResult, isLocked }: ScorePanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.scores}>
        <div className={styles.scoreBlock}>
          <span className={styles.label}>YOUR SCORE</span>
          <span className={`${styles.value} ${lastResult === 'WIN' ? styles.bump : ''}`}>
            {yourScore}
          </span>
          <span className={styles.unit}>turn{yourScore !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.scoreBlock}>
          <span className={styles.label}>HIGH SCORE</span>
          <span className={`${styles.value} ${styles.high}`}>
            {highScore > 0 ? highScore : '—'}
          </span>
          {highScore > 0 && <span className={styles.unit}>turns</span>}
        </div>
      </div>

      <button className={styles.resetBtn} onClick={onReset} disabled={isLocked} aria-label="Reset your score">
        RESET YOUR SCORE
      </button>
    </div>
  );
}
