import { useEffect, useState } from 'react';
import type { VliteInstance } from '../types';

/**
 * Reactive playback state derived from vlitejs DOM events.
 */
export interface VlitePlaybackState {
  /** `true` while the media is playing. */
  isPlaying: boolean;
  /** `true` after playback has reached the end. Reset to `false` on the next play. */
  isEnded: boolean;
  /** `true` while the player is in fullscreen mode (video only). */
  isFullscreen: boolean;
}

/**
 * A React hook that subscribes to vlitejs DOM events on a `VliteInstance` and
 * returns reactive playback state.
 *
 * Pass the `VliteInstance` obtained from the `ref` forwarded to `<VlitePlayer>`
 * (or from `useVlitePlayer`). The state is initialised to all-false and updates
 * automatically as the player emits events. All listeners are removed when the
 * instance changes or the component unmounts.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { ref, onReady } = useVlitePlayer();
 *   const { isPlaying, isEnded, isFullscreen } = useVlitePlaybackState(ref.current);
 *
 *   return (
 *     <>
 *       <VlitePlayer src="/video.mp4" ref={ref} onReady={onReady} />
 *       {isPlaying && <span>▶ Playing</span>}
 *       {isEnded && <span>Playback ended</span>}
 *     </>
 *   );
 * }
 * ```
 */
export function useVlitePlaybackState(instance: VliteInstance | null): VlitePlaybackState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!instance) return;

    const container = instance.container;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsEnded(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsEnded(true);
    };
    const handleEnterFullscreen = () => setIsFullscreen(true);
    const handleExitFullscreen = () => setIsFullscreen(false);

    container.addEventListener('play', handlePlay);
    container.addEventListener('pause', handlePause);
    container.addEventListener('ended', handleEnded);
    container.addEventListener('enterfullscreen', handleEnterFullscreen);
    container.addEventListener('exitfullscreen', handleExitFullscreen);

    return () => {
      container.removeEventListener('play', handlePlay);
      container.removeEventListener('pause', handlePause);
      container.removeEventListener('ended', handleEnded);
      container.removeEventListener('enterfullscreen', handleEnterFullscreen);
      container.removeEventListener('exitfullscreen', handleExitFullscreen);
    };
  }, [instance]);

  return { isPlaying, isEnded, isFullscreen };
}
