'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import styles from './login.module.scss';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { access_token } = await fn({ username, password });

      // Store token in both localStorage and cookie (for SSR)
      localStorage.setItem('token', access_token);
      document.cookie = `token=${access_token}; path=/; max-age=${60 * 60 * 24 * 30}`;

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === 'login' ? 'Invalid username or password.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.logo}>RPS<span className={styles.slash}>//</span>ARENA</h1>
        <p className={styles.sub}>IDENTIFY YOURSELF</p>

        <div className={styles.tabs}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`${styles.tab} ${mode === m ? styles.active : ''}`}
              onClick={() => { setMode(m); setError(''); }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="username">USERNAME</label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={3}
              maxLength={30}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="password">PASSWORD</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'PROCESSING…' : mode === 'login' ? 'ENTER ARENA' : 'CREATE PLAYER'}
          </button>
        </form>

        <a href="/" className={styles.skip}>PLAY AS GUEST →</a>
      </div>
    </main>
  );
}
