import { AREA_HEIGHT, AREA_WIDTH, areaCenters } from './mapLayout';

export const adventureAreaPlacement = {
  x: areaCenters['star-adventure'].x,
  y: areaCenters['star-adventure'].y,
  width: AREA_WIDTH,
  height: AREA_HEIGHT,
} as const;

export const ADVENTURE_WALL_IMAGE_SIZE = { width: 25, height: 35 } as const;
export const ADVENTURE_WALL_HITBOX_SIZE = { width: 25, height: 17 } as const;
export const ADVENTURE_WALL_DEPTH_UP_SHIFT = 1;
export const ADVENTURE_MAZE_BOUNDS = { width: 1100, height: 646 } as const;
export const ADVENTURE_MAZE_COLUMNS = ADVENTURE_MAZE_BOUNDS.width / ADVENTURE_WALL_HITBOX_SIZE.width;
export const ADVENTURE_MAZE_ROWS = ADVENTURE_MAZE_BOUNDS.height / ADVENTURE_WALL_HITBOX_SIZE.height;

export const ADVENTURE_MAZE_ORIGIN = {
  x: adventureAreaPlacement.x - ADVENTURE_MAZE_BOUNDS.width / 2,
  y: adventureAreaPlacement.y - ADVENTURE_MAZE_BOUNDS.height / 2,
} as const;

export const adventureAreaAssets = {
  flooring: { key: 'adventure-area-flooring', path: '/adventure-area/flooring maze area.png' },
  walls: [
    { key: 'adventure-wall-1', path: '/adventure-area/Wall 1.png' },
    { key: 'adventure-wall-2', path: '/adventure-area/Wall 2.png' },
    { key: 'adventure-wall-3', path: '/adventure-area/Wall 3.png' },
  ],
} as const;

export type AdventureWallAssetKey = (typeof adventureAreaAssets.walls)[number]['key'];

export interface AdventureMazeCell {
  col: number;
  row: number;
}

