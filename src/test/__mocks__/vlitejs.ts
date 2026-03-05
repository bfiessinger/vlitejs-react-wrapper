/**
 * Manual mock for vlitejs used in tests.
 *
 * Location: src/test/__mocks__/vlitejs.ts
 * Vitest resolves manual mocks automatically when vi.mock('vlitejs') is called.
 */

import { vi } from 'vitest';

const mockContainer = document.createElement('div');

/** A minimal fake player instance returned by Vlitejs */
export const mockPlayer = {
  on: vi.fn(),
  off: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  mute: vi.fn(),
  unMute: vi.fn(),
  setVolume: vi.fn(),
  getVolume: vi.fn().mockResolvedValue(1),
  getCurrentTime: vi.fn().mockResolvedValue(0),
  getDuration: vi.fn().mockResolvedValue(0),
  seekTo: vi.fn(),
  setSource: vi.fn(),
  requestFullscreen: vi.fn(),
  exitFullscreen: vi.fn(),
  getInstance: vi.fn(),
  loading: vi.fn(),
  destroy: vi.fn(),
  _reactHandlers: {} as Record<string, (e: Event) => void>,
};

const MockVlitejs = vi.fn().mockImplementation(
  (
    _element: Element,
    config: { onReady?: (player: typeof mockPlayer) => void } = {},
  ) => {
    const instance = {
      player: mockPlayer,
      container: mockContainer,
      destroy: vi.fn().mockImplementation(() => {
        instance.player._reactHandlers = {};
      }),
    };

    // Invoke onReady synchronously so tests don't need async handling
    config.onReady?.(mockPlayer);

    return instance;
  },
);

export default MockVlitejs;
