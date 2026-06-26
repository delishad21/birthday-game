import { describe, expect, it } from 'vitest';
import memoryPhotoOverlaySource from './MemoryPhotoOverlay.tsx?raw';

describe('MemoryPhotoOverlay layout', () => {
  it('marks the visible timeline grid as a single-row layout', () => {
    expect(memoryPhotoOverlaySource).toContain('memory-photo-grid memory-photo-grid-single-row');
  });
});