export interface AdventureMazeWall extends AdventureMazeCell {
  id: string;
  assetKey: AdventureWallAssetKey;
  x: number;
  y: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export const ADVENTURE_MAZE_MATRIX = [
  '############################################',
  '############################################',
  '#........#.................................#',
  '#........#.................................#',
  '#........#.................................#',
  '#..####..#..################..#####..#..####',
  '#..####..#..###########..###..##..#..#..####',
  '#..#.......................#..##..#..#..####',
  '#..#.......................#..##..#..#..####',
  '#..#.......................#..##..#..#..####',
  '#..#..##########################..#..#..####',
  '#..#..............#..................#..####',
  '#..#..............#..................#..####',
  '#..#..............#..................#..####',
  '#..#..#####################..#########..####',
  '#..#..####......##........#........###..####',
  '#..#..####......##........#........###..####',
  '####..####......##........#........##......#',
  '#...........##..##........#..####..##......#',
  '#...........##..##........#..####..##......#',
  '#...........##..##........#..####..##......#',
  '##############..##........#..####..#########',
  '#..##...........##........##################',
  '#..##...........#####....................###',
  '#..##...........#####....................###',
  '#..##..##############....................###',
  '#..##..########...#####################..###',
  '#..##..########...#####################..###',
  '#..##..########...############........#..###',
  '#..##.........##..#..........#........#..###',
  '#..##.........##..#..........#........#..###',
  '#..##.........##..#..........#######..#..###',
  '#..#####..##..##..#..######..#######..#..###',
  '#.........##.........######..#######..#..###',
  '#.........##.........######..............###',
  '#.........##.........######..............###',
  '###########################..............###',
  '############################################',
] as const;

export const ADVENTURE_MAZE_ENTRANCE_CELLS: readonly AdventureMazeCell[] = [
  { col: 43, row: 17 },
  { col: 43, row: 18 },
  { col: 43, row: 19 },
  { col: 43, row: 20 },
] as const;

const cellKey = (cell: AdventureMazeCell) => `${cell.col},${cell.row}`;

const sortCells = (a: AdventureMazeCell, b: AdventureMazeCell) => a.row - b.row || a.col - b.col;

const toCellCenterWorld = (cell: AdventureMazeCell) => ({
  x: ADVENTURE_MAZE_ORIGIN.x + cell.col * ADVENTURE_WALL_HITBOX_SIZE.width + ADVENTURE_WALL_HITBOX_SIZE.width / 2,
  y: ADVENTURE_MAZE_ORIGIN.y + cell.row * ADVENTURE_WALL_HITBOX_SIZE.height + ADVENTURE_WALL_HITBOX_SIZE.height / 2,
});

const toCellBottomWorld = (cell: AdventureMazeCell) => ({
  x: ADVENTURE_MAZE_ORIGIN.x + cell.col * ADVENTURE_WALL_HITBOX_SIZE.width + ADVENTURE_WALL_HITBOX_SIZE.width / 2,
  y: ADVENTURE_MAZE_ORIGIN.y + (cell.row + 1) * ADVENTURE_WALL_HITBOX_SIZE.height,
});

const getWallAssetKey = (cell: AdventureMazeCell): AdventureWallAssetKey =>
  adventureAreaAssets.walls[(cell.col * 7 + cell.row * 13) % adventureAreaAssets.walls.length].key;

const openCellKeys = new Set<string>();

for (const [row, matrixRow] of ADVENTURE_MAZE_MATRIX.entries()) {
  for (const [col, cell] of [...matrixRow].entries()) {
    if (cell === '.') {
      openCellKeys.add(cellKey({ col, row }));
    }
  }
}

for (const cell of ADVENTURE_MAZE_ENTRANCE_CELLS) {
  openCellKeys.add(cellKey(cell));
}

export const adventureMazeOpenCells: AdventureMazeCell[] = Array.from(openCellKeys, (key) => {
  const [col, row] = key.split(',').map(Number);
  return { col, row };
}).sort(sortCells);

export const adventureMazeEntrance = {
  x: adventureAreaPlacement.x + AREA_WIDTH / 2,
  y: adventureAreaPlacement.y,
  width: 96,
  height: ADVENTURE_WALL_HITBOX_SIZE.height * 4,
} as const;

export const adventureMazeDestination = {
  x: areaCenters['star-adventure'].x,
  y: areaCenters['star-adventure'].y,
} as const;

export const adventureMazeRouteCheckpoints = [
  adventureMazeEntrance,
  toCellCenterWorld({ col: 43, row: 18 }),
  toCellCenterWorld({ col: 38, row: 18 }),
  toCellCenterWorld({ col: 38, row: 4 }),
  toCellCenterWorld({ col: 10, row: 4 }),
  toCellCenterWorld({ col: 5, row: 18 }),
  toCellCenterWorld({ col: 14, row: 20 }),
  toCellCenterWorld({ col: 22, row: 19 }),
  adventureMazeDestination,
] as const;

const wallCells = Array.from({ length: ADVENTURE_MAZE_ROWS }, (_, row) =>
  Array.from({ length: ADVENTURE_MAZE_COLUMNS }, (_, col) => ({ col, row })),
)
  .flat()
  .filter((cell) => !openCellKeys.has(cellKey(cell)))
  .sort(sortCells);

export const adventureMazeWalls: AdventureMazeWall[] = wallCells.map((cell) => ({
  id: `adventure-wall-${cell.col}-${cell.row}`,
  assetKey: getWallAssetKey(cell),
  ...cell,
  ...toCellBottomWorld(cell),
  ...ADVENTURE_WALL_IMAGE_SIZE,
  originX: 0.5,
  originY: 1,
}));

export const getAdventureWallDepth = (wall: Pick<AdventureMazeWall, 'y'>, playerDepthToHitboxFrontOffset: number) =>
  wall.y - playerDepthToHitboxFrontOffset - ADVENTURE_WALL_DEPTH_UP_SHIFT;

export const adventureMazeBlockingBodies = adventureMazeWalls.map((wall) => ({
  id: wall.id,
  x: wall.x,
  y: wall.y - ADVENTURE_WALL_HITBOX_SIZE.height / 2,
  width: ADVENTURE_WALL_HITBOX_SIZE.width,
  height: ADVENTURE_WALL_HITBOX_SIZE.height,
}));
