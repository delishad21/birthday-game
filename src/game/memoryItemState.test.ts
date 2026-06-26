import { describe, expect, it } from 'vitest';
import type { MemoryItem } from './data/memoryItems';
import { findNearbyUncollectedMemoryItem, getCollectedCounts, isFinalGiftUnlocked } from './memoryItemState';

const items: MemoryItem[] = [
  {
    id: 'star-one',
    name: 'Star One',
    category: 'star',
    x: 10,
    y: 10,
    color: 0xffffff,
    promptText: 'Prompt',
    dialogueLines: ['Line'],
    collectedMessage: 'Collected',
  },
  {
    id: 'toy-one',
    name: 'Toy One',
    category: 'toy',
    x: 100,
    y: 100,
    color: 0xffffff,
    promptText: 'Prompt',
    dialogueLines: ['Line'],
    collectedMessage: 'Collected',
  },
  {
    id: 'easter-one',
    name: 'Easter Egg One',
    category: 'easter-egg',
    x: 200,
    y: 200,
    color: 0xffffff,
    promptText: 'Prompt',
    dialogueLines: ['Line'],
    collectedMessage: 'Collected',
  },
];

describe('memory item state helpers', () => {
  it('counts collected stars and Toys separately without counting easter eggs', () => {
    const counts = getCollectedCounts(items, new Set(['star-one', 'toy-one', 'easter-one']));

    expect(counts).toEqual({ stars: 1, toys: 1 });
  });

  it('finds a nearby uncollected item', () => {
    const item = findNearbyUncollectedMemoryItem(items, new Set(), { x: 12, y: 11 }, 24);

    expect(item?.id).toBe('star-one');
  });

  it('ignores collected and out-of-range items', () => {
    const item = findNearbyUncollectedMemoryItem(items, new Set(['star-one']), { x: 12, y: 11 }, 24);

    expect(item).toBeUndefined();
  });

  it('keeps the final gift locked until every objective is collected', () => {
    expect(isFinalGiftUnlocked({ stars: 3, toys: 3 })).toBe(false);
    expect(isFinalGiftUnlocked({ stars: 4, toys: 2 })).toBe(false);
  });

  it('unlocks the final gift after all Stars and Toys are collected', () => {
    expect(isFinalGiftUnlocked({ stars: 4, toys: 3 })).toBe(true);
  });
});
