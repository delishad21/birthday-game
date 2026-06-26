import { describe, expect, it } from 'vitest';
import { createMomentFlipbookPages, flipbooks } from './flipbooks';
import { memoryPhotoAssets } from './memoryPhotoMinigame';

describe('flipbook manifests', () => {
  it('defines uploaded media and a final note for every flipbook section', () => {
    expect(Object.keys(flipbooks)).toEqual(['laughter', 'moments', 'food', 'adventure', 'final']);
    expect(flipbooks.laughter.pages[0]?.imagePath).toContain('/portfolio-media/flipbooks/');
    expect(flipbooks.laughter.pages).toHaveLength(4);
    expect(flipbooks.laughter.pages[0]).toEqual(expect.objectContaining({
      label: '[Title 1]',
      date: '[Date 1]',
      description: expect.stringContaining('laughter star'),
    }));
    expect(flipbooks.laughter.pages[1]).toEqual(expect.objectContaining({
      label: '[Title 2]',
      date: '[Date 2]',
      description: '[Description 2]',
    }));
    expect(flipbooks.moments.title).toBe('Star of Moments');
    expect(flipbooks.moments.pages[0]?.imagePath).toContain('/portfolio-media/flipbooks/');
    expect(flipbooks.moments.pages).toHaveLength(4);
    expect(flipbooks.moments.pages[0]?.description).toContain('moments star');
    expect(flipbooks.food.pages[0]?.imagePath).toContain('/portfolio-media/flipbooks/');
    expect(flipbooks.food.pages).toHaveLength(4);
    expect(flipbooks.food.pages[0]?.description).toContain('food star');
    expect(flipbooks.adventure.pages[0]?.imagePath).toContain('/portfolio-media/flipbooks/');
    expect(flipbooks.adventure.pages).toHaveLength(4);
    expect(flipbooks.adventure.pages[0]?.description).toContain('adventure star');
    expect(flipbooks.laughter.pages.map((page) => page.label)).toEqual(['[Title 1]', '[Title 2]', '[Title 3]', '[Title 4]']);
    expect(flipbooks.final.pages).toEqual([]);
    expect(flipbooks.final.finalNote?.body).toContain('portfolio edition');
  });

  it('builds Star of Moments pages from memory photo assets', () => {
    const pages = createMomentFlipbookPages(memoryPhotoAssets.slice(0, 2));

    expect(pages).toEqual([
      expect.objectContaining({
        id: memoryPhotoAssets[0].id,
        imagePath: memoryPhotoAssets[0].path,
        label: memoryPhotoAssets[0].label,
        date: memoryPhotoAssets[0].displayDate,
      }),
      expect.objectContaining({
        id: memoryPhotoAssets[1].id,
        imagePath: memoryPhotoAssets[1].path,
        label: memoryPhotoAssets[1].label,
        date: memoryPhotoAssets[1].displayDate,
      }),
    ]);
  });

  it('uses custom memory photo labels and descriptions when present', () => {
    const [page] = createMomentFlipbookPages([{
      id: 'photo.jpg',
      filename: 'photo.jpg',
      path: '/portfolio-media/memory-photos/photo.jpg',
      date: '2026-01-01',
      displayDate: 'Jan 1, 2026',
      label: 'A Better Label',
      description: 'A better description.',
    }]);

    expect(page.label).toBe('A Better Label');
    expect(page.description).toBe('A better description.');
  });
});
