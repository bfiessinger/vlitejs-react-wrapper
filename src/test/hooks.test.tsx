import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVlitePlayer } from '../hooks/useVlitePlayer';
import { useVlitePlaybackState } from '../hooks/useVlitePlaybackState';
import type { VliteInstance } from '../types';

// ---------------------------------------------------------------------------
// useVlitePlayer
// ---------------------------------------------------------------------------

describe('useVlitePlayer', () => {
  it('returns a ref, a stable onReady callback, and null player initially', () => {
    const { result } = renderHook(() => useVlitePlayer());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.player).toBeNull();
    expect(typeof result.current.onReady).toBe('function');
  });

  it('sets player state when onReady is called', async () => {
    const { result } = renderHook(() => useVlitePlayer());
    const playerInstance = { play: vi.fn() };

    await act(() => {
      result.current.onReady(playerInstance as never);
    });

    expect(result.current.player).toBe(playerInstance);
  });

  it('onReady callback is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useVlitePlayer());
    const first = result.current.onReady;
    rerender();
    expect(result.current.onReady).toBe(first);
  });

  it('exports from index', async () => {
    const mod = await import('../index');
    expect(mod.useVlitePlayer).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// useVlitePlaybackState
// ---------------------------------------------------------------------------

function makeInstance(): { instance: VliteInstance; container: HTMLElement } {
  const container = document.createElement('div');
  const instance = { container } as unknown as VliteInstance;
  return { instance, container };
}

describe('useVlitePlaybackState', () => {
  it('returns all-false initial state when instance is null', () => {
    const { result } = renderHook(() => useVlitePlaybackState(null));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isEnded).toBe(false);
    expect(result.current.isFullscreen).toBe(false);
  });

  it('sets isPlaying to true on play event', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('play'));
    });

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isEnded).toBe(false);
  });

  it('sets isPlaying to false on pause event', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('play'));
    });
    await act(() => {
      container.dispatchEvent(new Event('pause'));
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('sets isEnded to true and isPlaying to false on ended event', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('play'));
    });
    await act(() => {
      container.dispatchEvent(new Event('ended'));
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isEnded).toBe(true);
  });

  it('resets isEnded to false when play fires after ended', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('ended'));
    });
    await act(() => {
      container.dispatchEvent(new Event('play'));
    });

    expect(result.current.isEnded).toBe(false);
    expect(result.current.isPlaying).toBe(true);
  });

  it('sets isFullscreen to true on enterfullscreen event', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('enterfullscreen'));
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it('sets isFullscreen to false on exitfullscreen event', async () => {
    const { instance, container } = makeInstance();
    const { result } = renderHook(() => useVlitePlaybackState(instance));

    await act(() => {
      container.dispatchEvent(new Event('enterfullscreen'));
    });
    await act(() => {
      container.dispatchEvent(new Event('exitfullscreen'));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it('removes event listeners when unmounted', async () => {
    const { instance, container } = makeInstance();
    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    const { unmount } = renderHook(() => useVlitePlaybackState(instance));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('ended', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('enterfullscreen', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('exitfullscreen', expect.any(Function));
  });

  it('removes old event listeners and attaches new ones when instance changes', async () => {
    const { instance: inst1, container: cont1 } = makeInstance();
    const { instance: inst2, container: cont2 } = makeInstance();
    const remove1 = vi.spyOn(cont1, 'removeEventListener');
    const add2 = vi.spyOn(cont2, 'addEventListener');

    const { rerender } = renderHook(
      ({ inst }: { inst: VliteInstance | null }) => useVlitePlaybackState(inst),
      { initialProps: { inst: inst1 } },
    );

    rerender({ inst: inst2 });

    expect(remove1).toHaveBeenCalledWith('play', expect.any(Function));
    expect(add2).toHaveBeenCalledWith('play', expect.any(Function));
  });

  it('does nothing when instance is null (no crash)', () => {
    expect(() => renderHook(() => useVlitePlaybackState(null))).not.toThrow();
  });

  it('exports from index', async () => {
    const mod = await import('../index');
    expect(mod.useVlitePlaybackState).toBeDefined();
  });
});
