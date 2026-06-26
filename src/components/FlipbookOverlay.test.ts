import { describe, expect, it } from 'vitest';
import { flipbooks, type FlipbookPage } from '../game/data/flipbooks';
import { restoreFlipbookOverlayFocus, resolveFlipbookOverlayContent, setFlipbookOverlayFocus } from './FlipbookOverlay';

describe('FlipbookOverlay content resolution', () => {
  it('uses manifest pages and title when event detail only provides a flipbook id', () => {
    const content = resolveFlipbookOverlayContent({ flipbookId: 'final' });

    expect(content.flipbookId).toBe('final');
    expect(content.title).toBe(flipbooks.final.title);
    expect(content.pages).toBe(flipbooks.final.pages);
    expect(content.finalNote).toBe(flipbooks.final.finalNote);
    expect('finalVideoPath' in content).toBe(false);
  });

  it('lets event detail override pages and title without mutating manifest data', () => {
    const customPages: FlipbookPage[] = [
      { id: 'custom', imagePath: '/custom.png', label: 'Custom page', description: 'Shown for this event only.' },
    ];

    const content = resolveFlipbookOverlayContent({ flipbookId: 'moments', pages: customPages, title: 'Custom Moments' });

    expect(content.title).toBe('Custom Moments');
    expect(content.pages).toBe(customPages);
    expect(flipbooks.moments.title).toBe('Star of Moments');
  });
});

describe('FlipbookOverlay focus management', () => {
  it('remembers the current focus, focuses the close button, and restores the previous focus', () => {
    const previousFocus = createFocusableElement();
    const closeButton = createFocusableElement();
    const panel = createFocusableElement();

    const rememberedFocus = setFlipbookOverlayFocus(previousFocus, panel, closeButton);
    restoreFlipbookOverlayFocus(rememberedFocus);

    expect(closeButton.focusCount).toBe(1);
    expect(panel.focusCount).toBe(0);
    expect(previousFocus.focusCount).toBe(1);
  });

  it('focuses the panel when there is no close button', () => {
    const previousFocus = createFocusableElement();
    const panel = createFocusableElement();

    setFlipbookOverlayFocus(previousFocus, panel, null);

    expect(panel.focusCount).toBe(1);
  });
});

const createFocusableElement = (): HTMLElement & { focusCount: number } => {
  const element = {
    focusCount: 0,
    focus() {
      this.focusCount += 1;
    },
  };

  return element as HTMLElement & { focusCount: number };
};
