import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, areaCenters } from './mapLayout';
import {
  FOOD_TABLETOP_DEPTH_OFFSET,
  FOOD_ON_TABLE_DEPTH_OFFSET,
  foodAreaAssets,
  foodAreaLayers,
  foodAreaPlacement,
  foodObjectAssets,
  getAlphaStripBlockingBodies,
  getFoodBlockingLayerDepth,
  FOOD_BLOCKING_DEPTH_UP_SHIFT,
  getPaddedFoodLayerPlacement,
} from './foodArea';

describe('food area data', () => {
  it('places the food flooring over the full food area', () => {
    expect(foodAreaPlacement).toEqual({
      x: areaCenters['star-food'].x,
      y: areaCenters['star-food'].y,
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
    });
  });

  it('defines the rebuilt food area scene layers', () => {
    expect(foodAreaLayers.map((layer) => ({ path: layer.path, blocksMovement: layer.blocksMovement }))).toEqual([
      { path: '/food-area/Flooring.png', blocksMovement: false },
      { path: '/food-area/Table.png', blocksMovement: true },
      { path: '/food-area/Round Table.png', blocksMovement: true },
      { path: '/food-area/BBQ Pit.png', blocksMovement: true },
      { path: '/food-area/Drink Box.png', blocksMovement: true },
      { path: '/food-area/Menu Left.png', blocksMovement: true },
      { path: '/food-area/Menu Right.png', blocksMovement: true },
      { path: '/food-area/Sauce.png', blocksMovement: true },
      { path: '/food-area/Tray.png', blocksMovement: true },
      { path: '/food-area/utencils.png', blocksMovement: true },
      { path: '/food-area/Seat Left.png', blocksMovement: false },
      { path: '/food-area/Seat Right.png', blocksMovement: false },
    ]);
  });

  it('defines food layers as render-only future collectible assets', () => {
    expect(foodObjectAssets.map((asset) => ({ path: asset.path, blocksMovement: asset.blocksMovement, croppedPath: asset.croppedPath }))).toEqual([
      { path: '/food-area/Food/Acai.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Acai.png' },
      { path: '/food-area/Food/Beef Bowl.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Beef Bowl.png' },
      { path: '/food-area/Food/Burger.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Burger.png' },
      { path: '/food-area/Food/Kakigori.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Kakigori.png' },
      { path: '/food-area/Food/Mala.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Mala.png' },
      { path: '/food-area/Food/Pizza.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Pizza.png' },
      { path: '/food-area/Food/Ramen.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Ramen.png' },
      { path: '/food-area/Food/Steak.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Steak.png' },
      { path: '/food-area/Food/Sushi.png', blocksMovement: false, croppedPath: '/food-area/food-cropped/Sushi.png' },
    ]);
  });

  it('renders padded layers centered on the full food area using scaled source bounds for depth', () => {
    expect(getPaddedFoodLayerPlacement({ minX: 100, minY: 120, maxX: 299, maxY: 319 }, { width: 1200, height: 751 })).toEqual({
      x: areaCenters['star-food'].x,
      y: areaCenters['star-food'].y,
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
      visibleBottomY: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (320 / 751) * AREA_HEIGHT,
    });
  });

  it('offsets tabletop accessory layers above normally y-sorted furniture', () => {
    const tabletopLayerPaths = new Set(['/food-area/Sauce.png', '/food-area/utencils.png']);
    const furnitureLayerPaths = new Set(['/food-area/Table.png', '/food-area/Round Table.png', '/food-area/BBQ Pit.png']);

    expect(FOOD_TABLETOP_DEPTH_OFFSET).toBeGreaterThan(0);
    expect(foodAreaLayers.filter((layer) => tabletopLayerPaths.has(layer.path)).map((layer) => layer.depthOffset)).toEqual([
      FOOD_TABLETOP_DEPTH_OFFSET,
      FOOD_TABLETOP_DEPTH_OFFSET,
    ]);
    expect(FOOD_ON_TABLE_DEPTH_OFFSET).toBeGreaterThan(0);
    expect(FOOD_ON_TABLE_DEPTH_OFFSET).toBeLessThan(FOOD_TABLETOP_DEPTH_OFFSET);
    expect(FOOD_ON_TABLE_DEPTH_OFFSET).toBeGreaterThan(15);
    expect(foodObjectAssets.every((asset) => asset.depthOffset === FOOD_ON_TABLE_DEPTH_OFFSET)).toBe(true);
    expect(foodAreaLayers.filter((layer) => furnitureLayerPaths.has(layer.path)).map((layer) => layer.depthOffset)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(foodAreaLayers.find((layer) => layer.path === '/food-area/Tray.png')?.depthOffset).toBeUndefined();
  });

  it('keeps seats below the player instead of y-sorting them', () => {
    expect(foodAreaLayers.filter((layer) => layer.path.includes('/Seat ')).map((layer) => layer.alwaysBelowPlayer)).toEqual([true, true]);
  });

  it('builds trimmed 8px alpha strip collision bodies for disconnected segments', () => {
    const rows = [
      { y: 0, segments: [{ minX: 10, maxX: 30 }] },
      { y: 8, segments: [{ minX: 8, maxX: 32 }, { minX: 80, maxX: 88 }] },
      { y: 16, segments: [{ minX: 6, maxX: 34 }] },
    ];

    expect(getAlphaStripBlockingBodies(rows, { width: 1200, height: 751 }, 8, 8)).toEqual([
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 20.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (12 / 751) * AREA_HEIGHT,
        width: 25,
        height: 8 * (AREA_HEIGHT / 751),
      },
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 84.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (12 / 751) * AREA_HEIGHT,
        width: 9,
        height: 8 * (AREA_HEIGHT / 751),
      },
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 20.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (20 / 751) * AREA_HEIGHT,
        width: 29,
        height: 8 * (AREA_HEIGHT / 751),
      },
    ]);
  });

  it('trims alpha strips relative to the first visible padded row', () => {
    const rows = [
      { y: 200, segments: [{ minX: 10, maxX: 30 }] },
      { y: 208, segments: [{ minX: 8, maxX: 32 }, { minX: 80, maxX: 88 }] },
      { y: 216, segments: [{ minX: 6, maxX: 34 }] },
    ];

    expect(getAlphaStripBlockingBodies(rows, { width: 1200, height: 751 }, 8, 8)).toEqual([
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 20.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (212 / 751) * AREA_HEIGHT,
        width: 25,
        height: 8 * (AREA_HEIGHT / 751),
      },
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 84.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (212 / 751) * AREA_HEIGHT,
        width: 9,
        height: 8 * (AREA_HEIGHT / 751),
      },
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 20.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (220 / 751) * AREA_HEIGHT,
        width: 29,
        height: 8 * (AREA_HEIGHT / 751),
      },
    ]);
  });

  it('clips alpha strip bodies from the exact visible top pixel', () => {
    const rows = [
      { y: 200, segments: [{ minX: 10, maxX: 30 }] },
      { y: 208, segments: [{ minX: 8, maxX: 32 }] },
    ];

    expect(getAlphaStripBlockingBodies(rows, { width: 1200, height: 751 }, 8, 8, 203)).toEqual([
      {
        x: areaCenters['star-food'].x - AREA_WIDTH / 2 + 20.5,
        y: areaCenters['star-food'].y - AREA_HEIGHT / 2 + (213.5 / 751) * AREA_HEIGHT,
        width: 25,
        height: 5 * (AREA_HEIGHT / 751),
      },
    ]);
  });

  it('sorts blocking layers at the player center that reaches their front collision edge', () => {
    expect(FOOD_BLOCKING_DEPTH_UP_SHIFT).toBe(15);
    expect(
      getFoodBlockingLayerDepth(
        [
          { x: 100, y: 200, width: 20, height: 8 },
          { x: 100, y: 212, width: 20, height: 8 },
        ],
        260,
        19.5,
        FOOD_BLOCKING_DEPTH_UP_SHIFT,
      ),
    ).toBe(181.5);
  });

  it('keeps food assets unique for Phaser texture keys', () => {
    const keys = [...foodAreaAssets.map((asset) => asset.key), ...foodObjectAssets.map((asset) => asset.key)];
    expect(new Set(keys).size).toBe(keys.length);
  });
});
