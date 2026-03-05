import React from 'react';
import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { render } from '@testing-library/react';
import VlitePlayer from '../VlitePlayer';

type MockConfig = {
  onReady?: (player: object) => void;
};

// The default mock implementation (regular function so `new` works)
function defaultMockImpl(
  this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
  _element: Element,
  config: MockConfig = {},
) {
  this.player = {};
  this.container = document.createElement('div');
  this.destroy = vi.fn();
  config.onReady?.(this.player);
}

vi.mock('vlitejs', () => {
  // vi.fn() wrapping a regular function supports `new` and mockImplementationOnce
  const MockVlitejs = vi.fn(defaultMockImpl) as ReturnType<typeof vi.fn> & {
    registerProvider: ReturnType<typeof vi.fn>;
    registerPlugin: ReturnType<typeof vi.fn>;
  };
  MockVlitejs.registerProvider = vi.fn();
  MockVlitejs.registerPlugin = vi.fn();
  return { default: MockVlitejs };
});

import Vlitejs from 'vlitejs';
type MockVlitejsType = MockInstance & {
  registerProvider: ReturnType<typeof vi.fn>;
  registerPlugin: ReturnType<typeof vi.fn>;
};
const MockVlitejs = Vlitejs as unknown as MockVlitejsType;

beforeEach(() => {
  vi.clearAllMocks();
  // Restore the default implementation after each test
  MockVlitejs.mockImplementation(defaultMockImpl);
});

