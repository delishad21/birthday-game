export const MAP_TILE_SIZE = 50;
export const MAP_WORLD_WIDTH = 4800;
export const MAP_WORLD_HEIGHT = 3000;
export const MAP_COLUMNS = MAP_WORLD_WIDTH / MAP_TILE_SIZE;
export const MAP_ROWS = MAP_WORLD_HEIGHT / MAP_TILE_SIZE;
export const AREA_TILE_WIDTH = 24;
export const AREA_TILE_HEIGHT = 15;
export const AREA_WIDTH = AREA_TILE_WIDTH * MAP_TILE_SIZE;
export const AREA_HEIGHT = AREA_TILE_HEIGHT * MAP_TILE_SIZE;
export const PATH_WIDTH_TILES = 2;

export type GridPoint = { col: number; row: number };
export type PathCell = GridPoint;

export const areaCenters = {
  'star-laughter': { x: 940, y: 760 },
  'star-adventure': { x: 1160, y: 2380 },
  'star-food': { x: 3620, y: 2290 },
  'star-memories': { x: 2220, y: 1560 },
  'toy-bear': { x: 760, y: 1590 },
  'toy-marshmallow': { x: 3970, y: 1530 },
} as const;

export const finalGiftPosition = { x: MAP_WORLD_WIDTH / 2, y: AREA_HEIGHT / 2 } as const;
export const spawnPosition = { x: finalGiftPosition.x, y: finalGiftPosition.y + MAP_TILE_SIZE * 3 } as const;
export const finalGiftCollisionBody = {
  x: finalGiftPosition.x,
  y: finalGiftPosition.y,
  width: 80,
  height: 80,
} as const;
export const finalArea = { x: finalGiftPosition.x, y: finalGiftPosition.y, width: AREA_WIDTH, height: AREA_HEIGHT } as const;
const laughterArea = { x: areaCenters['star-laughter'].x, y: areaCenters['star-laughter'].y, width: AREA_WIDTH, height: AREA_HEIGHT } as const;
const adventureArea = { x: areaCenters['star-adventure'].x, y: areaCenters['star-adventure'].y, width: AREA_WIDTH, height: AREA_HEIGHT } as const;
const foodArea = { x: areaCenters['star-food'].x, y: areaCenters['star-food'].y, width: AREA_WIDTH, height: AREA_HEIGHT } as const;

const keyForCell = (cell: PathCell) => `${cell.col},${cell.row}`;

export const buildPathCells = (waypoints: GridPoint[], widthInTiles = PATH_WIDTH_TILES): PathCell[] => {
  const cells = new Map<string, PathCell>();
  const offsets = Array.from({ length: widthInTiles }, (_, index) => index - Math.floor((widthInTiles - 1) / 2));

  const addCell = (col: number, row: number) => {
    if (col < 0 || row < 0 || col >= MAP_COLUMNS || row >= MAP_ROWS) {
      return;
    }

    const cell = { col, row };
    cells.set(keyForCell(cell), cell);
  };

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const start = waypoints[index];
    const end = waypoints[index + 1];

    if (start.col !== end.col && start.row !== end.row) {
      throw new Error('Path segments must be orthogonal.');
    }

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    for (let col = minCol; col <= maxCol; col += 1) {
      for (let row = minRow; row <= maxRow; row += 1) {
        for (const offset of offsets) {
          if (start.row === end.row) {
            addCell(col, row + offset);
          } else {
            addCell(col + offset, row);
          }
        }
      }
    }
  }

  return Array.from(cells.values());
};

const buildAreaCells = (area: { x: number; y: number; width: number; height: number }): PathCell[] => {
  const cells: PathCell[] = [];
  const minCol = Math.floor((area.x - area.width / 2) / MAP_TILE_SIZE);
  const maxCol = Math.floor((area.x + area.width / 2 - 1) / MAP_TILE_SIZE);
  const minRow = Math.floor((area.y - area.height / 2) / MAP_TILE_SIZE);
  const maxRow = Math.floor((area.y + area.height / 2 - 1) / MAP_TILE_SIZE);

  for (let col = minCol; col <= maxCol; col += 1) {
    for (let row = minRow; row <= maxRow; row += 1) {
      if (col >= 0 && row >= 0 && col < MAP_COLUMNS && row < MAP_ROWS) {
        cells.push({ col, row });
      }
    }
  }

  return cells;
};

