import { render, screen } from '@testing-library/react';
import { BotDisplay } from '@/components/BotDisplay/BotDisplay';

describe('BotDisplay', () => {
  it('shows ??? when not locked and no botAction', () => {
    render(<BotDisplay botAction={null} lastResult={null} isLocked={false} />);
    expect(screen.getByText('???')).toBeInTheDocument();
  });

  it('shows ??? while locked (bot thinking)', () => {
    render(<BotDisplay botAction={null} lastResult={null} isLocked={true} />);
    expect(screen.getByText('???')).toBeInTheDocument();
  });

  it('shows ROCK emoji when botAction is ROCK', () => {
    render(<BotDisplay botAction="ROCK" lastResult="LOSE" isLocked={false} />);
    expect(screen.getByText('✊')).toBeInTheDocument();
  });

  it('shows PAPER emoji when botAction is PAPER', () => {
    render(<BotDisplay botAction="PAPER" lastResult="WIN" isLocked={false} />);
    expect(screen.getByText('✋')).toBeInTheDocument();
  });

  it('shows SCISSORS emoji when botAction is SCISSORS', () => {
    render(<BotDisplay botAction="SCISSORS" lastResult="DRAW" isLocked={false} />);
    expect(screen.getByText('✌️')).toBeInTheDocument();
  });

  it('shows YOU WIN when result is WIN', () => {
    render(<BotDisplay botAction="SCISSORS" lastResult="WIN" isLocked={false} />);
    expect(screen.getByText('YOU WIN')).toBeInTheDocument();
  });

  it('shows YOU LOSE when result is LOSE', () => {
    render(<BotDisplay botAction="ROCK" lastResult="LOSE" isLocked={false} />);
    expect(screen.getByText('YOU LOSE')).toBeInTheDocument();
  });

  it('shows DRAW when result is DRAW', () => {
    render(<BotDisplay botAction="PAPER" lastResult="DRAW" isLocked={false} />);
    expect(screen.getByText('DRAW')).toBeInTheDocument();
  });

  it('shows BOT ACTION label', () => {
    render(<BotDisplay botAction={null} lastResult={null} isLocked={false} />);
    expect(screen.getByText('BOT ACTION')).toBeInTheDocument();
  });
});