describe('VlitePlayer', () => {
  describe('element rendering', () => {
    it('renders a <video> element by default', () => {
      const { container } = render(<VlitePlayer src="/video.mp4" />);
      expect(container.querySelector('video')).toBeTruthy();
    });

    it('renders an <audio> element when type="audio"', () => {
      const { container } = render(<VlitePlayer src="/audio.mp3" type="audio" />);
      expect(container.querySelector('audio')).toBeTruthy();
    });

    it('renders a <div> element for external providers', () => {
      const { container } = render(
        <VlitePlayer provider="youtube" videoId="abc123" />,
      );
      const div = container.querySelector('div');
      expect(div).toBeTruthy();
      expect(div?.getAttribute('data-youtube-id')).toBe('abc123');
    });

    it('renders a <div> with data-vimeo-id for vimeo provider', () => {
      const { container } = render(
        <VlitePlayer provider="vimeo" videoId="xyz789" />,
      );
      const div = container.querySelector('div');
      expect(div?.getAttribute('data-vimeo-id')).toBe('xyz789');
    });

    it('forwards className and style to the media element', () => {
      const { container } = render(
        <VlitePlayer src="/video.mp4" className="my-player" style={{ width: 640 }} />,
      );
      const video = container.querySelector('video');
      expect(video?.className).toBe('my-player');
      expect(video?.style.width).toBe('640px');
    });

    it('sets src on the <video> element', () => {
      const { container } = render(<VlitePlayer src="/test.mp4" />);
      const video = container.querySelector('video');
      expect(video?.getAttribute('src')).toBe('/test.mp4');
    });
  });

  describe('vlitejs initialisation', () => {
    it('initialises Vlitejs with the media element', () => {
      render(<VlitePlayer src="/video.mp4" />);
      expect(MockVlitejs).toHaveBeenCalledTimes(1);
      const [element] = MockVlitejs.mock.calls[0] as [HTMLElement];
      expect(element.tagName).toBe('VIDEO');
    });

    it('passes provider and options to Vlitejs', () => {
      const options = { autoHide: true, muted: true };
      render(<VlitePlayer src="/video.mp4" options={options} provider="html5" />);
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { provider: string; options: unknown }];
      expect(config.provider).toBe('html5');
      expect(config.options).toEqual(options);
    });

    it('passes plugins to Vlitejs', () => {
      render(<VlitePlayer src="/video.mp4" plugins={['hotkeys']} />);
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { plugins: string[] }];
      expect(config.plugins).toEqual(['hotkeys']);
    });

    it('passes empty array when plugins prop is omitted', () => {
      render(<VlitePlayer src="/video.mp4" />);
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { plugins: string[] }];
      expect(config.plugins).toEqual([]);
    });
  });

  describe('inline provider registration', () => {
    it('calls Vlitejs.registerProvider when provider is an object', () => {
      const fakeEntry = vi.fn();
      render(<VlitePlayer videoId="abc" provider={{ id: 'youtube', entry: fakeEntry }} />);
      expect(MockVlitejs.registerProvider).toHaveBeenCalledWith('youtube', fakeEntry, undefined);
    });

    it('passes provider id to Vlitejs when provider is an object', () => {
      const fakeEntry = vi.fn();
      render(<VlitePlayer videoId="abc" provider={{ id: 'youtube', entry: fakeEntry }} />);
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { provider: string }];
      expect(config.provider).toBe('youtube');
    });

    it('renders the correct data attribute when provider is an object', () => {
      const fakeEntry = vi.fn();
      const { container } = render(
        <VlitePlayer videoId="abc123" provider={{ id: 'youtube', entry: fakeEntry }} />,
      );
      const div = container.querySelector('div');
      expect(div?.getAttribute('data-youtube-id')).toBe('abc123');
    });

    it('forwards provider options to Vlitejs.registerProvider', () => {
      const fakeEntry = vi.fn();
      const opts = { foo: 'bar' };
      render(<VlitePlayer videoId="abc" provider={{ id: 'youtube', entry: fakeEntry, options: opts }} />);
      expect(MockVlitejs.registerProvider).toHaveBeenCalledWith('youtube', fakeEntry, opts);
    });

    it('does not call Vlitejs.registerProvider when provider is a string', () => {
      render(<VlitePlayer src="/video.mp4" provider="html5" />);
      expect(MockVlitejs.registerProvider).not.toHaveBeenCalled();
    });
  });

  describe('inline plugin registration', () => {
    it('calls Vlitejs.registerPlugin when a plugin is an object', () => {
      const fakePlugin = vi.fn();
      render(<VlitePlayer src="/video.mp4" plugins={[{ id: 'hotkeys', entry: fakePlugin }]} />);
      expect(MockVlitejs.registerPlugin).toHaveBeenCalledWith('hotkeys', fakePlugin, undefined);
    });

    it('passes resolved plugin id to Vlitejs when plugin is an object', () => {
      const fakePlugin = vi.fn();
      render(<VlitePlayer src="/video.mp4" plugins={[{ id: 'hotkeys', entry: fakePlugin }]} />);
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { plugins: string[] }];
      expect(config.plugins).toEqual(['hotkeys']);
    });

    it('forwards plugin options to Vlitejs.registerPlugin', () => {
      const fakePlugin = vi.fn();
      const opts = { speed: 2 };
      render(<VlitePlayer src="/video.mp4" plugins={[{ id: 'hotkeys', entry: fakePlugin, options: opts }]} />);
      expect(MockVlitejs.registerPlugin).toHaveBeenCalledWith('hotkeys', fakePlugin, opts);
    });

    it('handles a mixed array of string and object plugins', () => {
      const fakePlugin = vi.fn();
      render(
        <VlitePlayer
          src="/video.mp4"
          plugins={['subtitle', { id: 'hotkeys', entry: fakePlugin }]}
        />,
      );
      const [, config] = MockVlitejs.mock.calls[0] as [HTMLElement, { plugins: string[] }];
      expect(config.plugins).toEqual(['subtitle', 'hotkeys']);
      expect(MockVlitejs.registerPlugin).toHaveBeenCalledTimes(1);
      expect(MockVlitejs.registerPlugin).toHaveBeenCalledWith('hotkeys', fakePlugin, undefined);
    });

    it('does not call Vlitejs.registerPlugin for string-only plugins', () => {
      render(<VlitePlayer src="/video.mp4" plugins={['subtitle']} />);
      expect(MockVlitejs.registerPlugin).not.toHaveBeenCalled();
    });
  });

  describe('onReady callback', () => {
    it('calls onReady when the player is ready', () => {
      const onReady = vi.fn();
      render(<VlitePlayer src="/video.mp4" onReady={onReady} />);
      expect(onReady).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handlers', () => {
    it('calls onPlay when a play event is dispatched on the container', () => {
      const onPlay = vi.fn();
      const testContainer = document.createElement('div');

      MockVlitejs.mockImplementationOnce(function (
        this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
        _el: Element,
        config: MockConfig = {},
      ) {
        this.player = {};
        this.container = testContainer;
        this.destroy = vi.fn();
        config.onReady?.(this.player);
      });

      render(<VlitePlayer src="/video.mp4" onPlay={onPlay} />);
      testContainer.dispatchEvent(new Event('play'));
      expect(onPlay).toHaveBeenCalledTimes(1);
    });

    it('calls onEnded when an ended event is dispatched on the container', () => {
      const onEnded = vi.fn();
      const testContainer = document.createElement('div');

      MockVlitejs.mockImplementationOnce(function (
        this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
        _el: Element,
        config: MockConfig = {},
      ) {
        this.player = {};
        this.container = testContainer;
        this.destroy = vi.fn();
        config.onReady?.(this.player);
      });

      render(<VlitePlayer src="/video.mp4" onEnded={onEnded} />);
      testContainer.dispatchEvent(new Event('ended'));
      expect(onEnded).toHaveBeenCalledTimes(1);
    });

    it('calls onPause when a pause event is dispatched', () => {
      const onPause = vi.fn();
      const testContainer = document.createElement('div');

      MockVlitejs.mockImplementationOnce(function (
        this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
        _el: Element,
        config: MockConfig = {},
      ) {
        this.player = {};
        this.container = testContainer;
        this.destroy = vi.fn();
        config.onReady?.(this.player);
      });

      render(<VlitePlayer src="/video.mp4" onPause={onPause} />);
      testContainer.dispatchEvent(new Event('pause'));
      expect(onPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('calls destroy() when the component unmounts', () => {
      const destroySpy = vi.fn();

      MockVlitejs.mockImplementationOnce(function (
        this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
        _el: Element,
        config: MockConfig = {},
      ) {
        this.player = {};
        this.container = document.createElement('div');
        this.destroy = destroySpy;
        config.onReady?.(this.player);
      });

      const { unmount } = render(<VlitePlayer src="/video.mp4" />);
      unmount();
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('removes event listeners when the component unmounts', () => {
      const testContainer = document.createElement('div');
      const removeEventListenerSpy = vi.spyOn(testContainer, 'removeEventListener');

      MockVlitejs.mockImplementationOnce(function (
        this: { player: object; container: HTMLElement; destroy: ReturnType<typeof vi.fn> },
        _el: Element,
        config: MockConfig = {},
      ) {
        this.player = {};
        this.container = testContainer;
        this.destroy = vi.fn();
        config.onReady?.(this.player);
      });

      const { unmount } = render(<VlitePlayer src="/video.mp4" onPlay={vi.fn()} />);
      unmount();
      // Should have removed the 'play' event listener (among others)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function));
    });
  });

  describe('ref forwarding', () => {
    it('exposes the vlitejs instance via ref after mount', () => {
      const ref = React.createRef<never>();
      render(<VlitePlayer src="/video.mp4" ref={ref} />);
      expect(ref.current).not.toBeNull();
    });

    it('clears the ref when the component unmounts', () => {
      const ref = React.createRef<never>();
      const { unmount } = render(<VlitePlayer src="/video.mp4" ref={ref} />);
      unmount();
      expect(ref.current).toBeNull();
    });
  });

  describe('rendering without errors', () => {
    it('renders without throwing', () => {
      expect(() => render(<VlitePlayer src="/video.mp4" />)).not.toThrow();
    });
  });
});

describe('exports', () => {
  it('exports VlitePlayer as named export', async () => {
    const mod = await import('../index');
    expect(mod.VlitePlayer).toBeDefined();
  });

  it('exports VlitePlayer as default export', async () => {
    const mod = await import('../index');
    expect(mod.default).toBeDefined();
  });
});
