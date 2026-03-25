import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.scss';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RPS // ARENA',
  description: 'Rock Paper Scissors — Challenge accepted.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
