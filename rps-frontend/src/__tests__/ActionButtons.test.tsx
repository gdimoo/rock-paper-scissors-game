import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from '@/components/ActionButtons/ActionButtons';

describe('ActionButtons', () => {
  it('renders all three action buttons', () => {
    render(<ActionButtons onAction={jest.fn()} isLocked={false} lastAction={null} />);
    expect(screen.getByRole('button', { name: /rock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /paper/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scissors/i })).toBeInTheDocument();
  });

  it('calls onAction with ROCK when ROCK is clicked', () => {
    const onAction = jest.fn();
    render(<ActionButtons onAction={onAction} isLocked={false} lastAction={null} />);
    fireEvent.click(screen.getByRole('button', { name: /rock/i }));
    expect(onAction).toHaveBeenCalledWith('ROCK');
  });

  it('calls onAction with PAPER when PAPER is clicked', () => {
    const onAction = jest.fn();
    render(<ActionButtons onAction={onAction} isLocked={false} lastAction={null} />);
    fireEvent.click(screen.getByRole('button', { name: /paper/i }));
    expect(onAction).toHaveBeenCalledWith('PAPER');
  });

  it('calls onAction with SCISSORS when SCISSORS is clicked', () => {
    const onAction = jest.fn();
    render(<ActionButtons onAction={onAction} isLocked={false} lastAction={null} />);
    fireEvent.click(screen.getByRole('button', { name: /scissors/i }));
    expect(onAction).toHaveBeenCalledWith('SCISSORS');
  });

  it('disables all buttons when isLocked is true', () => {
    render(<ActionButtons onAction={jest.fn()} isLocked={true} lastAction={null} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('does not call onAction when locked and button clicked', () => {
    const onAction = jest.fn();
    render(<ActionButtons onAction={onAction} isLocked={true} lastAction={null} />);
    fireEvent.click(screen.getByRole('button', { name: /rock/i }));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('shows waiting message when locked', () => {
    render(<ActionButtons onAction={jest.fn()} isLocked={true} lastAction={null} />);
    expect(screen.getByText(/waiting for result/i)).toBeInTheDocument();
  });

  it('marks lastAction button as pressed', () => {
    render(<ActionButtons onAction={jest.fn()} isLocked={false} lastAction="PAPER" />);
    const paperBtn = screen.getByRole('button', { name: /paper/i });
    expect(paperBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
