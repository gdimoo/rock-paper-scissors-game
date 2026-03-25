import { render, screen, fireEvent } from '@testing-library/react';
import { ScorePanel } from '@/components/ScorePanel/ScorePanel';

describe('ScorePanel', () => {
  const defaultProps = {
    yourScore: 0,
    highScore: 0,
    onReset: jest.fn(),
    lastResult: null as null,
  };

  it('renders YOUR SCORE label', () => {
    render(<ScorePanel {...defaultProps} />);
    expect(screen.getByText('YOUR SCORE')).toBeInTheDocument();
  });

  it('renders HIGH SCORE label', () => {
    render(<ScorePanel {...defaultProps} />);
    expect(screen.getByText('HIGH SCORE')).toBeInTheDocument();
  });

  it('shows yourScore value', () => {
    render(<ScorePanel {...defaultProps} yourScore={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows — when highScore is 0', () => {
    render(<ScorePanel {...defaultProps} highScore={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows highScore value when > 0', () => {
    render(<ScorePanel {...defaultProps} highScore={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const onReset = jest.fn();
    render(<ScorePanel {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /reset your score/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows "turn" for score of 1', () => {
    render(<ScorePanel {...defaultProps} yourScore={1} />);
    expect(screen.getByText('turn')).toBeInTheDocument();
  });

  it('shows "turns" for score > 1', () => {
    render(<ScorePanel {...defaultProps} yourScore={3} />);
    expect(screen.getByText('turns')).toBeInTheDocument();
  });
});