const isInsideArea = (cell: PathCell, area: { x: number; y: number; width: number; height: number }) => {
  const minCol = Math.floor((area.x - area.width / 2) / MAP_TILE_SIZE);
  const maxCol = Math.floor((area.x + area.width / 2 - 1) / MAP_TILE_SIZE);
  const minRow = Math.floor((area.y - area.height / 2) / MAP_TILE_SIZE);
  const maxRow = Math.floor((area.y + area.height / 2 - 1) / MAP_TILE_SIZE);
  return cell.col >= minCol && cell.col <= maxCol && cell.row >= minRow && cell.row <= maxRow;
};

const getAreaBounds = (area: { x: number; y: number; width: number; height: number }) => ({
  minCol: Math.floor((area.x - area.width / 2) / MAP_TILE_SIZE),
  maxCol: Math.floor((area.x + area.width / 2 - 1) / MAP_TILE_SIZE),
  minRow: Math.floor((area.y - area.height / 2) / MAP_TILE_SIZE),
  maxRow: Math.floor((area.y + area.height / 2 - 1) / MAP_TILE_SIZE),
  centerCol: Math.floor(area.x / MAP_TILE_SIZE),
  centerRow: Math.floor(area.y / MAP_TILE_SIZE),
});

const toArea = (center: { x: number; y: number }) => ({ x: center.x, y: center.y, width: AREA_WIDTH, height: AREA_HEIGHT });

const memoryArea = toArea(areaCenters['star-memories']);
const gardenArea = toArea(areaCenters['toy-marshmallow']);
const caveGuideArea = toArea(areaCenters['toy-bear']);

const memoryBounds = getAreaBounds(memoryArea);
const finalBounds = getAreaBounds(finalArea);
const laughterBounds = getAreaBounds(laughterArea);
const adventureBounds = getAreaBounds(adventureArea);
const foodBounds = getAreaBounds(foodArea);
const gardenBounds = getAreaBounds(gardenArea);
const caveGuideBounds = getAreaBounds(caveGuideArea);

const customAreaClearings = [memoryArea];

export interface PathRoute {
  name: string;
  waypoints: GridPoint[];
  width?: number;
}

export const mainMemoryRoute: GridPoint[] = [
  { col: Math.floor(spawnPosition.x / MAP_TILE_SIZE), row: finalBounds.maxRow + 1 },
  { col: Math.floor(spawnPosition.x / MAP_TILE_SIZE), row: memoryBounds.minRow - 2 },
  { col: memoryBounds.centerCol, row: memoryBounds.minRow - 2 },
  { col: memoryBounds.centerCol, row: memoryBounds.maxRow + 1 },
];

export const laughterInteriorRoute: GridPoint[] = [
  { col: Math.floor(spawnPosition.x / MAP_TILE_SIZE), row: laughterBounds.centerRow },
  { col: laughterBounds.maxCol + 1, row: laughterBounds.centerRow },
  { col: laughterBounds.maxCol - Math.floor(AREA_TILE_WIDTH / 3), row: laughterBounds.centerRow },
];

export const memoryLeftSideRoute: GridPoint[] = [
  { col: memoryBounds.minCol - 2, row: memoryBounds.minRow - 2 },
  { col: memoryBounds.minCol - 2, row: memoryBounds.maxRow + 1 },
];

export const memoryRightSideRoute: GridPoint[] = [
  { col: memoryBounds.maxCol + 1, row: memoryBounds.minRow - 2 },
  { col: memoryBounds.maxCol + 1, row: foodBounds.centerRow },
];

export const memoryTopConnectorRoute: GridPoint[] = [
  { col: memoryBounds.minCol - 2, row: memoryBounds.minRow - 2 },
  { col: memoryBounds.maxCol + 1, row: memoryBounds.minRow - 2 },
];

export const memoryBottomConnectorRoute: GridPoint[] = [
  { col: memoryBounds.minCol - 2, row: memoryBounds.maxRow },
  { col: memoryBounds.maxCol + 1, row: memoryBounds.maxRow },
];

