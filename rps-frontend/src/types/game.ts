export type Action = 'ROCK' | 'PAPER' | 'SCISSORS';
export type GameResult = 'WIN' | 'LOSE' | 'DRAW';

export interface GameState {
  yourScore: number;
  highScore: number;
  botAction: Action | null;
  lastResult: GameResult | null;
  isLocked: boolean; // locked for 2 sec while bot reveals
  isLoggedIn: boolean;
}

export interface PlayResponse {
  botAction: Action;
  result: GameResult;
  yourScore: number;
  highScore: number;
}

export interface AuthUser {
  id: string;
  username: string;
  yourScore: number;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
}
