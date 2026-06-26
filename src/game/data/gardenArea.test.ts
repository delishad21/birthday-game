import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';
import {
  GARDEN_PLANT_BLOCKING_SIZE,
  GARDEN_PLANT_DEPTH_UP_SHIFT,
  gardenFlooringPlacement,
  gardenPlantAssets,
  gardenPlantBlockingBodies,
  gardenPlantPlacements,
  getGardenPlantDepth,
} from './gardenArea';

describe('Garden area data', () => {
  it('places the flooring over the full Garden area', () => {
    expect(gardenFlooringPlacement).toEqual({
      x: areaCenters['toy-marshmallow'].x,
      y: areaCenters['toy-marshmallow'].y,
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
    });
  });

  it('defines all nine Garden plant assets', () => {
    expect(gardenPlantAssets).toEqual([
      { key: 'garden-plant-1', path: '/garden-area/plant1.png' },
      { key: 'garden-plant-2', path: '/garden-area/plant2.png' },
      { key: 'garden-plant-3', path: '/garden-area/plant3.png' },
      { key: 'garden-plant-4', path: '/garden-area/plant4.png' },
      { key: 'garden-plant-5', path: '/garden-area/plant5.png' },
      { key: 'garden-plant-6', path: '/garden-area/plant6.png' },
      { key: 'garden-plant-7', path: '/garden-area/plant7.png' },
      { key: 'garden-plant-8', path: '/garden-area/plant8.png' },
      { key: 'garden-plant-9', path: '/garden-area/plant9.png' },
    ]);
  });

  it('uses varied plant counts across species', () => {
    const counts = new Map(gardenPlantAssets.map((asset) => [asset.key, 0]));
    for (const placement of gardenPlantPlacements) {
      counts.set(placement.assetKey, (counts.get(placement.assetKey) ?? 0) + 1);
    }

    expect(gardenPlantPlacements.length).toBe(82);
    expect(Array.from(counts.values())).toEqual([12, 8, 10, 6, 14, 7, 9, 11, 5]);
  });

  it('places every plant on a brown soil bed', () => {
    const minCol = Math.floor((areaCenters['toy-marshmallow'].x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const minRow = Math.floor((areaCenters['toy-marshmallow'].y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const soilBeds = [
      { minCol: 5, maxCol: 18, minRow: 1, maxRow: 3 },
      { minCol: 2, maxCol: 3, minRow: 6, maxRow: 8 },
      { minCol: 21, maxCol: 22, minRow: 6, maxRow: 8 },
      { minCol: 4, maxCol: 10, minRow: 10, maxRow: 12 },
      { minCol: 14, maxCol: 20, minRow: 10, maxRow: 12 },
    ];
    const isInSoilBed = (localCol: number, localRow: number) =>
      soilBeds.some((bed) => localCol >= bed.minCol && localCol <= bed.maxCol && localRow >= bed.minRow && localRow <= bed.maxRow);

    expect(
      gardenPlantPlacements.every((plant) => isInSoilBed(plant.col - minCol, plant.row - minRow)),
    ).toBe(true);
  });

  it('fills each brown soil bed with irregular gaps instead of a rigid grid', () => {
    const minCol = Math.floor((areaCenters['toy-marshmallow'].x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const minRow = Math.floor((areaCenters['toy-marshmallow'].y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const positions = new Set<string>();

    for (const plant of gardenPlantPlacements) {
      positions.add(`${plant.col},${plant.row}`);
    }

    expect(positions.size).toBe(gardenPlantPlacements.length);
    const occupiedLocalCells = new Set(gardenPlantPlacements.map((plant) => `${plant.col - minCol},${plant.row - minRow}`));

    expect(gardenPlantPlacements.filter((plant) => plant.row - minRow <= 3).length).toBeGreaterThan(25);
    expect(gardenPlantPlacements.filter((plant) => plant.row - minRow >= 10).length).toBeGreaterThan(25);
    expect(occupiedLocalCells.has('5,1')).toBe(false);
    expect(occupiedLocalCells.has('18,3')).toBe(false);
    expect(occupiedLocalCells.has('10,12')).toBe(false);
  });

  it('uses natural plant image sizing with one-tile blocking bodies', () => {
    expect(GARDEN_PLANT_BLOCKING_SIZE).toBe(MAP_TILE_SIZE);
    expect(gardenPlantBlockingBodies).toHaveLength(gardenPlantPlacements.length);
    expect(
      gardenPlantBlockingBodies.every(
        (body, index) =>
          body.x === gardenPlantPlacements[index].col * MAP_TILE_SIZE + MAP_TILE_SIZE / 2 &&
          body.y === gardenPlantPlacements[index].row * MAP_TILE_SIZE + MAP_TILE_SIZE / 2 &&
          body.width === MAP_TILE_SIZE &&
          body.height === MAP_TILE_SIZE,
      ),
    ).toBe(true);
  });

  it('moves plant depth cutoffs up by 15 pixels', () => {
    expect(GARDEN_PLANT_DEPTH_UP_SHIFT).toBe(15);
    expect(getGardenPlantDepth(12)).toBe(13 * MAP_TILE_SIZE - 15);
  });
});
