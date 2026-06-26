import { describe, expect, it } from 'vitest';
import {
  arePhotosChronological,
  memoryPhotoAssets,
  pickMemoryPhotoRound,
  reorderPhotoIds,
  swapPhotoSlots,
  type MemoryPhotoAsset,
} from './memoryPhotoMinigame';

describe('memory photo minigame', () => {
  it('defines the available photos with display dates', () => {
    expect(memoryPhotoAssets).toHaveLength(6);
    expect(memoryPhotoAssets.find((photo) => photo.filename === 'memory-01.svg')?.date).toBe('2024-01-12');
    expect(memoryPhotoAssets.find((photo) => photo.filename === 'memory-06.svg')?.date).toBe('2025-04-18');
    expect(memoryPhotoAssets.every((photo) => photo.path.startsWith('/portfolio-media/memory-photos/'))).toBe(true);
  });

  it('picks 6 shuffled photos without duplicates for a round', () => {
    const picks = pickMemoryPhotoRound(memoryPhotoAssets, 6, () => 0.42);

    expect(picks).toHaveLength(6);
    expect(new Set(picks.map((photo) => photo.id)).size).toBe(6);
    expect(picks.every((photo) => memoryPhotoAssets.some((asset) => asset.id === photo.id))).toBe(true);
  });

  it('checks chronological order by selected photo dates', () => {
    const photos: MemoryPhotoAsset[] = [
      { id: 'old', filename: 'old.jpg', path: '/portfolio-media/memory-photos/old.jpg', date: '2022-05-15', displayDate: 'May 15, 2022' },
      { id: 'middle', filename: 'middle.jpg', path: '/portfolio-media/memory-photos/middle.jpg', date: '2024-11-02', displayDate: 'Nov 2, 2024' },
      { id: 'new', filename: 'new.jpg', path: '/portfolio-media/memory-photos/new.jpg', date: '2025-06-09', displayDate: 'Jun 9, 2025' },
    ];

    expect(arePhotosChronological(photos)).toBe(true);
    expect(arePhotosChronological([photos[1], photos[0], photos[2]])).toBe(false);
  });

  it('swaps two photo slots without mutating the original order', () => {
    const order = ['a', 'b', 'c', 'd'];

    expect(swapPhotoSlots(order, 1, 3)).toEqual(['a', 'd', 'c', 'b']);
    expect(order).toEqual(['a', 'b', 'c', 'd']);
  });

  it('moves a photo id into an insertion position without mutating the original order', () => {
    const order = ['a', 'b', 'c', 'd'];

    expect(reorderPhotoIds(order, 'b', 3)).toEqual(['a', 'c', 'd', 'b']);
    expect(reorderPhotoIds(order, 'd', 1)).toEqual(['a', 'd', 'b', 'c']);
    expect(order).toEqual(['a', 'b', 'c', 'd']);
  });
});
