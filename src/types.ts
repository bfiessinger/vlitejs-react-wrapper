import type { VlitePlayerInstance } from 'vlitejs';
import Vlitejs from 'vlitejs';

export type VlitePlayerType = VlitePlayerInstance;
export type VliteInstance = InstanceType<typeof Vlitejs>;

/**
 * An inline provider registration object.
 * Pass this as the `provider` prop to automatically register the provider
 * via `Vlitejs.registerProvider` before the player is initialised.
 */
export interface VliteProviderRegistration {
  /** The provider identifier (e.g. `'youtube'`, `'vimeo'`, `'dailymotion'`). */
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** The provider factory function (see vlitejs provider API). */
  entry: any;
  /** Optional provider-level options forwarded to `Vlitejs.registerProvider`. */
  options?: unknown;
}

/**
 * An inline plugin registration object.
 * Pass this inside the `plugins` array to automatically register the plugin
 * via `Vlitejs.registerPlugin` before the player is initialised.
 */
export interface VlitePluginRegistration {
  /** The plugin identifier (e.g. `'hotkeys'`, `'subtitle'`, `'pip'`). */
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** The plugin class (see vlitejs plugin API). */
  entry: any;
  /** Optional plugin-level options forwarded to `Vlitejs.registerPlugin`. */
  options?: unknown;
}

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
 * - Pass a `string` ID when the plugin has already been registered globally
 *   with `Vlitejs.registerPlugin`.
 * - Pass a {@link VlitePluginRegistration} object to register the plugin
 *   inline; the wrapper will call `Vlitejs.registerPlugin` automatically.
 */
export type VlitePlugin = string | VlitePluginRegistration;

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
  /**
   * The vlitejs provider to use.
   *
   * - Pass a `string` (e.g. `'html5'`, `'youtube'`) when the provider has
   *   already been registered globally with `Vlitejs.registerProvider`.
   * - Pass a {@link VliteProviderRegistration} object to register the provider
   *   inline; the wrapper will call `Vlitejs.registerProvider` automatically.
   *
   * Default: `'html5'`
   */
  provider?: string | VliteProviderRegistration;
  /** The media type: 'video' or 'audio'. Default: 'video' */
  type?: 'video' | 'audio';
  /** vlitejs player options */
  options?: VliteOptions;
  /**
   * Plugins to activate on the player.
   *
   * Each entry can be:
   * - A `string` ID for a plugin that has already been registered globally
   *   with `Vlitejs.registerPlugin`.
   * - A {@link VlitePluginRegistration} object to register the plugin inline;
   *   the wrapper will call `Vlitejs.registerPlugin` automatically.
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
