import { determineResult, randomAction, ACTIONS } from './game.types';

describe('determineResult', () => {
  it('returns DRAW when both actions are the same', () => {
    expect(determineResult('ROCK', 'ROCK')).toBe('DRAW');
    expect(determineResult('PAPER', 'PAPER')).toBe('DRAW');
    expect(determineResult('SCISSORS', 'SCISSORS')).toBe('DRAW');
  });

  it('ROCK beats SCISSORS', () => {
    expect(determineResult('ROCK', 'SCISSORS')).toBe('WIN');
  });

  it('PAPER beats ROCK', () => {
    expect(determineResult('PAPER', 'ROCK')).toBe('WIN');
  });

  it('SCISSORS beats PAPER', () => {
    expect(determineResult('SCISSORS', 'PAPER')).toBe('WIN');
  });

  it('SCISSORS loses to ROCK', () => {
    expect(determineResult('SCISSORS', 'ROCK')).toBe('LOSE');
  });

  it('ROCK loses to PAPER', () => {
    expect(determineResult('ROCK', 'PAPER')).toBe('LOSE');
  });

  it('PAPER loses to SCISSORS', () => {
    expect(determineResult('PAPER', 'SCISSORS')).toBe('LOSE');
  });
});

describe('randomAction', () => {
  it('always returns a valid action', () => {
    for (let i = 0; i < 100; i++) {
      expect(ACTIONS).toContain(randomAction());
    }
  });

  it('returns all three actions given enough samples', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) seen.add(randomAction());
    expect(seen.size).toBe(3);
  });
});