export const caveBranchRoute: GridPoint[] = [
  { col: memoryBounds.minCol - 2, row: caveGuideBounds.centerRow },
  { col: memoryBounds.minCol - 2, row: caveGuideBounds.maxRow + 2 },
  { col: memoryBounds.minCol - 2, row: caveGuideBounds.maxRow + 1 },
  { col: memoryBounds.minCol - 1, row: caveGuideBounds.maxRow + 1 },
  { col: caveGuideBounds.centerCol, row: caveGuideBounds.maxRow + 1 },
];

export const adventureBranchRoute: GridPoint[] = [
  { col: adventureBounds.maxCol + 1, row: memoryBounds.maxRow + 1 },
  { col: adventureBounds.maxCol + 1, row: adventureBounds.centerRow },
];

export const foodBranchRoute: GridPoint[] = [
  { col: memoryBounds.maxCol + 1, row: foodBounds.centerRow },
  { col: foodBounds.minCol + 5, row: foodBounds.centerRow },
];

export const gardenBranchRoute: GridPoint[] = [
  { col: memoryBounds.maxCol + 1, row: gardenBounds.centerRow },
  { col: gardenBounds.minCol - 1, row: gardenBounds.centerRow },
];

export const giftConnectorRoute: GridPoint[] = [
  { col: finalBounds.centerCol, row: finalBounds.maxRow },
  { col: finalBounds.centerCol, row: finalBounds.maxRow + 4 },
];

export const pathRoutes: PathRoute[] = [
  { name: 'main-memory', waypoints: mainMemoryRoute },
  { name: 'laughter-interior', waypoints: laughterInteriorRoute },
  { name: 'memory-left-side', waypoints: memoryLeftSideRoute },
  { name: 'memory-right-side', waypoints: memoryRightSideRoute },
  { name: 'memory-top-connector', waypoints: memoryTopConnectorRoute },
  { name: 'memory-bottom-connector', waypoints: memoryBottomConnectorRoute },
  { name: 'cave-branch', waypoints: caveBranchRoute },
  { name: 'adventure-branch', waypoints: adventureBranchRoute },
  { name: 'food-branch', waypoints: foodBranchRoute },
  { name: 'garden-branch', waypoints: gardenBranchRoute },
  { name: 'gift-connector', waypoints: giftConnectorRoute },
];

const adventureEntranceCells: PathCell[] = [
  { col: adventureBounds.maxCol, row: adventureBounds.centerRow },
  { col: adventureBounds.maxCol, row: adventureBounds.centerRow + 1 },
];

const foodEntranceCells: PathCell[] = [
  { col: foodBounds.minCol, row: foodBounds.centerRow },
  { col: foodBounds.minCol, row: foodBounds.centerRow + 1 },
];

const gardenEntranceCells: PathCell[] = [
  { col: gardenBounds.minCol, row: gardenBounds.centerRow },
  { col: gardenBounds.minCol, row: gardenBounds.centerRow + 1 },
];

const caveEntranceCells: PathCell[] = [
  { col: caveGuideBounds.centerCol, row: caveGuideBounds.maxRow },
  { col: caveGuideBounds.centerCol + 1, row: caveGuideBounds.maxRow },
];

export const pathCells = Array.from(
  [
    ...pathRoutes.flatMap((route) => buildPathCells(route.waypoints, route.width ?? PATH_WIDTH_TILES)),
    ...adventureEntranceCells,
    ...foodEntranceCells,
    ...gardenEntranceCells,
    ...caveEntranceCells,
  ]
    .reduce((cells, cell) => cells.set(keyForCell(cell), cell), new Map<string, PathCell>())
    .values(),
);
const pathCellKeys = new Set(pathCells.map((cell) => keyForCell(cell)));
const spawnCellKey = keyForCell({ col: Math.floor(spawnPosition.x / MAP_TILE_SIZE), row: Math.floor(spawnPosition.y / MAP_TILE_SIZE) });

const getTileNoise = (col: number, row: number, seed: number) => {
  let value = col * 374761393 + row * 668265263 + seed * 982451653;
  value = (value ^ (value >>> 13)) * 1274126177;
  value = value ^ (value >>> 16);
  return (value >>> 0) / 4294967295;
};

const isInsideClearedArea = (cell: PathCell) => customAreaClearings.some((area) => isInsideArea(cell, area));

const FINAL_AREA_SIDE_BAND_WIDTH_TILES = 4;

const isInsideFinalArea = (cell: PathCell) => isInsideArea(cell, finalArea);

