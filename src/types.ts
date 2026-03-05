import type { VlitePlayerInstance } from 'vlitejs';
import Vlitejs from 'vlitejs';

export type VlitePlayerType = VlitePlayerInstance;
export type VliteInstance = InstanceType<typeof Vlitejs>;

/**
 * vlitejs player options.
 * Controls which elements appear on the control bar and other player behaviors.
 */
export interface VliteOptions {
  /** Display the control bar (video only). Default: true */
  controls?: boolean;
  /** Enable autoplay. Default: false */
  autoplay?: boolean;
  /** Display the play/pause button. Default: true */
  playPause?: boolean;
  /** Display the progress bar. Default: true */
  progressBar?: boolean;
  /** Display the time indicator. Default: true */
  time?: boolean;
  /** Display the volume button. Default: true */
  volume?: boolean;
  /** Display the fullscreen button (video only). Default: true */
  fullscreen?: boolean;
  /** Customize the video poster URL (video only). Default: null */
  poster?: string | null;
  /** Display the big play button on the poster (video only). Default: true */
  bigPlay?: boolean;
  /** Add the playsinline attribute to the video (video only). Default: true */
  playsinline?: boolean;
  /** Whether to loop the media. Default: false */
  loop?: boolean;
  /** Whether to mute the media (video only). Default: false */
  muted?: boolean;
  /** Auto-hide the control bar on inactivity (video only). Default: false */
  autoHide?: boolean;
  /** Auto-hide delay in milliseconds (video only). Default: 3000 */
  autoHideDelay?: number;
  /** Override the provider-specific player parameters. Default: {} */
  providerParams?: Record<string, unknown>;
}

/**
 * vlitejs plugin registration.
 */
export type VlitePlugin = string;

/**
 * Event handler types emitted by the vlitejs player.
 */
export interface VliteEventHandlers {
  /** Fired when playback starts */
  onPlay?: (event: Event) => void;
  /** Fired when playback is paused */
  onPause?: (event: Event) => void;
  /** Fired periodically as media downloads */
  onProgress?: (event: Event) => void;
  /** Fired when the current time updates */
  onTimeUpdate?: (event: Event) => void;
  /** Fired when the audio volume changes */
  onVolumeChange?: (event: Event) => void;
  /** Fired when the media source changes */
  onSourceChange?: (event: Event) => void;
  /** Fired when the video enters fullscreen (video only) */
  onEnterFullscreen?: (event: Event) => void;
  /** Fired when the video exits fullscreen (video only) */
  onExitFullscreen?: (event: Event) => void;
  /** Fired when playback ends */
  onEnded?: (event: Event) => void;
}

/**
 * Props for the VlitePlayer component.
 */
export interface VlitePlayerProps extends VliteEventHandlers {
  /**
   * The media source URL (used for HTML5 video/audio providers).
   * For external providers, use the `videoId` prop instead.
   */
  src?: string;
  /**
   * The video ID for external providers (e.g. YouTube, Vimeo, Dailymotion).
   * Sets the corresponding `data-{provider}-id` attribute on the element.
   */
  videoId?: string;
  /** The vlitejs provider to use. Default: 'html5' */
  provider?: string;
  /** The media type: 'video' or 'audio'. Default: 'video' */
  type?: 'video' | 'audio';
  /** vlitejs player options */
  options?: VliteOptions;
  /**
   * List of plugin IDs to activate.
   * Plugins must be registered with `Vlitejs.registerPlugin` before use.
   */
  plugins?: VlitePlugin[];
  /**
   * Callback fired when the player is ready.
   * Receives the vlitejs player instance.
   */
  onReady?: (player: VlitePlayerType) => void;
  /** Additional CSS class names to apply to the container element */
  className?: string;
  /** Inline styles for the container element */
  style?: React.CSSProperties;
}
