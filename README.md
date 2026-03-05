# vlitejs-react-wrapper

A lightweight React wrapper component for the [vlitejs](https://github.com/vlitejs/vlite) video and audio player.

## Features

- Full support for all vlitejs providers: HTML5 video/audio, YouTube, Vimeo, Dailymotion
- Forward event handler props (`onPlay`, `onPause`, `onEnded`, etc.) wired directly to the vlitejs event system
- TypeScript support with full type definitions
- `ref` forwarding to expose the underlying `Vlitejs` instance
- Plugin support via the `plugins` prop

## Installation

```bash
npm install vlitejs-react-wrapper vlitejs react react-dom
```

## Usage

### HTML5 video

```tsx
import VlitePlayer from 'vlitejs-react-wrapper';
import 'vlitejs/vlite.css';

function App() {
  return (
    <VlitePlayer
      src="/path/to/video.mp4"
      options={{ autoHide: true, poster: '/path/to/poster.jpg' }}
      onPlay={() => console.log('playing')}
      onEnded={() => console.log('ended')}
    />
  );
}
```

### HTML5 audio

```tsx
<VlitePlayer
  type="audio"
  src="/path/to/audio.mp3"
  options={{ controls: true }}
/>
```

### YouTube

```tsx
import VlitePlayer from 'vlitejs-react-wrapper';
import 'vlitejs/vlite.css';
import YoutubeProvider from 'vlitejs/providers/youtube';

function App() {
  return (
    <VlitePlayer
      provider={{ id: 'youtube', entry: YoutubeProvider }}
      videoId="dQw4w9WgXcQ"
      options={{ controls: true }}
    />
  );
}
```

Alternatively, if you prefer to register the provider globally yourself (e.g. once at application start), you can still pass the provider name as a plain string:

```tsx
import Vlitejs from 'vlitejs';
import YoutubeProvider from 'vlitejs/providers/youtube';

// Register once at app startup
Vlitejs.registerProvider('youtube', YoutubeProvider);

function App() {
  return (
    <VlitePlayer
      provider="youtube"
      videoId="dQw4w9WgXcQ"
      options={{ controls: true }}
    />
  );
}
```

### Accessing the player instance via ref

```tsx
import { useRef } from 'react';
import VlitePlayer from 'vlitejs-react-wrapper';
import type { VliteInstance } from 'vlitejs-react-wrapper';
import 'vlitejs/vlite.css';

function App() {
  const playerRef = useRef<VliteInstance>(null);

  return (
    <>
      <VlitePlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current?.player.play()}>Play</button>
      <button onClick={() => playerRef.current?.player.pause()}>Pause</button>
    </>
  );
}
```

### Using the `onReady` callback

```tsx
<VlitePlayer
  src="/video.mp4"
  onReady={(player) => {
    player.mute();
    player.getDuration().then((duration) => {
      console.log('Duration:', duration);
    });
  }}
/>
```

### Using plugins

Pass a `VlitePluginRegistration` object in the `plugins` array to register the plugin inline — no need to call `Vlitejs.registerPlugin` yourself:

```tsx
import VlitePlayer from 'vlitejs-react-wrapper';
import HotkeysPlugin from 'vlitejs/plugins/hotkeys';

function App() {
  return (
    <VlitePlayer
      src="/video.mp4"
      plugins={[{ id: 'hotkeys', entry: HotkeysPlugin }]}
    />
  );
}
```

You can also mix pre-registered (string) IDs with inline registration objects in the same array:

```tsx
plugins={['subtitle', { id: 'hotkeys', entry: HotkeysPlugin }]}
```

If you prefer to register plugins globally yourself (e.g. once at application start), pass string IDs as before:

```tsx
import Vlitejs from 'vlitejs';
import HotkeysPlugin from 'vlitejs/plugins/hotkeys';

// Register once at app startup
Vlitejs.registerPlugin('hotkeys', HotkeysPlugin);

function App() {
  return (
    <VlitePlayer
      src="/video.mp4"
      plugins={['hotkeys']}
    />
  );
}
```

## Props

| Prop                  | Type                                    | Default    | Description                                                           |
| --------------------- | --------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `src`                 | `string`                                | —          | Media source URL (HTML5 providers)                                    |
| `videoId`             | `string`                                | —          | Video ID for external providers (YouTube, Vimeo, Dailymotion)         |
| `provider`            | `string \| VliteProviderRegistration`   | `'html5'`  | vlitejs provider name or inline registration object                   |
| `type`                | `'video' \| 'audio'`                    | `'video'`  | Media element type (HTML5 provider only)                              |
| `options`             | [`VliteOptions`](#vliteoptions)         | `{}`       | vlitejs player options                                                |
| `plugins`             | `(string \| VlitePluginRegistration)[]` | `[]`       | Plugin IDs or inline registration objects                             |
| `onReady`             | `(player: VlitePlayerType) => void`     | —          | Called when the player is ready; receives the player instance         |
| `onPlay`              | `(event: Event) => void`               | —          | Called when playback starts                                           |
| `onPause`             | `(event: Event) => void`               | —          | Called when playback is paused                                        |
| `onProgress`          | `(event: Event) => void`               | —          | Called periodically during media download                             |
| `onTimeUpdate`        | `(event: Event) => void`               | —          | Called when the current time changes                                  |
| `onVolumeChange`      | `(event: Event) => void`               | —          | Called when the volume changes                                        |
| `onSourceChange`      | `(event: Event) => void`               | —          | Called when the media source changes                                  |
| `onEnterFullscreen`   | `(event: Event) => void`               | —          | Called when the player enters fullscreen (video only)                 |
| `onExitFullscreen`    | `(event: Event) => void`               | —          | Called when the player exits fullscreen (video only)                  |
| `onEnded`             | `(event: Event) => void`               | —          | Called when playback ends                                             |
| `className`           | `string`                                | —          | CSS class name for the media element                                  |
| `style`               | `React.CSSProperties`                  | —          | Inline styles for the media element                                   |
| `ref`                 | `React.Ref<VliteInstance>`             | —          | Ref forwarded to the `Vlitejs` instance                               |

### VliteOptions

| Option            | Type              | Default  | Description                                               |
| ----------------- | ----------------- | -------- | --------------------------------------------------------- |
| `controls`        | `boolean`         | `true`   | Display the control bar (video only)                      |
| `autoplay`        | `boolean`         | `false`  | Enable autoplay                                           |
| `playPause`       | `boolean`         | `true`   | Display the play/pause button                             |
| `progressBar`     | `boolean`         | `true`   | Display the progress bar                                  |
| `time`            | `boolean`         | `true`   | Display the time indicator                                |
| `volume`          | `boolean`         | `true`   | Display the volume button                                 |
| `fullscreen`      | `boolean`         | `true`   | Display the fullscreen button (video only)                |
| `poster`          | `string \| null`  | `null`   | Video poster URL (video only)                             |
| `bigPlay`         | `boolean`         | `true`   | Display the big play button overlay (video only)          |
| `playsinline`     | `boolean`         | `true`   | Add the `playsinline` attribute (video only)              |
| `loop`            | `boolean`         | `false`  | Loop the media                                            |
| `muted`           | `boolean`         | `false`  | Mute the media (video only)                               |
| `autoHide`        | `boolean`         | `false`  | Auto-hide the control bar on inactivity (video only)      |
| `autoHideDelay`   | `number`          | `3000`   | Auto-hide delay in milliseconds (video only)              |
| `providerParams`  | `object`          | `{}`     | Override provider-specific embed parameters               |

### VliteProviderRegistration

| Field     | Type      | Required | Description                                                              |
| --------- | --------- | -------- | ------------------------------------------------------------------------ |
| `id`      | `string`  | ✓        | Provider identifier (e.g. `'youtube'`, `'vimeo'`, `'dailymotion'`)      |
| `entry`   | `any`     | ✓        | Provider factory function (see [vlitejs provider API][providers-readme]) |
| `options` | `unknown` | —        | Optional options forwarded to `Vlitejs.registerProvider`                 |

### VlitePluginRegistration

| Field     | Type      | Required | Description                                                          |
| --------- | --------- | -------- | -------------------------------------------------------------------- |
| `id`      | `string`  | ✓        | Plugin identifier (e.g. `'hotkeys'`, `'subtitle'`, `'pip'`)         |
| `entry`   | `any`     | ✓        | Plugin class (see [vlitejs plugin API][plugins-readme])              |
| `options` | `unknown` | —        | Optional options forwarded to `Vlitejs.registerPlugin`               |

[providers-readme]: https://github.com/vlitejs/vlite/blob/main/src/providers/README.md
[plugins-readme]: https://github.com/vlitejs/vlite/blob/main/src/plugins/README.md

## License

MIT