const isInsideFinalSideBand = (cell: PathCell) => {
  const minCol = Math.floor((finalArea.x - finalArea.width / 2) / MAP_TILE_SIZE);
  const maxCol = Math.floor((finalArea.x + finalArea.width / 2 - 1) / MAP_TILE_SIZE);
  const minRow = Math.floor((finalArea.y - finalArea.height / 2) / MAP_TILE_SIZE);
  const maxRow = Math.floor((finalArea.y + finalArea.height / 2 - 1) / MAP_TILE_SIZE);
  return (
    cell.row >= minRow &&
    cell.row <= maxRow &&
    ((cell.col >= minCol && cell.col < minCol + FINAL_AREA_SIDE_BAND_WIDTH_TILES) ||
      (cell.col <= maxCol && cell.col > maxCol - FINAL_AREA_SIDE_BAND_WIDTH_TILES))
  );
};

const isInsideGrid = (cell: PathCell) => cell.col >= 0 && cell.row >= 0 && cell.col < MAP_COLUMNS && cell.row < MAP_ROWS;

export type TreeAssetKey = 'pine-tree' | 'small-tree' | 'bushy-tree';

export const treeAssets: Array<{ key: TreeAssetKey; path: string }> = [
  { key: 'pine-tree', path: '/pine-tree.png' },
  { key: 'small-tree', path: '/small-tree.png' },
  { key: 'bushy-tree', path: '/bushy tree.png' },
];

export interface TreePlacement extends PathCell {
  assetKey: TreeAssetKey;
}

const treeAssetKeys: TreeAssetKey[] = ['pine-tree', 'small-tree', 'bushy-tree'];

export const treePlacements: TreePlacement[] = Array.from({ length: MAP_COLUMNS * MAP_ROWS }, (_, index) => {
  const col = index % MAP_COLUMNS;
  const row = Math.floor(index / MAP_COLUMNS);
  const cell = { col, row };
  const cellKey = keyForCell(cell);

  if (
    col < 1 ||
    row < 2 ||
    col >= MAP_COLUMNS - 1 ||
    row >= MAP_ROWS - 1 ||
    pathCellKeys.has(cellKey) ||
    cellKey === spawnCellKey ||
    isInsideClearedArea(cell) ||
    isInsideArea(cell, laughterArea) ||
    isInsideArea(cell, adventureArea) ||
    isInsideArea(cell, foodArea) ||
    isInsideArea(cell, caveGuideArea) ||
    isInsideArea(cell, gardenArea) ||
    (isInsideFinalArea(cell) && !isInsideFinalSideBand(cell))
  ) {
    return undefined;
  }

  if (getTileNoise(col, row, 101) > 0.035) {
    return undefined;
  }

  const assetIndex = Math.floor(getTileNoise(col, row, 103) * treeAssetKeys.length) % treeAssetKeys.length;
  return { col, row, assetKey: treeAssetKeys[assetIndex] };
})
  .filter((placement): placement is TreePlacement => placement !== undefined)
  .slice(0, 84);

export type GrassOverlayAssetKey =
  | 'flower-cluster-a'
  | 'tall-grass-a'
  | 'rock-cluster'
  | 'path-bush'
  | 'flower-cluster-b'
  | 'tree-mushrooms'
  | 'tall-grass-b'
  | 'flower-cluster-c'
  | 'flower-cluster-d'
  | 'flower-cluster-e';

export type GrassOverlayPropType = 'tall-grass' | 'flower' | 'mushroom' | 'rock' | 'bush';

export const grassOverlayAssets: Array<{ key: GrassOverlayAssetKey; path: string }> = [
  { key: 'flower-cluster-a', path: '/grass-asset-1.png' },
  { key: 'tall-grass-a', path: '/grass-asset-2.png' },
  { key: 'rock-cluster', path: '/grass-asset-3.png' },
  { key: 'path-bush', path: '/grass-asset-4.png' },
  { key: 'flower-cluster-b', path: '/grass-asset-5.png' },
  { key: 'tree-mushrooms', path: '/grass-asset-6.png' },
  { key: 'tall-grass-b', path: '/grass-asset-7.png' },
  { key: 'flower-cluster-c', path: '/grass-asset-8.png' },
  { key: 'flower-cluster-d', path: '/grass-asset-9.png' },
  { key: 'flower-cluster-e', path: '/grass-asset-10.png' },
];

