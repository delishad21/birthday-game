import type { MemoryItem } from './data/memoryItems';

export interface CollectedCounts {
  stars: number;
  toys: number;
}

export const REQUIRED_MEMORY_STARS = 4;
export const REQUIRED_TOYS = 3;

export interface Point {
  x: number;
  y: number;
}

export function getCollectedCounts(items: MemoryItem[], collectedIds: Set<string>): CollectedCounts {
  return items.reduce<CollectedCounts>(
    (counts, item) => {
      if (!collectedIds.has(item.id)) {
        return counts;
      }

      if (item.category === 'star') {
        counts.stars += 1;
      } else if (item.category === 'toy') {
        counts.toys += 1;
      }

      return counts;
    },
    { stars: 0, toys: 0 },
  );
}

export function isFinalGiftUnlocked(counts: CollectedCounts) {
  return counts.stars === REQUIRED_MEMORY_STARS && counts.toys === REQUIRED_TOYS;
}

export function findNearbyUncollectedMemoryItem(
  items: MemoryItem[],
  collectedIds: Set<string>,
  playerPosition: Point,
  radius: number,
) {
  const radiusSquared = radius * radius;

  return items.find((item) => {
    if (collectedIds.has(item.id)) {
      return false;
    }

    const dx = item.x - playerPosition.x;
    const dy = item.y - playerPosition.y;

    return dx * dx + dy * dy <= radiusSquared;
  });
}
