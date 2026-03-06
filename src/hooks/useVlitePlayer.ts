import { useCallback, useRef, useState } from 'react';
import type { VliteInstance, VlitePlayerType } from '../types';

/**
 * A React hook that wires a vlitejs player ref with a stable `onReady` callback
 * and exposes the underlying `VlitePlayerType` instance as reactive state.
 *
 * Pass the returned `ref` to the `<VlitePlayer>` `ref` prop and the returned
 * `onReady` to its `onReady` prop. Once the player has initialised, `player`
 * will be set to the vlitejs player instance so that you can call imperative
 * methods (e.g. `player.play()`) inside other React callbacks.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { ref, onReady, player } = useVlitePlayer();
 *
 *   return (
 *     <>
 *       <VlitePlayer src="/video.mp4" ref={ref} onReady={onReady} />
 *       <button onClick={() => player?.play()}>Play</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useVlitePlayer() {
  const ref = useRef<VliteInstance | null>(null);
  const [player, setPlayer] = useState<VlitePlayerType | null>(null);

  const onReady = useCallback((p: VlitePlayerType) => {
    setPlayer(p);
  }, []);

  return { ref, onReady, player } as const;
}
