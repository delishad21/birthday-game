import { getAlphaStripBlockingBodies, type AlphaStripRow } from './alphaCollision';
import { AREA_HEIGHT, AREA_WIDTH, MAP_WORLD_HEIGHT, areaCenters } from './mapLayout';

export const MEMORY_COLLISION_STRIP_HEIGHT = 8;
export const MEMORY_FLOORING_DEPTH_OFFSET = 1;
export const MEMORY_COLLECTIBLE_DEPTH = MAP_WORLD_HEIGHT + MEMORY_FLOORING_DEPTH_OFFSET + 1;

export const memoryAreaPlacement = {
  x: areaCenters['star-memories'].x,
  y: areaCenters['star-memories'].y,
  width: AREA_WIDTH,
  height: AREA_HEIGHT,
} as const;

export const memoryAreaAssets = {
  flooring: { key: 'memory-area-flooring', path: '/memory-area/Flooring.png' },
  hitbox: { key: 'memory-area-hitbox', path: '/memory-area/Flooring hitbox.png' },
} as const;

export const getMemoryFlooringHitboxBodiesFromAlpha = (
  rows: AlphaStripRow[],
  sourceSize: { width: number; height: number },
) => getAlphaStripBlockingBodies(memoryAreaPlacement, rows, sourceSize, MEMORY_COLLISION_STRIP_HEIGHT, 0);

export const isMemoryFlooringPointInsideAlpha = (
  worldX: number,
  worldY: number,
  rows: AlphaStripRow[],
  sourceSize: { width: number; height: number },
) => {
  const localX = ((worldX - (memoryAreaPlacement.x - memoryAreaPlacement.width / 2)) / memoryAreaPlacement.width) * sourceSize.width;
  const localY = ((worldY - (memoryAreaPlacement.y - memoryAreaPlacement.height / 2)) / memoryAreaPlacement.height) * sourceSize.height;
  const sourceRow = Math.floor(localY);
  const row = rows.find((candidate) => candidate.y === sourceRow);

  return row ? row.segments.some((segment) => localX >= segment.minX && localX <= segment.maxX + 1) : false;
};

export const getMemoryFlooringDepth = (playerY: number, isInsideFlooringAlpha: boolean) => {
  const shouldRenderBelowPlayer = isInsideFlooringAlpha || playerY > memoryAreaPlacement.y;

  return playerY + (shouldRenderBelowPlayer ? -MEMORY_FLOORING_DEPTH_OFFSET : MEMORY_FLOORING_DEPTH_OFFSET);
};

export const getMemoryCollectibleDepth = () => MEMORY_COLLECTIBLE_DEPTH;
