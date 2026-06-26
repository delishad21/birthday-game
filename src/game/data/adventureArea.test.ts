import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, areaCenters } from './mapLayout';
import {
  ADVENTURE_MAZE_BOUNDS,
  ADVENTURE_MAZE_COLUMNS,
  ADVENTURE_MAZE_ENTRANCE_CELLS,
  ADVENTURE_MAZE_MATRIX,
  ADVENTURE_MAZE_ORIGIN,
  ADVENTURE_MAZE_ROWS,
  ADVENTURE_WALL_DEPTH_UP_SHIFT,
  ADVENTURE_WALL_HITBOX_SIZE,
  ADVENTURE_WALL_IMAGE_SIZE,
  adventureAreaAssets,
  adventureAreaPlacement,
  adventureMazeBlockingBodies,
  adventureMazeDestination,
  adventureMazeEntrance,
  adventureMazeOpenCells,
  adventureMazeRouteCheckpoints,
  adventureMazeWalls,
  getAdventureWallDepth,
} from './adventureArea';

const toCellKey = (cell: { col: number; row: number }) => `${cell.col},${cell.row}`;

const getMatrixOpenCellKeys = () =>
  new Set(
    ADVENTURE_MAZE_MATRIX.flatMap((row, rowIndex) =>
      [...row].flatMap((cell, colIndex) => (cell === '.' ? [`${colIndex},${rowIndex}`] : [])),
    ),
  );

