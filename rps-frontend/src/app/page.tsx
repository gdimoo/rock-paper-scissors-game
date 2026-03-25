import { cookies } from 'next/headers';
import { GameBoard } from '@/components/GameBoard/GameBoard';

export default async function GamePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  // Try to validate token server-side (optional: you can fetch /auth/me here)
  // For simplicity, we pass isLoggedIn=true if token cookie exists
  const isLoggedIn = !!token;

  return (
    <main>
      <GameBoard isLoggedIn={isLoggedIn} />
    </main>
  );
}
