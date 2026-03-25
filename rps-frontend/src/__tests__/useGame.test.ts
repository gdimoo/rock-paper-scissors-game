import { renderHook, act, waitFor } from '@testing-library/react';
import { useGame } from '@/hooks/useGame';
import { api } from '@/services/api';

// Mock API and WebSocket
jest.mock('@/services/api');
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('useGame hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getHighScore.mockResolvedValue({ highScore: 5 });
  });

  it('loads high score on mount', async () => {
    const { result } = renderHook(() => useGame(false));

    await waitFor(() => {
      expect(result.current.state.highScore).toBe(5);
    });
  });

  it('starts with yourScore = 0', () => {
    const { result } = renderHook(() => useGame(false));
    expect(result.current.state.yourScore).toBe(0);
  });

  it('locks UI immediately when play is called', async () => {
    mockApi.play.mockResolvedValue({
      botAction: 'SCISSORS',
      result: 'WIN',
      yourScore: 1,
      highScore: 5,
    });

    const { result } = renderHook(() => useGame(false));

    act(() => {
      result.current.play('ROCK');
    });

    expect(result.current.state.isLocked).toBe(true);
  });

  it('reveals result after play resolves', async () => {
    jest.useFakeTimers();

    mockApi.play.mockResolvedValue({
      botAction: 'SCISSORS',
      result: 'WIN',
      yourScore: 1,
      highScore: 5,
    });

    const { result } = renderHook(() => useGame(false));

    act(() => {
      result.current.play('ROCK');
    });

    await act(async () => {
      await Promise.resolve(); // flush microtasks
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.state.botAction).toBe('SCISSORS');
    expect(result.current.state.lastResult).toBe('WIN');
    expect(result.current.state.yourScore).toBe(1);
    expect(result.current.state.isLocked).toBe(false);

    jest.useRealTimers();
  });

  it('resets score to 0', async () => {
    mockApi.resetScore.mockResolvedValue(undefined);
    mockApi.play.mockResolvedValue({
      botAction: 'SCISSORS',
      result: 'WIN',
      yourScore: 3,
      highScore: 5,
    });

    const { result } = renderHook(() => useGame(false));

    await act(async () => {
      await result.current.resetScore();
    });

    expect(result.current.state.yourScore).toBe(0);
  });

  it('does not play when isLocked is true', async () => {
    mockApi.play.mockResolvedValue({
      botAction: 'PAPER',
      result: 'LOSE',
      yourScore: 0,
      highScore: 5,
    });

    const { result } = renderHook(() => useGame(false));

    // Lock the game
    act(() => { result.current.play('ROCK'); });
    expect(result.current.state.isLocked).toBe(true);

    // Try to play again while locked
    const callCount = mockApi.play.mock.calls.length;
    act(() => { result.current.play('SCISSORS'); });
    expect(mockApi.play.mock.calls.length).toBe(callCount); // no new calls
  });
});