describe('adventure area data', () => {
  it('places the adventure flooring over the full area', () => {
    expect(adventureAreaPlacement).toEqual({
      x: areaCenters['star-adventure'].x,
      y: areaCenters['star-adventure'].y,
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
    });
    expect(adventureAreaAssets.flooring).toEqual({
      key: 'adventure-area-flooring',
      path: '/adventure-area/flooring maze area.png',
    });
  });

  it('defines wall variants and grid dimensions', () => {
    expect(ADVENTURE_WALL_IMAGE_SIZE).toEqual({ width: 25, height: 35 });
    expect(ADVENTURE_WALL_HITBOX_SIZE).toEqual({ width: 25, height: 17 });
    expect(ADVENTURE_MAZE_BOUNDS).toEqual({ width: 1100, height: 646 });
    expect(ADVENTURE_MAZE_COLUMNS).toBe(44);
    expect(ADVENTURE_MAZE_ROWS).toBe(38);
    expect(ADVENTURE_MAZE_ORIGIN).toEqual({
      x: areaCenters['star-adventure'].x - ADVENTURE_MAZE_BOUNDS.width / 2,
      y: areaCenters['star-adventure'].y - ADVENTURE_MAZE_BOUNDS.height / 2,
    });
    expect(adventureAreaAssets.walls.map((asset) => asset.path)).toEqual([
      '/adventure-area/Wall 1.png',
      '/adventure-area/Wall 2.png',
      '/adventure-area/Wall 3.png',
    ]);
  });

  it('stores the pasted maze as a 44 by 38 dot/hash matrix', () => {
    expect(ADVENTURE_MAZE_MATRIX).toHaveLength(ADVENTURE_MAZE_ROWS);
    expect(ADVENTURE_MAZE_MATRIX.every((row) => row.length === ADVENTURE_MAZE_COLUMNS)).toBe(true);
    expect(ADVENTURE_MAZE_MATRIX.every((row) => /^[.#]+$/.test(row))).toBe(true);
  });

  it('keeps a right-side maze entrance and center destination', () => {
    expect(adventureMazeEntrance.x).toBe(areaCenters['star-adventure'].x + AREA_WIDTH / 2);
    expect(adventureMazeEntrance.y).toBe(areaCenters['star-adventure'].y);
    expect(adventureMazeDestination).toEqual(areaCenters['star-adventure']);
    expect(adventureMazeRouteCheckpoints.some((point) => point.x < areaCenters['star-adventure'].x - AREA_WIDTH / 3)).toBe(true);
  });

  it('defines grid wall cells with aligned blocker hitboxes', () => {
    const wallIds = new Set(adventureMazeWalls.map((wall) => wall.id));
    const wallCells = new Set(adventureMazeWalls.map((wall) => `${wall.col},${wall.row}`));

    expect(adventureMazeWalls.length).toBeGreaterThan(700);
    expect(wallIds.size).toBe(adventureMazeWalls.length);
    expect(wallCells.size).toBe(adventureMazeWalls.length);
    expect(adventureMazeBlockingBodies).toHaveLength(adventureMazeWalls.length);
    expect(adventureMazeWalls.every((wall) => wall.originX === 0.5 && wall.originY === 1)).toBe(true);
    for (const [index, wall] of adventureMazeWalls.entries()) {
      const body = adventureMazeBlockingBodies[index];
      const cellLeft = ADVENTURE_MAZE_ORIGIN.x + wall.col * ADVENTURE_WALL_HITBOX_SIZE.width;
      const cellTop = ADVENTURE_MAZE_ORIGIN.y + wall.row * ADVENTURE_WALL_HITBOX_SIZE.height;
      expect(wall.width).toBe(ADVENTURE_WALL_IMAGE_SIZE.width);
      expect(wall.height).toBe(ADVENTURE_WALL_IMAGE_SIZE.height);
      expect(wall.x).toBe(cellLeft + ADVENTURE_WALL_HITBOX_SIZE.width / 2);
      expect(wall.y).toBe(cellTop + ADVENTURE_WALL_HITBOX_SIZE.height);
      expect(body).toEqual({
        id: wall.id,
        x: wall.x,
        y: wall.y - ADVENTURE_WALL_HITBOX_SIZE.height / 2,
        width: ADVENTURE_WALL_HITBOX_SIZE.width,
        height: ADVENTURE_WALL_HITBOX_SIZE.height,
      });
    }
  });

  it('uses all wall variants deterministically', () => {
    expect(new Set(adventureMazeWalls.map((wall) => wall.assetKey))).toEqual(
      new Set(adventureAreaAssets.walls.map((asset) => asset.key)),
    );
  });

  it('sorts wall depth against the player hitbox front instead of the sprite bottom', () => {
    const wall = adventureMazeWalls[0];
    const playerDepthToHitboxFrontOffset = 19.5;
    const playerDepthWhenTouchingWallFromBelow = wall.y - playerDepthToHitboxFrontOffset;

    expect(ADVENTURE_WALL_DEPTH_UP_SHIFT).toBe(1);
    expect(getAdventureWallDepth(wall, playerDepthToHitboxFrontOffset)).toBe(
      wall.y - playerDepthToHitboxFrontOffset - ADVENTURE_WALL_DEPTH_UP_SHIFT,
    );
    expect(getAdventureWallDepth(wall, playerDepthToHitboxFrontOffset)).toBeLessThan(playerDepthWhenTouchingWallFromBelow);
  });

  it('leaves the entrance and center chamber free of wall blockers', () => {
    const entranceTop = adventureMazeEntrance.y - adventureMazeEntrance.height / 2;
    const entranceBottom = adventureMazeEntrance.y + adventureMazeEntrance.height / 2;
    const isInsideEntrance = (body: { x: number; y: number }) =>
      body.x > ADVENTURE_MAZE_ORIGIN.x + ADVENTURE_MAZE_BOUNDS.width - 125 && body.y >= entranceTop && body.y <= entranceBottom;
    const isNearDestination = (body: { x: number; y: number }) =>
      Math.abs(body.x - adventureMazeDestination.x) < 70 && Math.abs(body.y - adventureMazeDestination.y) < 70;

    expect(adventureMazeBlockingBodies.some(isInsideEntrance)).toBe(false);
    expect(adventureMazeBlockingBodies.some(isNearDestination)).toBe(false);
  });

  it('derives open cells from the pasted matrix plus the entrance carve', () => {
    const expectedOpenCells = getMatrixOpenCellKeys();
    for (const cell of ADVENTURE_MAZE_ENTRANCE_CELLS) {
      expectedOpenCells.add(toCellKey(cell));
    }

    expect(new Set(adventureMazeOpenCells.map(toCellKey))).toEqual(expectedOpenCells);
  });

  it('opens the center destination and carved right-side entrance', () => {
    const openCells = new Set(adventureMazeOpenCells.map(toCellKey));
    const centerCell = {
      col: Math.floor((adventureMazeDestination.x - ADVENTURE_MAZE_ORIGIN.x) / ADVENTURE_WALL_HITBOX_SIZE.width),
      row: Math.floor((adventureMazeDestination.y - ADVENTURE_MAZE_ORIGIN.y) / ADVENTURE_WALL_HITBOX_SIZE.height),
    };

    expect(openCells.has(toCellKey(centerCell))).toBe(true);
    expect(ADVENTURE_MAZE_ENTRANCE_CELLS).toEqual([
      { col: 43, row: 17 },
      { col: 43, row: 18 },
      { col: 43, row: 19 },
      { col: 43, row: 20 },
    ]);
    expect(ADVENTURE_MAZE_ENTRANCE_CELLS.every((cell) => openCells.has(toCellKey(cell)))).toBe(true);
    expect(adventureMazeEntrance.height).toBe(ADVENTURE_WALL_HITBOX_SIZE.height * 4);
  });
});
