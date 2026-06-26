import { describe, expect, it } from 'vitest';
import {
  AREA_HEIGHT,
  AREA_TILE_HEIGHT,
  AREA_TILE_WIDTH,
  AREA_WIDTH,
  MAP_COLUMNS,
  MAP_ROWS,
  MAP_TILE_SIZE,
  MAP_WORLD_HEIGHT,
  MAP_WORLD_WIDTH,
  PATH_WIDTH_TILES,
  areaCenters,
  buildPathCells,
  pathCells,
  pathRoutes,
  spawnPosition,
  treeAssets,
  treePlacements,
  finalGiftPosition,
  finalGiftCollisionBody,
  finalArea,
  grassOverlayAssets,
  grassOverlayPlacements,
} from './mapLayout';

describe('map layout', () => {
  const pathCellKeys = new Set(pathCells.map((cell) => `${cell.col},${cell.row}`));
  const hasPath = (col: number, row: number) => pathCellKeys.has(`${col},${row}`);
  const getAreaBounds = (center: { x: number; y: number }) => ({
    minCol: Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE),
    maxCol: Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE),
    minRow: Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE),
    maxRow: Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE),
    centerCol: Math.floor(center.x / MAP_TILE_SIZE),
    centerRow: Math.floor(center.y / MAP_TILE_SIZE),
  });

  it('uses a 96 by 60 grid of 50px tiles', () => {
    expect(MAP_TILE_SIZE).toBe(50);
    expect(MAP_WORLD_WIDTH).toBe(4800);
    expect(MAP_WORLD_HEIGHT).toBe(3000);
    expect(MAP_COLUMNS).toBe(96);
    expect(MAP_ROWS).toBe(60);
  });

  it('sizes each area to nine times the previous 40-tile footprint', () => {
    expect(AREA_TILE_WIDTH * AREA_TILE_HEIGHT).toBe(360);
    expect(AREA_WIDTH).toBe(1200);
    expect(AREA_HEIGHT).toBe(750);
  });

  it('defines the six current memory areas', () => {
    expect(Object.keys(areaCenters)).toEqual([
      'star-laughter',
      'star-adventure',
      'star-food',
      'star-memories',
      'toy-bear',
      'toy-marshmallow',
    ]);
  });

  it('does not route paths through the removed fifth-star area', () => {
    const removedFifthStarArea = { x: 3740, y: 840, width: AREA_WIDTH, height: AREA_HEIGHT };
    const minCol = Math.floor((removedFifthStarArea.x - removedFifthStarArea.width / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((removedFifthStarArea.x + removedFifthStarArea.width / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((removedFifthStarArea.y - removedFifthStarArea.height / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((removedFifthStarArea.y + removedFifthStarArea.height / 2 - 1) / MAP_TILE_SIZE);

    expect(pathCells.some((cell) => cell.col >= minCol && cell.col <= maxCol && cell.row >= minRow && cell.row <= maxRow)).toBe(false);
  });

  it('keeps every named path segment orthogonal', () => {
    for (const route of pathRoutes) {
      for (let index = 0; index < route.waypoints.length - 1; index += 1) {
        const start = route.waypoints[index];
        const end = route.waypoints[index + 1];
        expect(start.col === end.col || start.row === end.row).toBe(true);
      }
    }
  });

  it('builds path cells inside the grid', () => {
    expect(pathCells.length).toBeGreaterThan(0);
    expect(pathCells.every((cell) => cell.col >= 0 && cell.row >= 0 && cell.col < MAP_COLUMNS && cell.row < MAP_ROWS)).toBe(true);
    expect(PATH_WIDTH_TILES).toBe(2);
    expect(buildPathCells([{ col: 10, row: 10 }, { col: 12, row: 10 }], 2)).toEqual([
      { col: 10, row: 10 },
      { col: 10, row: 11 },
      { col: 11, row: 10 },
      { col: 11, row: 11 },
      { col: 12, row: 10 },
      { col: 12, row: 11 },
    ]);
  });

  it('keeps Memory grass-based except center entrances and the bottom connector row', () => {
    const memory = getAreaBounds(areaCenters['star-memories']);
    const memoryPathCells = pathCells.filter(
      (cell) => cell.col >= memory.minCol && cell.col <= memory.maxCol && cell.row >= memory.minRow && cell.row <= memory.maxRow,
    );

    expect(memoryPathCells.length).toBeLessThan(AREA_TILE_WIDTH * 3);
    expect(
      memoryPathCells.every(
        (cell) =>
          cell.col === memory.centerCol ||
          cell.col === memory.centerCol + 1 ||
          cell.row === memory.maxRow,
      ),
    ).toBe(true);
    for (let row = memory.minRow; row <= memory.maxRow; row += 1) {
      expect(hasPath(memory.centerCol, row)).toBe(true);
      expect(hasPath(memory.centerCol + 1, row)).toBe(true);
    }
    expect(hasPath(memory.minCol + 2, memory.centerRow)).toBe(false);
    expect(hasPath(memory.maxCol - 2, memory.centerRow)).toBe(false);
  });

  it('wraps Memory with a two-tile-wide outer loop and bottom connector row', () => {
    const memory = getAreaBounds(areaCenters['star-memories']);

    for (let col = memory.minCol - 2; col <= memory.maxCol + 1; col += 1) {
      expect(hasPath(col, memory.minRow - 2)).toBe(true);
      expect(hasPath(col, memory.minRow - 1)).toBe(true);
      expect(hasPath(col, memory.maxRow + 1)).toBe(true);
      expect(hasPath(col, memory.maxRow)).toBe(true);
    }

    for (let row = memory.minRow - 2; row <= memory.maxRow + 1; row += 1) {
      expect(hasPath(memory.minCol - 2, row)).toBe(true);
      expect(hasPath(memory.minCol - 1, row)).toBe(true);
      expect(hasPath(memory.maxCol + 1, row)).toBe(true);
      expect(hasPath(memory.maxCol + 2, row)).toBe(true);
    }
  });

  it('routes around both sides of Memory and branches to cave, maze, food, and Garden', () => {
    const finalBounds = getAreaBounds(finalGiftPosition);
    const memory = getAreaBounds(areaCenters['star-memories']);
    const cave = getAreaBounds(areaCenters['toy-bear']);
    const adventure = getAreaBounds(areaCenters['star-adventure']);
    const food = getAreaBounds(areaCenters['star-food']);
    const garden = getAreaBounds(areaCenters['toy-marshmallow']);

    const spawnCol = Math.floor(spawnPosition.x / MAP_TILE_SIZE);
    for (let row = finalBounds.maxRow + 1; row <= memory.minRow - 1; row += 1) {
      expect(hasPath(spawnCol, row)).toBe(true);
    }
    expect(hasPath(memory.minCol - 2, memory.centerRow)).toBe(true);
    expect(hasPath(memory.minCol - 1, memory.centerRow)).toBe(true);
    expect(hasPath(memory.maxCol + 1, memory.centerRow)).toBe(true);
    expect(hasPath(memory.maxCol + 2, memory.centerRow)).toBe(true);

    expect(hasPath(cave.centerCol, cave.maxRow)).toBe(true);
    expect(hasPath(cave.centerCol + 1, cave.maxRow)).toBe(true);
    expect(hasPath(adventure.maxCol, adventure.centerRow)).toBe(true);
    expect(hasPath(adventure.maxCol, adventure.centerRow + 1)).toBe(true);
    expect(hasPath(adventure.maxCol + 1, adventure.centerRow)).toBe(true);
    expect(hasPath(food.minCol, food.centerRow)).toBe(true);
    expect(hasPath(food.minCol, food.centerRow + 1)).toBe(true);
    expect(hasPath(garden.minCol, garden.centerRow)).toBe(true);
    expect(hasPath(garden.minCol, garden.centerRow + 1)).toBe(true);
  });

  it('routes a two-wide path into the bottom-center cave entrance', () => {
    const cave = getAreaBounds(areaCenters['toy-bear']);
    const memory = getAreaBounds(areaCenters['star-memories']);

    expect(hasPath(memory.minCol - 2, cave.centerRow)).toBe(true);
    expect(hasPath(memory.minCol - 1, cave.centerRow)).toBe(true);
    for (let row = cave.centerRow; row <= cave.maxRow + 2; row += 1) {
      expect(hasPath(memory.minCol - 2, row)).toBe(true);
      expect(hasPath(memory.minCol - 1, row)).toBe(true);
    }
    for (let col = cave.centerCol; col <= memory.minCol - 1; col += 1) {
      expect(hasPath(col, cave.maxRow + 1)).toBe(true);
      expect(hasPath(col, cave.maxRow + 2)).toBe(true);
    }
    expect(hasPath(cave.centerCol, cave.maxRow)).toBe(true);
    expect(hasPath(cave.centerCol + 1, cave.maxRow)).toBe(true);
  });

  it('keeps the food connector two tiles wide until the food flooring', () => {
    const food = getAreaBounds(areaCenters['star-food']);
    const memory = getAreaBounds(areaCenters['star-memories']);

    for (let row = memory.maxRow + 1; row <= food.centerRow + 1; row += 1) {
      expect(hasPath(memory.maxCol + 1, row)).toBe(true);
      expect(hasPath(memory.maxCol + 2, row)).toBe(true);
    }

    for (let col = memory.maxCol + 3; col <= food.minCol; col += 1) {
      expect(hasPath(col, food.centerRow - 1)).toBe(false);
      expect(hasPath(col, food.centerRow)).toBe(true);
      expect(hasPath(col, food.centerRow + 1)).toBe(true);
      expect(hasPath(col, food.centerRow + 2)).toBe(false);
    }
  });

  it('connects the gift flooring to the main route from the bottom center', () => {
    const gift = getAreaBounds(finalGiftPosition);

    for (let row = gift.maxRow; row <= gift.maxRow + 4; row += 1) {
      expect(hasPath(gift.centerCol, row)).toBe(true);
      expect(hasPath(gift.centerCol + 1, row)).toBe(true);
    }
  });

  it('extends the right-side Laughter path about one third into the area', () => {
    const laughter = getAreaBounds(areaCenters['star-laughter']);
    const targetCol = laughter.maxCol - Math.floor(AREA_TILE_WIDTH / 3);

    expect(hasPath(laughter.maxCol, laughter.centerRow)).toBe(true);
    expect(hasPath(targetCol, laughter.centerRow)).toBe(true);
    expect(hasPath(targetCol - 2, laughter.centerRow)).toBe(false);
  });

  it('keeps path tiles outside the final area except the bottom-center gift connector', () => {
    const minCol = Math.floor((finalArea.x - finalArea.width / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((finalArea.x + finalArea.width / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((finalArea.y - finalArea.height / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((finalArea.y + finalArea.height / 2 - 1) / MAP_TILE_SIZE);
    const giftCenterCol = Math.floor(finalGiftPosition.x / MAP_TILE_SIZE);
    const allowedConnectorCells = new Set([`${giftCenterCol},${maxRow}`, `${giftCenterCol + 1},${maxRow}`]);

    for (let col = minCol; col <= maxCol; col += 1) {
      for (let row = minRow; row <= maxRow; row += 1) {
        expect(hasPath(col, row)).toBe(allowedConnectorCells.has(`${col},${row}`));
      }
    }
  });

  it('keeps the CaveGuide cave grass-based except for a bottom-center entrance', () => {
    const cave = getAreaBounds(areaCenters['toy-bear']);
    const cavePathCells = pathCells.filter(
      (cell) => cell.col >= cave.minCol && cell.col <= cave.maxCol && cell.row >= cave.minRow && cell.row <= cave.maxRow,
    );
    const cavePathCellKeys = new Set(cavePathCells.map((cell) => `${cell.col},${cell.row}`));

    expect(cavePathCells).toHaveLength(2);
    expect(cavePathCellKeys.has(`${cave.centerCol},${cave.maxRow}`)).toBe(true);
    expect(cavePathCellKeys.has(`${cave.centerCol + 1},${cave.maxRow}`)).toBe(true);
  });

  it('keeps Garden grass-based with a left-side route entrance', () => {
    const garden = getAreaBounds(areaCenters['toy-marshmallow']);
    const gardenPathCells = pathCells.filter(
      (cell) => cell.col >= garden.minCol && cell.col <= garden.maxCol && cell.row >= garden.minRow && cell.row <= garden.maxRow,
    );
    const gardenPathCellKeys = new Set(gardenPathCells.map((cell) => `${cell.col},${cell.row}`));

    expect(gardenPathCells).toHaveLength(2);
    expect(gardenPathCellKeys.has(`${garden.minCol},${garden.centerRow}`)).toBe(true);
    expect(gardenPathCellKeys.has(`${garden.minCol},${garden.centerRow + 1}`)).toBe(true);
  });

  it('keeps the food area grass-based instead of filling it with path tiles', () => {
    const minCol = Math.floor((areaCenters['star-food'].x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((areaCenters['star-food'].x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((areaCenters['star-food'].y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((areaCenters['star-food'].y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const foodPathCells = pathCells.filter((cell) => cell.col >= minCol && cell.col <= maxCol && cell.row >= minRow && cell.row <= maxRow);

    expect(foodPathCells.length).toBeLessThan(AREA_TILE_WIDTH * AREA_TILE_HEIGHT / 4);
  });

  it('keeps the adventure area custom with only a right-edge maze entrance', () => {
    const adventure = getAreaBounds(areaCenters['star-adventure']);
    const cave = getAreaBounds(areaCenters['toy-bear']);
    const memory = getAreaBounds(areaCenters['star-memories']);
    const adventurePathCells = pathCells.filter(
      (cell) =>
        cell.col >= adventure.minCol &&
        cell.col <= adventure.maxCol &&
        cell.row >= adventure.minRow &&
        cell.row <= adventure.maxRow,
    );
    const adventurePathCellKeys = new Set(adventurePathCells.map((cell) => `${cell.col},${cell.row}`));
    const allowedPathCellKeys = new Set([`${adventure.maxCol},${adventure.centerRow}`, `${adventure.maxCol},${adventure.centerRow + 1}`]);

    for (let col = cave.centerCol; col <= memory.minCol - 1; col += 1) {
      allowedPathCellKeys.add(`${col},${cave.maxRow + 1}`);
      allowedPathCellKeys.add(`${col},${cave.maxRow + 2}`);
    }

    expect(adventurePathCells).toHaveLength(allowedPathCellKeys.size);
    expect(adventurePathCells.every((cell) => allowedPathCellKeys.has(`${cell.col},${cell.row}`))).toBe(true);
    expect(adventurePathCellKeys.has(`${adventure.maxCol},${adventure.centerRow}`)).toBe(true);
    expect(adventurePathCellKeys.has(`${adventure.maxCol},${adventure.centerRow + 1}`)).toBe(true);
  });

  it('removes generated artifacts from the full Adventure rectangle', () => {
    const center = areaCenters['star-adventure'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideAdventure = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;

    expect(treePlacements.some((tree) => isInsideAdventure(tree.col, tree.row))).toBe(false);
    expect(grassOverlayPlacements.some((prop) => isInsideAdventure(prop.col, prop.row))).toBe(false);
  });

  it('keeps a left-edge path entrance into the food area', () => {
    const food = getAreaBounds(areaCenters['star-food']);

    expect(hasPath(food.minCol, food.centerRow)).toBe(true);
    expect(hasPath(food.minCol, food.centerRow + 1)).toBe(true);
  });

  it('removes generated artifacts from the full Garden rectangle', () => {
    const center = areaCenters['toy-marshmallow'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideGarden = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;

    expect(treePlacements.some((tree) => isInsideGarden(tree.col, tree.row))).toBe(false);
    expect(grassOverlayPlacements.some((prop) => isInsideGarden(prop.col, prop.row))).toBe(false);
  });

  it('adds rocks and mushrooms around the CaveGuide cave area', () => {
    const center = areaCenters['toy-bear'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideCaveGuideArea = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
    const caveGuideProps = grassOverlayPlacements.filter((prop) => isInsideCaveGuideArea(prop.col, prop.row));

    expect(caveGuideProps.filter((prop) => prop.propType === 'rock').length).toBeGreaterThan(8);
    expect(caveGuideProps.filter((prop) => prop.propType === 'mushroom').length).toBeGreaterThan(8);
  });

  it('keeps generated trees out of the CaveGuide cave area', () => {
    const center = areaCenters['toy-bear'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideCaveGuideArea = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;

    expect(treePlacements.some((tree) => isInsideCaveGuideArea(tree.col, tree.row))).toBe(false);
  });

  it('uses only rocks from generated overlays inside the laughter area', () => {
    const center = areaCenters['star-laughter'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideLaughterArea = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
    const laughterProps = grassOverlayPlacements.filter((prop) => isInsideLaughterArea(prop.col, prop.row));

    expect(laughterProps.length).toBeGreaterThan(0);
    expect(laughterProps.every((prop) => prop.propType === 'rock')).toBe(true);
  });

  it('keeps generated trees out of the laughter area', () => {
    const center = areaCenters['star-laughter'];
    const minCol = Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE);
    const isInsideLaughterArea = (col: number, row: number) => col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;

    expect(treePlacements.some((tree) => isInsideLaughterArea(tree.col, tree.row))).toBe(false);
  });

  it('places spawn three tiles below the final gift at the top middle', () => {
    expect(spawnPosition.x).toBe(MAP_WORLD_WIDTH / 2);
    expect(finalGiftPosition.x).toBe(MAP_WORLD_WIDTH / 2);
    expect(finalGiftPosition.y).toBe(AREA_HEIGHT / 2);
    expect(spawnPosition).toEqual({
      x: finalGiftPosition.x,
      y: finalGiftPosition.y + MAP_TILE_SIZE * 3,
    });
  });

  it('defines one center tile of collision for the final gift', () => {
    expect(finalGiftCollisionBody).toEqual({
      x: finalGiftPosition.x,
      y: finalGiftPosition.y,
      width: 80,
      height: 80,
    });
  });

  it('sizes the final area like the other areas', () => {
    expect(finalArea).toEqual({ x: finalGiftPosition.x, y: finalGiftPosition.y, width: AREA_WIDTH, height: AREA_HEIGHT });
  });

  it('keeps the final area middle clear of generated trees and non-rock overlays', () => {
    const minCol = Math.floor((finalArea.x - finalArea.width / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((finalArea.x + finalArea.width / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((finalArea.y - finalArea.height / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((finalArea.y + finalArea.height / 2 - 1) / MAP_TILE_SIZE);
    const sideBandWidthTiles = 4;
    const isInsideFinalMiddle = (col: number, row: number) =>
      col >= minCol + sideBandWidthTiles && col <= maxCol - sideBandWidthTiles && row >= minRow && row <= maxRow;

    expect(treePlacements.some((tree) => isInsideFinalMiddle(tree.col, tree.row))).toBe(false);
    expect(grassOverlayPlacements.some((prop) => prop.propType !== 'rock' && isInsideFinalMiddle(prop.col, prop.row))).toBe(false);
  });

  it('allows generated decoration in the final area side bands', () => {
    const minCol = Math.floor((finalArea.x - finalArea.width / 2) / MAP_TILE_SIZE);
    const maxCol = Math.floor((finalArea.x + finalArea.width / 2 - 1) / MAP_TILE_SIZE);
    const minRow = Math.floor((finalArea.y - finalArea.height / 2) / MAP_TILE_SIZE);
    const maxRow = Math.floor((finalArea.y + finalArea.height / 2 - 1) / MAP_TILE_SIZE);
    const sideBandWidthTiles = 4;
    const isInsideFinalSideBand = (col: number, row: number) =>
      row >= minRow && row <= maxRow && ((col >= minCol && col < minCol + sideBandWidthTiles) || (col <= maxCol && col > maxCol - sideBandWidthTiles));

    expect(treePlacements.some((tree) => isInsideFinalSideBand(tree.col, tree.row))).toBe(true);
    expect(grassOverlayPlacements.some((prop) => prop.propType !== 'rock' && isInsideFinalSideBand(prop.col, prop.row))).toBe(true);
  });

  it('uses irregular area centers instead of a rigid grid', () => {
    const centers = Object.values(areaCenters);
    const uniqueX = new Set(centers.map((center) => center.x));
    const uniqueY = new Set(centers.map((center) => center.y));

    expect(uniqueX.size).toBeGreaterThan(4);
    expect(uniqueY.size).toBeGreaterThan(4);
    expect(areaCenters['star-memories'].x).not.toBe(MAP_WORLD_WIDTH / 2);
  });

  it('places trees only on grass cells inside the grid', () => {
    expect(treePlacements.length).toBeGreaterThanOrEqual(70);
    expect(
      treePlacements.every(
        (tree) =>
          tree.col >= 0 &&
          tree.row >= 0 &&
          tree.col < MAP_COLUMNS &&
          tree.row < MAP_ROWS &&
          !hasPath(tree.col, tree.row),
      ),
    ).toBe(true);
  });

  it('uses all three tree assets', () => {
    expect(treeAssets.map((asset) => asset.key)).toEqual(['pine-tree', 'small-tree', 'bushy-tree']);
    expect(new Set(treePlacements.map((tree) => tree.assetKey))).toEqual(new Set(['pine-tree', 'small-tree', 'bushy-tree']));
  });

  it('keeps memory areas clear of trees and non-rock decorative props', () => {
    const areaBounds = Object.entries(areaCenters)
      .filter(([id]) => id !== 'star-laughter' && id !== 'toy-bear' && id !== 'toy-marshmallow')
      .map(([, center]) => ({
        minCol: Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE),
        maxCol: Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE),
        minRow: Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE),
        maxRow: Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE),
      }));
    const isInsideArea = (col: number, row: number) =>
      areaBounds.some(
        (bounds) => col >= bounds.minCol && col <= bounds.maxCol && row >= bounds.minRow && row <= bounds.maxRow,
      );

    expect(treePlacements.some((tree) => isInsideArea(tree.col, tree.row))).toBe(false);
    expect(grassOverlayPlacements.some((prop) => prop.propType !== 'rock' && isInsideArea(prop.col, prop.row))).toBe(false);
    expect(grassOverlayPlacements.some((prop) => prop.propType === 'rock' && isInsideArea(prop.col, prop.row))).toBe(true);
  });

  it('defines ten decorative grass overlay assets', () => {
    expect(grassOverlayAssets.map((asset) => asset.key)).toEqual([
      'flower-cluster-a',
      'tall-grass-a',
      'rock-cluster',
      'path-bush',
      'flower-cluster-b',
      'tree-mushrooms',
      'tall-grass-b',
      'flower-cluster-c',
      'flower-cluster-d',
      'flower-cluster-e',
    ]);
  });

  it('places non-blocking overlays on walkable grass or path cells', () => {
    const treeCellKeys = new Set(treePlacements.map((tree) => `${tree.col},${tree.row}`));
    const spawnCellKey = `${Math.floor(spawnPosition.x / MAP_TILE_SIZE)},${Math.floor(spawnPosition.y / MAP_TILE_SIZE)}`;

    expect(grassOverlayPlacements.length).toBeGreaterThan(0);
    expect(
      grassOverlayPlacements.every(
        (grass) =>
          grass.col >= 0 &&
          grass.row >= 0 &&
          grass.col < MAP_COLUMNS &&
          grass.row < MAP_ROWS &&
          (grass.propType === 'rock' || grass.propType === 'bush' || !hasPath(grass.col, grass.row)) &&
          !treeCellKeys.has(`${grass.col},${grass.row}`) &&
          `${grass.col},${grass.row}` !== spawnCellKey,
      ),
    ).toBe(true);
  });

  it('makes tall grass the dominant non-blocking overlay at seventy percent opacity', () => {
    const tallGrass = grassOverlayPlacements.filter((placement) => placement.propType === 'tall-grass');
    const flowers = grassOverlayPlacements.filter((placement) => placement.propType === 'flower');

    expect(tallGrass.length).toBeGreaterThan(flowers.length);
    expect(new Set(tallGrass.map((placement) => placement.assetKey))).toEqual(new Set(['tall-grass-a', 'tall-grass-b']));
    expect(tallGrass.every((placement) => placement.alpha === 0.7 && placement.blocksMovement !== true)).toBe(true);
  });

  it('places blocking bushes along path sides with gaps and outside memory areas', () => {
    const areaBounds = Object.entries(areaCenters)
      .filter(([id]) => id !== 'star-laughter' && id !== 'toy-bear' && id !== 'toy-marshmallow')
      .map(([, center]) => ({
        minCol: Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE),
        maxCol: Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE),
        minRow: Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE),
        maxRow: Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE),
      }));
    const isPathAdjacent = (col: number, row: number) =>
      hasPath(col + 1, row) || hasPath(col - 1, row) || hasPath(col, row + 1) || hasPath(col, row - 1);
    const pathEdgeCells = new Set<string>();
    for (const pathCell of pathCells) {
      for (const neighbor of [
        { col: pathCell.col + 1, row: pathCell.row },
        { col: pathCell.col - 1, row: pathCell.row },
        { col: pathCell.col, row: pathCell.row + 1 },
        { col: pathCell.col, row: pathCell.row - 1 },
      ]) {
        if (
          neighbor.col >= 0 &&
          neighbor.row >= 0 &&
          neighbor.col < MAP_COLUMNS &&
          neighbor.row < MAP_ROWS &&
          !hasPath(neighbor.col, neighbor.row)
        ) {
          pathEdgeCells.add(`${neighbor.col},${neighbor.row}`);
        }
      }
    }
    const bushes = grassOverlayPlacements.filter((placement) => placement.propType === 'bush');

    expect(bushes.length).toBeGreaterThan(50);
    expect(bushes.length).toBeLessThan(pathEdgeCells.size * 0.75);
    expect(new Set(bushes.map((placement) => placement.assetKey))).toEqual(new Set(['path-bush']));
    expect(bushes.every((placement) => placement.blocksMovement === true && isPathAdjacent(placement.col, placement.row))).toBe(true);

    const memory = getAreaBounds(areaCenters['star-memories']);
    const bushesNearMemorySidePaths = bushes.filter(
      (placement) =>
        placement.row >= memory.minRow &&
        placement.row <= memory.maxRow + 1 &&
        (Math.abs(placement.col - (memory.minCol - 2)) <= 2 || Math.abs(placement.col - (memory.maxCol + 1)) <= 2),
    );

    expect(bushesNearMemorySidePaths.length).toBeGreaterThan(4);

    expect(
      bushes.every(
        (placement) =>
          !areaBounds.some(
            (bounds) =>
              placement.col >= bounds.minCol &&
              placement.col <= bounds.maxCol &&
              placement.row >= bounds.minRow &&
              placement.row <= bounds.maxRow,
          ),
      ),
    ).toBe(true);
  });

  it('clusters flowers, mushrooms, and rocks by role', () => {
    const flowers = grassOverlayPlacements.filter((placement) => placement.propType === 'flower');
    const mushrooms = grassOverlayPlacements.filter((placement) => placement.propType === 'mushroom');
    const rocks = grassOverlayPlacements.filter((placement) => placement.propType === 'rock');

    expect(new Set(flowers.map((placement) => placement.assetKey))).toEqual(
      new Set(['flower-cluster-a', 'flower-cluster-b', 'flower-cluster-c', 'flower-cluster-d', 'flower-cluster-e']),
    );
    expect(new Set(mushrooms.map((placement) => placement.assetKey))).toEqual(new Set(['tree-mushrooms']));
    expect(new Set(rocks.map((placement) => placement.assetKey))).toEqual(new Set(['rock-cluster']));
    expect(rocks.some((placement) => hasPath(placement.col, placement.row))).toBe(true);
    expect(rocks.some((placement) => !hasPath(placement.col, placement.row))).toBe(true);
    expect(flowers.length).toBeGreaterThan(40);
    expect(mushrooms.length).toBeGreaterThan(10);
    expect(rocks.length).toBeGreaterThan(10);
  });

  it('covers a lush but navigable portion of the map', () => {
    const areaBounds = Object.values(areaCenters).map((center) => ({
      minCol: Math.floor((center.x - AREA_WIDTH / 2) / MAP_TILE_SIZE),
      maxCol: Math.floor((center.x + AREA_WIDTH / 2 - 1) / MAP_TILE_SIZE),
      minRow: Math.floor((center.y - AREA_HEIGHT / 2) / MAP_TILE_SIZE),
      maxRow: Math.floor((center.y + AREA_HEIGHT / 2 - 1) / MAP_TILE_SIZE),
    }));
    const memoryAreaCells = new Set<string>();
    for (const bounds of areaBounds) {
      for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
        for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
          memoryAreaCells.add(`${col},${row}`);
        }
      }
    }
    const blocked = new Set([
      ...pathCells.map((cell) => `${cell.col},${cell.row}`),
      ...treePlacements.map((tree) => `${tree.col},${tree.row}`),
      ...memoryAreaCells,
      `${Math.floor(spawnPosition.x / MAP_TILE_SIZE)},${Math.floor(spawnPosition.y / MAP_TILE_SIZE)}`,
    ]);
    const eligibleGrassTiles = MAP_COLUMNS * MAP_ROWS - blocked.size;
    const outsidePathAndAreaPlacements = grassOverlayPlacements.filter((placement) => !blocked.has(`${placement.col},${placement.row}`));
    const coverage = outsidePathAndAreaPlacements.length / eligibleGrassTiles;

    expect(coverage).toBeGreaterThan(0.18);
    expect(coverage).toBeLessThan(0.35);
  });

  it('avoids robotic stripe-like decorative grass placement', () => {
    const placementsByRow = new Map<number, number>();
    for (const placement of grassOverlayPlacements) {
      placementsByRow.set(placement.row, (placementsByRow.get(placement.row) ?? 0) + 1);
    }

    const rowCounts = Array.from(placementsByRow.values());
    expect(new Set(rowCounts).size).toBeGreaterThan(6);

    const oldStripeMatches = grassOverlayPlacements.filter((placement) => (placement.col * 17 + placement.row * 31) % 5 === 0).length;
    expect(oldStripeMatches / grassOverlayPlacements.length).toBeLessThan(0.45);
  });
});
