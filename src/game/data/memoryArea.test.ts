import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, MAP_WORLD_HEIGHT, areaCenters } from './mapLayout';
import {
  MEMORY_COLLECTIBLE_DEPTH,
  MEMORY_COLLISION_STRIP_HEIGHT,
  MEMORY_FLOORING_DEPTH_OFFSET,
  memoryAreaAssets,
  memoryAreaPlacement,
  getMemoryCollectibleDepth,
  getMemoryFlooringDepth,
  getMemoryFlooringHitboxBodiesFromAlpha,
  isMemoryFlooringPointInsideAlpha,
} from './memoryArea';

describe('memory area data', () => {
  it('places the visible flooring over the full Memory area', () => {
    expect(memoryAreaPlacement).toEqual({
      x: areaCenters['star-memories'].x,
      y: areaCenters['star-memories'].y,
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
    });
    expect(memoryAreaAssets.flooring).toEqual({ key: 'memory-area-flooring', path: '/memory-area/Flooring.png' });
    expect(memoryAreaAssets.hitbox).toEqual({ key: 'memory-area-hitbox', path: '/memory-area/Flooring hitbox.png' });
  });

  it('builds collision bodies from hitbox alpha rows', () => {
    const bodies = getMemoryFlooringHitboxBodiesFromAlpha(
      [
        { y: 100, segments: [{ minX: 20, maxX: 29 }] },
        { y: 108, segments: [{ minX: 40, maxX: 49 }] },
      ],
      { width: 1200, height: 751 },
    );

    expect(MEMORY_COLLISION_STRIP_HEIGHT).toBe(8);
    expect(bodies).toEqual([
      {
        x: memoryAreaPlacement.x - AREA_WIDTH / 2 + 25,
        y: expect.closeTo(memoryAreaPlacement.y - AREA_HEIGHT / 2 + (104 / 751) * AREA_HEIGHT),
        width: 10,
        height: expect.closeTo(8 * (AREA_HEIGHT / 751)),
      },
      {
        x: memoryAreaPlacement.x - AREA_WIDTH / 2 + 45,
        y: expect.closeTo(memoryAreaPlacement.y - AREA_HEIGHT / 2 + (112 / 751) * AREA_HEIGHT),
        width: 10,
        height: expect.closeTo(8 * (AREA_HEIGHT / 751)),
      },
    ]);
  });

  it('detects whether a world point is inside visible flooring alpha', () => {
    const rows = [{ y: 100, segments: [{ minX: 20, maxX: 29 }] }];
    const sourceSize = { width: 1200, height: 751 };
    const insideX = memoryAreaPlacement.x - AREA_WIDTH / 2 + 25;
    const insideY = memoryAreaPlacement.y - AREA_HEIGHT / 2 + (100 / 751) * AREA_HEIGHT;
    const outsideX = memoryAreaPlacement.x - AREA_WIDTH / 2 + 35;

    expect(isMemoryFlooringPointInsideAlpha(insideX, insideY, rows, sourceSize)).toBe(true);
    expect(isMemoryFlooringPointInsideAlpha(outsideX, insideY, rows, sourceSize)).toBe(false);
  });

  it('does not treat transparent source rows in the same collision strip as visible flooring alpha', () => {
    const rows = [{ y: 100, segments: [{ minX: 20, maxX: 29 }] }];
    const sourceSize = { width: 1200, height: 751 };
    const insideX = memoryAreaPlacement.x - AREA_WIDTH / 2 + 25;
    const transparentRowY = memoryAreaPlacement.y - AREA_HEIGHT / 2 + (104 / 751) * AREA_HEIGHT;

    expect(isMemoryFlooringPointInsideAlpha(insideX, transparentRowY, rows, sourceSize)).toBe(false);
  });

  it('renders below the player when inside visible flooring alpha', () => {
    expect(MEMORY_FLOORING_DEPTH_OFFSET).toBe(1);
    expect(getMemoryFlooringDepth(memoryAreaPlacement.y - AREA_HEIGHT / 4, true)).toBe(memoryAreaPlacement.y - AREA_HEIGHT / 4 - 1);
  });

  it('renders below the player outside alpha after the vertical halfway point', () => {
    const playerY = memoryAreaPlacement.y + 1;

    expect(getMemoryFlooringDepth(playerY, false)).toBe(playerY - MEMORY_FLOORING_DEPTH_OFFSET);
  });

  it('renders above the player outside alpha before the vertical halfway point', () => {
    const playerY = memoryAreaPlacement.y - 1;

    expect(getMemoryFlooringDepth(playerY, false)).toBe(playerY + MEMORY_FLOORING_DEPTH_OFFSET);
  });

  it('keeps Memory collectibles above the maximum dynamic flooring depth', () => {
    expect(MEMORY_COLLECTIBLE_DEPTH).toBe(MAP_WORLD_HEIGHT + MEMORY_FLOORING_DEPTH_OFFSET + 1);
    expect(getMemoryCollectibleDepth() - 1).toBeGreaterThan(getMemoryFlooringDepth(MAP_WORLD_HEIGHT, true));
  });
});
