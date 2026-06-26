import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';
import {
  CAVE_COLLISION_STRIP_HEIGHT,
  caveAreaManifest,
  caveAreaOrigin,
  getCaveDepthForPlayerY,
  getCaveBlockingTiles,
  getCaveBlockingBodies,
  getCaveBlockingBodiesFromAlpha,
  getCaveLayerDepth,
  getCaveLayerWorldPlacement,
} from './caveArea';

describe('cave area', () => {
  it('targets the CaveGuide area with a 100px top overflow layer', () => {
    expect(caveAreaManifest.area).toBe('toy-bear');
    expect(caveAreaManifest.width).toBe(AREA_WIDTH);
    expect(caveAreaManifest.height).toBe(AREA_HEIGHT);
    expect(caveAreaManifest.layerHeight).toBe(AREA_HEIGHT + MAP_TILE_SIZE * 2);
    expect(caveAreaManifest.align).toBe('bottom');
    expect(caveAreaManifest.layers).toEqual([
      expect.objectContaining({ key: 'caveGuide-cave', file: 'Cave.png', render: 'sortable' }),
    ]);
  });

  it('bottom-aligns the cave image to the CaveGuide area', () => {
    expect(caveAreaOrigin).toEqual({
      x: areaCenters['toy-bear'].x - AREA_WIDTH / 2,
      y: areaCenters['toy-bear'].y - AREA_HEIGHT / 2,
    });
    expect(getCaveLayerWorldPlacement()).toEqual({
      x: areaCenters['toy-bear'].x,
      y: areaCenters['toy-bear'].y + AREA_HEIGHT / 2,
      width: AREA_WIDTH,
      height: AREA_HEIGHT + MAP_TILE_SIZE * 2,
    });
  });

  it('converts blocking tiles into one-tile world collision bodies', () => {
    const bodies = getCaveBlockingBodies();

    expect(bodies.length).toBeGreaterThan(0);
    expect(bodies.every((body) => body.width === MAP_TILE_SIZE && body.height === MAP_TILE_SIZE)).toBe(true);

    const firstTile = getCaveBlockingTiles(caveAreaManifest.layers[0])[0];
    expect(bodies[0]).toEqual({
      layerKey: 'caveGuide-cave',
      x: caveAreaOrigin.x + firstTile!.x * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      y: caveAreaOrigin.y + firstTile!.y * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      width: MAP_TILE_SIZE,
      height: MAP_TILE_SIZE,
    });
  });

  it('places sortable cave depth at the bottom of its blocking footprint', () => {
    const layer = caveAreaManifest.layers[0];
    const maxBlockingTileY = Math.max(...getCaveBlockingTiles(layer).map((tile) => tile.y));

    expect(getCaveLayerDepth(layer)).toBe(caveAreaOrigin.y + maxBlockingTileY * MAP_TILE_SIZE + MAP_TILE_SIZE);
  });

  it('keeps the cave in front only when the player is in the top three CaveGuide tiles', () => {
    const areaTop = areaCenters['toy-bear'].y - AREA_HEIGHT / 2;
    const caveDepth = getCaveLayerDepth(caveAreaManifest.layers[0]);

    expect(getCaveDepthForPlayerY(areaTop + MAP_TILE_SIZE * 3 - 1, caveDepth)).toBeGreaterThan(caveDepth);
    expect(getCaveDepthForPlayerY(areaTop + MAP_TILE_SIZE * 3, caveDepth)).toBeLessThan(caveDepth);
  });

  it('builds cave blockers from alpha while preserving the middle-bottom entrance', () => {
    const eastEdgeOpeningX = AREA_WIDTH - MAP_TILE_SIZE / 2;
    const centerRowY = AREA_HEIGHT / 2 + MAP_TILE_SIZE * 2;
    const middleBottomX = AREA_WIDTH / 2;
    const middleBottomY = AREA_HEIGHT + MAP_TILE_SIZE * 2 - CAVE_COLLISION_STRIP_HEIGHT / 2;
    const bodies = getCaveBlockingBodiesFromAlpha(
      [
        { y: 0, segments: [{ minX: 100, maxX: 299 }] },
        { y: centerRowY, segments: [{ minX: eastEdgeOpeningX - 25, maxX: eastEdgeOpeningX + 24 }] },
        { y: middleBottomY, segments: [{ minX: middleBottomX - 25, maxX: middleBottomX + 24 }] },
      ],
      { width: 1200, height: 850 },
      { minX: 100, minY: 0, maxX: 299, maxY: 839 },
    );

    expect(CAVE_COLLISION_STRIP_HEIGHT).toBe(8);
    expect(bodies).toContainEqual({
      layerKey: 'caveGuide-cave',
      x: caveAreaOrigin.x + 200,
      y: caveAreaOrigin.y - MAP_TILE_SIZE * 2 + CAVE_COLLISION_STRIP_HEIGHT / 2,
      width: 200,
      height: CAVE_COLLISION_STRIP_HEIGHT,
    });
    expect(bodies).not.toContainEqual({
      layerKey: 'caveGuide-cave',
      x: caveAreaOrigin.x + middleBottomX,
      y: caveAreaOrigin.y - MAP_TILE_SIZE * 2 + middleBottomY + CAVE_COLLISION_STRIP_HEIGHT / 2,
      width: 50,
      height: CAVE_COLLISION_STRIP_HEIGHT,
    });
    expect(bodies).toContainEqual({
      layerKey: 'caveGuide-cave',
      x: caveAreaOrigin.x + eastEdgeOpeningX,
      y: caveAreaOrigin.y - MAP_TILE_SIZE * 2 + centerRowY + CAVE_COLLISION_STRIP_HEIGHT / 2,
      width: 50,
      height: CAVE_COLLISION_STRIP_HEIGHT,
    });
  });

  it('adds one straight top cave blocker behind the tall cave image', () => {
    const bodies = getCaveBlockingBodiesFromAlpha(
      [{ y: 24, segments: [{ minX: 200, maxX: 600 }] }],
      { width: 1200, height: 850 },
      { minX: 200, minY: 24, maxX: 600, maxY: 400 },
    );

    expect(bodies[0]).toEqual({
      layerKey: 'caveGuide-cave-top',
      x: caveAreaOrigin.x + 400.5,
      y: caveAreaOrigin.y - MAP_TILE_SIZE * 2 + 24,
      width: 401,
      height: CAVE_COLLISION_STRIP_HEIGHT,
    });
  });
});
