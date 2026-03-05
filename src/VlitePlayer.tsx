import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import Vlitejs from 'vlitejs';
import type { VlitePlayerProps, VliteInstance, VliteEventHandlers } from './types';

/**
 * Map of vlitejs event names to the corresponding VliteEventHandlers prop names.
 */
const EVENT_MAP: Record<string, keyof VliteEventHandlers> = {
  play: 'onPlay',
  pause: 'onPause',
  progress: 'onProgress',
  timeupdate: 'onTimeUpdate',
  volumechange: 'onVolumeChange',
  sourcechange: 'onSourceChange',
  enterfullscreen: 'onEnterFullscreen',
  exitfullscreen: 'onExitFullscreen',
  ended: 'onEnded',
};

/**
 * A React component that wraps the vlitejs player.
 *
 * Attach a ref to access the underlying `Vlitejs` instance directly.
 *
 * @example
 * ```tsx
 * import VlitePlayer from 'vlitejs-react-wrapper';
 * import 'vlitejs/vlite.css';
 *
 * function App() {
 *   return (
 *     <VlitePlayer
 *       src="/video.mp4"
 *       options={{ autoHide: true, poster: '/poster.jpg' }}
 *       onPlay={() => console.log('playing')}
 *     />
 *   );
 * }
 * ```
 */
const VlitePlayer = forwardRef<VliteInstance, VlitePlayerProps>(
  function VlitePlayer(
    {
      src,
      videoId,
      provider = 'html5',
      type = 'video',
      options,
      plugins,
      onReady,
      className,
      style,
      onPlay,
      onPause,
      onProgress,
      onTimeUpdate,
      onVolumeChange,
      onSourceChange,
      onEnterFullscreen,
      onExitFullscreen,
      onEnded,
    },
    ref,
  ) {
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | HTMLDivElement | null>(null);

    // Keep event handler props in a ref so the effect does not re-run when
    // only the callbacks change (avoids tearing down and reinitialising the
    // player on every render).
    const handlersRef = useRef<VliteEventHandlers & { onReady?: VlitePlayerProps['onReady'] }>({
      onPlay,
      onPause,
      onProgress,
      onTimeUpdate,
      onVolumeChange,
      onSourceChange,
      onEnterFullscreen,
      onExitFullscreen,
      onEnded,
      onReady,
    });
    useEffect(() => {
      handlersRef.current = {
        onPlay,
        onPause,
        onProgress,
        onTimeUpdate,
        onVolumeChange,
        onSourceChange,
        onEnterFullscreen,
        onExitFullscreen,
        onEnded,
        onReady,
      };
    });

    // Memoize the serialized plugin list so the effect only re-runs when
    // the plugin IDs actually change, not just when the array reference changes.
    const pluginsKey = useMemo(() => (plugins ?? []).join(','), [plugins]);

    useEffect(() => {
      if (!mediaRef.current) return;

      const vlite = new Vlitejs(mediaRef.current, {
        options: options as Record<string, unknown> | undefined,
        provider,
        plugins: plugins ?? [],
        onReady: (player) => {
          handlersRef.current.onReady?.(player);
        },
      });

      // Attach DOM event listeners to the vlitejs container element.
      // Events are dispatched on `.v-vlite` after the player is ready.
      const container = vlite.container;
      const attachedHandlers: Record<string, (e: Event) => void> = {};
      for (const [eventName, propName] of Object.entries(EVENT_MAP)) {
        const handler = (e: Event) => {
          handlersRef.current[propName]?.(e);
        };
        attachedHandlers[eventName] = handler;
        container.addEventListener(eventName, handler);
      }

      // Forward the vlitejs instance to the external ref
      if (typeof ref === 'function') {
        ref(vlite as unknown as VliteInstance);
      } else if (ref) {
        ref.current = vlite as unknown as VliteInstance;
      }

      return () => {
        // Remove event listeners before destroying
        for (const [eventName, handler] of Object.entries(attachedHandlers)) {
          container.removeEventListener(eventName, handler);
        }
        vlite.destroy();

        // Clear the forwarded ref
        if (typeof ref === 'function') {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
      };
    // Re-initialise only when the provider or serialized plugin list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, pluginsKey]);

    // Determine the element type based on provider / media type
    const isExternalProvider = provider !== 'html5';

    if (isExternalProvider) {
      const dataAttr = `data-${provider}-id`;
      return (
        <div
          ref={mediaRef as React.RefObject<HTMLDivElement>}
          {...{ [dataAttr]: videoId }}
          className={className}
          style={style}
        />
      );
    }

    if (type === 'audio') {
      return (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          className={className}
          style={style}
        />
      );
    }

    return (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        src={src}
        className={className}
        style={style}
      />
    );
  },
);

export default VlitePlayer;
