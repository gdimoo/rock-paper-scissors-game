export type Action = 'ROCK' | 'PAPER' | 'SCISSORS';
export type GameResult = 'WIN' | 'LOSE' | 'DRAW';

export const ACTIONS: Action[] = ['ROCK', 'PAPER', 'SCISSORS'];

/**
 * Win map: key beats every value in the array.
 * ROCK beats SCISSORS, PAPER beats ROCK, SCISSORS beats PAPER.
 */
export const BEATS: Record<Action, Action> = {
  ROCK:     'SCISSORS',
  PAPER:    'ROCK',
  SCISSORS: 'PAPER',
};

export function determineResult(player: Action, bot: Action): GameResult {
  if (player === bot) return 'DRAW';
  if (BEATS[player] === bot) return 'WIN';
  return 'LOSE';
}

export function randomAction(): Action {
  return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
}
