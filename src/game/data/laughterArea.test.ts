import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';
import {
  getLaughterBlockingBodies,
  getLaughterLayerDepth,
  getLaughterLayerWorldPlacement,
  LAUGHTER_DEPTH_UP_SHIFT,
  laughterAreaManifest,
  laughterAreaOrigin,
} from './laughterArea';

describe('laughter area rendering data', () => {
  it('bottom-aligns 850px layer images to the 750px area', () => {
    expect(laughterAreaOrigin).toEqual({
      x: areaCenters['star-laughter'].x - AREA_WIDTH / 2,
      y: areaCenters['star-laughter'].y - AREA_HEIGHT / 2,
    });
    expect(getLaughterLayerWorldPlacement()).toEqual({
      x: areaCenters['star-laughter'].x,
      y: areaCenters['star-laughter'].y + AREA_HEIGHT / 2,
      width: 1200,
      height: 850,
    });
  });

  it('converts blocking tiles into one-tile world collision bodies', () => {
    const bodies = getLaughterBlockingBodies();

    expect(bodies).toHaveLength(42);
    expect(bodies).toContainEqual({
      layerKey: 'laughter-top-fence',
      x: laughterAreaOrigin.x + 7 * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      y: laughterAreaOrigin.y + MAP_TILE_SIZE / 2,
      width: MAP_TILE_SIZE,
      height: MAP_TILE_SIZE,
    });
    expect(bodies).toContainEqual({
      layerKey: 'laughter-bottom-fence',
      x: laughterAreaOrigin.x + 16 * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      y: laughterAreaOrigin.y + 14 * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      width: MAP_TILE_SIZE,
      height: MAP_TILE_SIZE,
    });
    expect(bodies.some((body) => body.layerKey === 'laughter-balloon-2')).toBe(false);
    expect(bodies.some((body) => body.layerKey === 'laughter-right-fence')).toBe(false);
  });

  it('uses flooring depth below sortable prop layers', () => {
    const flooring = laughterAreaManifest.layers.find((layer) => layer.key === 'laughter-flooring');
    const bottomFence = laughterAreaManifest.layers.find((layer) => layer.key === 'laughter-bottom-fence');

    expect(flooring && getLaughterLayerDepth(flooring)).toBe(1);
    expect(bottomFence && getLaughterLayerDepth(bottomFence)).toBe(laughterAreaOrigin.y + 15 * MAP_TILE_SIZE - LAUGHTER_DEPTH_UP_SHIFT);
  });

  it('moves sortable layer depth cutoffs up by 15px from the player hitbox front', () => {
    const bottomFence = laughterAreaManifest.layers.find((layer) => layer.key === 'laughter-bottom-fence');

    expect(LAUGHTER_DEPTH_UP_SHIFT).toBe(15);
    expect(bottomFence && getLaughterLayerDepth(bottomFence, 19.5)).toBe(laughterAreaOrigin.y + 15 * MAP_TILE_SIZE - 19.5 - 15);
  });
});
