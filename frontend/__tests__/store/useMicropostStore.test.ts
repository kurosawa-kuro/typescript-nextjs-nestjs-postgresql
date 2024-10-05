import { renderHook, act } from '@testing-library/react';
import { useMicropostStore } from '../../src/app/store/useMicropostStore';

describe('useMicropostStore', () => {
  beforeEach(() => {
    useMicropostStore.getState().setMicroposts([]);
  });

  it('should initialize with empty microposts', () => {
    const { result } = renderHook(() => useMicropostStore());
    expect(result.current.microposts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set microposts', () => {
    const { result } = renderHook(() => useMicropostStore());
    const testMicroposts = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
      { id: 2, userId: 2, title: 'Test Post 2', userName: 'User2' },
    ];

    act(() => {
      result.current.setMicroposts(testMicroposts);
    });

    expect(result.current.microposts).toEqual(testMicroposts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should add a new micropost', () => {
    const { result } = renderHook(() => useMicropostStore());
    const initialMicroposts = [
      { id: 1, userId: 1, title: 'Test Post 1', userName: 'User1' },
    ];
    const newMicropost = { id: 2, userId: 2, title: 'New Post', userName: 'User2' };

    act(() => {
      result.current.setMicroposts(initialMicroposts);
    });

    act(() => {
      result.current.addMicropost(newMicropost);
    });

    expect(result.current.microposts).toEqual([newMicropost, ...initialMicroposts]);
  });
});