export interface GrassOverlayPlacement extends PathCell {
  assetKey: GrassOverlayAssetKey;
  propType: GrassOverlayPropType;
  blocksMovement?: boolean;
  alpha?: number;
}

const treeCellKeys = new Set(treePlacements.map((tree) => keyForCell(tree)));

const flowerAssetKeys: GrassOverlayAssetKey[] = [
  'flower-cluster-a',
  'flower-cluster-b',
  'flower-cluster-c',
  'flower-cluster-d',
  'flower-cluster-e',
];
const tallGrassAssetKeys: GrassOverlayAssetKey[] = ['tall-grass-a', 'tall-grass-b'];

const isBlockedBaseCell = (cell: PathCell) => treeCellKeys.has(keyForCell(cell)) || keyForCell(cell) === spawnCellKey;

const tallGrassPlacements = Array.from({ length: MAP_COLUMNS * MAP_ROWS }, (_, index): GrassOverlayPlacement | undefined => {
  const col = index % MAP_COLUMNS;
  const row = Math.floor(index / MAP_COLUMNS);
  const cellKey = keyForCell({ col, row });

  if (pathCellKeys.has(cellKey) || treeCellKeys.has(cellKey) || cellKey === spawnCellKey) {
    return undefined;
  }

  const patchNoise = getTileNoise(Math.floor(col / 7), Math.floor(row / 7), 11);
  const tileNoise = getTileNoise(col, row, 29);
  const threshold = patchNoise > 0.68 ? 0.28 : patchNoise > 0.42 ? 0.18 : 0.09;

  if (tileNoise > threshold) {
    return undefined;
  }

  const assetIndex = Math.floor(getTileNoise(col, row, 47) * tallGrassAssetKeys.length) % tallGrassAssetKeys.length;
  return { col, row, assetKey: tallGrassAssetKeys[assetIndex], propType: 'tall-grass', alpha: 0.7 };
}).filter((placement): placement is GrassOverlayPlacement => placement !== undefined);

const addCluster = (
  placements: GrassOverlayPlacement[],
  occupied: Set<string>,
  center: PathCell,
  offsets: PathCell[],
  createPlacement: (cell: PathCell, index: number) => GrassOverlayPlacement,
) => {
  offsets.forEach((offset, index) => {
    const cell = { col: center.col + offset.col, row: center.row + offset.row };
    const cellKey = keyForCell(cell);
    if (!isInsideGrid(cell) || occupied.has(cellKey) || isBlockedBaseCell(cell) || pathCellKeys.has(cellKey)) {
      return;
    }
    occupied.add(cellKey);
    placements.push(createPlacement(cell, index));
  });
};

const flowerPlacements = (() => {
  const placements: GrassOverlayPlacement[] = [];
  const occupied = new Set<string>();
  const clusterOffsets = [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: -1, row: 0 },
  ];

  for (let row = 4; row < MAP_ROWS - 4; row += 6) {
    for (let col = 4; col < MAP_COLUMNS - 4; col += 7) {
      const center = { col, row };
      if (pathCellKeys.has(keyForCell(center)) || isInsideClearedArea(center) || getTileNoise(col, row, 151) > 0.48) {
        continue;
      }
      addCluster(placements, occupied, center, clusterOffsets, (cell, index) => ({
        ...cell,
        assetKey: flowerAssetKeys[(placements.length + index) % flowerAssetKeys.length],
        propType: 'flower',
      }));
    }
  }

  return placements;
})();

const mushroomPlacements = (() => {
  const placements: GrassOverlayPlacement[] = [];
  const occupied = new Set<string>();
  const clusterOffsets = [
    { col: 1, row: 0 },
    { col: -1, row: 1 },
  ];

  for (const tree of treePlacements.filter((_, index) => index % 4 === 0)) {
    addCluster(placements, occupied, tree, clusterOffsets, (cell) => ({
      ...cell,
      assetKey: 'tree-mushrooms',
      propType: 'mushroom',
    }));
  }

  return placements;
})();

