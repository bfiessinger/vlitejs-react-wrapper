/**
 * Type declarations for vlitejs.
 * vlitejs does not ship with TypeScript types, so we declare them here.
 */
declare module 'vlitejs' {
  export interface VlitePlayerInstance {
    play(): void;
    pause(): void;
    setVolume(volume: number): void;
    getVolume(): Promise<number>;
    getCurrentTime(): Promise<number>;
    getDuration(): Promise<number>;
    mute(): void;
    unMute(): void;
    setSource(source: string): void;
    seekTo(time: number): void;
    requestFullscreen(): void;
    exitFullscreen(): void;
    getInstance(): unknown;
    loading(status: boolean): void;
    on(event: string, handler: (event: Event) => void): void;
    off(event: string, handler: (event: Event) => void): void;
    destroy(): void;
  }

  export interface VliteConfig {
    options?: Record<string, unknown>;
    onReady?: (player: VlitePlayerInstance) => void;
    provider?: string;
    plugins?: string[];
  }

  export default class Vlitejs {
    player: VlitePlayerInstance;
    container: HTMLElement;

    constructor(
      selector: string | HTMLElement,
      config?: VliteConfig,
    );

    destroy(): void;

    static registerProvider(
      id: string,
      provider: unknown,
      options?: unknown,
    ): void;

    static registerPlugin(
      id: string,
      plugin: unknown,
      options?: unknown,
    ): void;
  }
}