const rockPlacements = (() => {
  const placements: GrassOverlayPlacement[] = [];
  const occupied = new Set<string>();
  const clusterOffsets = [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
  ];

  for (let row = 5; row < MAP_ROWS - 2; row += 9) {
    for (let col = 5; col < MAP_COLUMNS - 2; col += 11) {
      if (getTileNoise(col, row, 181) > 0.38) {
        continue;
      }
      addCluster(placements, occupied, { col, row }, clusterOffsets, (cell) => ({ ...cell, assetKey: 'rock-cluster', propType: 'rock' }));
    }
  }

  for (const pathCell of pathCells.filter((_, index) => index % 37 === 0)) {
    if (!isBlockedBaseCell(pathCell)) {
      placements.push({ ...pathCell, assetKey: 'rock-cluster', propType: 'rock' });
    }
  }

  for (const area of Object.values(areaCenters).map((center) => ({ x: center.x, y: center.y, width: AREA_WIDTH, height: AREA_HEIGHT }))) {
    for (const cell of buildAreaCells(area)) {
      if (getTileNoise(cell.col, cell.row, 251) < 0.025 && !isBlockedBaseCell(cell)) {
        placements.push({ ...cell, assetKey: 'rock-cluster', propType: 'rock' });
      }
    }
  }

  return placements;
})();

const bushPlacements = (() => {
  const placements: GrassOverlayPlacement[] = [];
  const occupied = new Set<string>();
  const candidateCells = new Map<string, PathCell>();

  for (const pathCell of pathCells) {
    for (const neighbor of [
      { col: pathCell.col + 1, row: pathCell.row },
      { col: pathCell.col - 1, row: pathCell.row },
      { col: pathCell.col, row: pathCell.row + 1 },
      { col: pathCell.col, row: pathCell.row - 1 },
    ]) {
      const neighborKey = keyForCell(neighbor);
      if (
        isInsideGrid(neighbor) &&
        !pathCellKeys.has(neighborKey) &&
        !isInsideClearedArea(neighbor) &&
        !isInsideArea(neighbor, caveGuideArea) &&
        !isBlockedBaseCell(neighbor)
      ) {
        candidateCells.set(neighborKey, neighbor);
      }
    }
  }

  for (const cell of candidateCells.values()) {
    const runNoise = getTileNoise(Math.floor(cell.col / 4), Math.floor(cell.row / 4), 211);
    const gapNoise = getTileNoise(cell.col, cell.row, 223);
    if (runNoise > 0.58 || gapNoise > 0.72) {
      continue;
    }

    const cellKey = keyForCell(cell);
    if (occupied.has(cellKey)) {
      continue;
    }
    occupied.add(cellKey);
    placements.push({ ...cell, assetKey: 'path-bush', propType: 'bush', blocksMovement: true });
  }

  return placements;
})();

const caveGuideCaveDecorCandidates: GrassOverlayPlacement[] = [
  { col: 7, row: 36, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 8, row: 37, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 9, row: 38, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 10, row: 37, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 20, row: 37, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 21, row: 38, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 22, row: 37, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 23, row: 36, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 6, row: 34, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 24, row: 34, assetKey: 'tree-mushrooms', propType: 'mushroom' },
  { col: 5, row: 35, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 6, row: 36, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 8, row: 39, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 11, row: 38, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 19, row: 38, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 22, row: 39, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 24, row: 36, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 25, row: 35, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 12, row: 39, assetKey: 'rock-cluster', propType: 'rock' },
  { col: 18, row: 39, assetKey: 'rock-cluster', propType: 'rock' },
];

const caveGuideCaveDecorPlacements = caveGuideCaveDecorCandidates.filter(
  (placement) => !treeCellKeys.has(keyForCell(placement)) && !pathCellKeys.has(keyForCell(placement)),
);

export const grassOverlayPlacements: GrassOverlayPlacement[] = [
  ...tallGrassPlacements,
  ...flowerPlacements,
  ...mushroomPlacements,
  ...rockPlacements,
  ...bushPlacements,
  ...caveGuideCaveDecorPlacements,
].filter(
  (placement) =>
    (placement.propType === 'rock' || !isInsideFinalArea(placement) || isInsideFinalSideBand(placement)) &&
    (placement.propType === 'rock' || !isInsideClearedArea(placement)) &&
    (placement.propType === 'rock' || !isInsideArea(placement, laughterArea)) &&
    !isInsideArea(placement, adventureArea) &&
    !isInsideArea(placement, foodArea) &&
    !isInsideArea(placement, gardenArea),
);
