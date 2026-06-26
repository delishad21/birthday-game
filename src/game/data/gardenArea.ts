import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';

export type GardenPlantAssetKey =
  | 'garden-plant-1'
  | 'garden-plant-2'
  | 'garden-plant-3'
  | 'garden-plant-4'
  | 'garden-plant-5'
  | 'garden-plant-6'
  | 'garden-plant-7'
  | 'garden-plant-8'
  | 'garden-plant-9';

export interface GardenPlantPlacement {
  col: number;
  row: number;
  assetKey: GardenPlantAssetKey;
}

export interface GardenBlockingBody {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GARDEN_PLANT_BLOCKING_SIZE = MAP_TILE_SIZE;
export const GARDEN_PLANT_DEPTH_UP_SHIFT = 15;

export const getGardenPlantDepth = (row: number) => (row + 1) * MAP_TILE_SIZE - GARDEN_PLANT_DEPTH_UP_SHIFT;

export const gardenFlooringPlacement = {
  x: areaCenters['toy-marshmallow'].x,
  y: areaCenters['toy-marshmallow'].y,
  width: AREA_WIDTH,
  height: AREA_HEIGHT,
} as const;

export const gardenPlantAssets: Array<{ key: GardenPlantAssetKey; path: string }> = [
  { key: 'garden-plant-1', path: '/garden-area/plant1.png' },
  { key: 'garden-plant-2', path: '/garden-area/plant2.png' },
  { key: 'garden-plant-3', path: '/garden-area/plant3.png' },
  { key: 'garden-plant-4', path: '/garden-area/plant4.png' },
  { key: 'garden-plant-5', path: '/garden-area/plant5.png' },
  { key: 'garden-plant-6', path: '/garden-area/plant6.png' },
  { key: 'garden-plant-7', path: '/garden-area/plant7.png' },
  { key: 'garden-plant-8', path: '/garden-area/plant8.png' },
  { key: 'garden-plant-9', path: '/garden-area/plant9.png' },
];

const gardenAreaMinCol = Math.floor((areaCenters['toy-marshmallow'].x - AREA_WIDTH / 2) / MAP_TILE_SIZE);
const gardenAreaMinRow = Math.floor((areaCenters['toy-marshmallow'].y - AREA_HEIGHT / 2) / MAP_TILE_SIZE);
const localPlantCells: Array<{ col: number; row: number; assetIndex: number }> = [
  { col: 6, row: 1, assetIndex: 0 },
  { col: 7, row: 1, assetIndex: 0 },
  { col: 9, row: 1, assetIndex: 0 },
  { col: 11, row: 1, assetIndex: 0 },
  { col: 6, row: 2, assetIndex: 0 },
  { col: 8, row: 2, assetIndex: 0 },
  { col: 10, row: 2, assetIndex: 0 },
  { col: 12, row: 2, assetIndex: 0 },
  { col: 7, row: 3, assetIndex: 0 },
  { col: 9, row: 3, assetIndex: 0 },
  { col: 11, row: 3, assetIndex: 0 },
  { col: 13, row: 3, assetIndex: 0 },
  { col: 13, row: 1, assetIndex: 1 },
  { col: 15, row: 1, assetIndex: 1 },
  { col: 17, row: 1, assetIndex: 1 },
  { col: 14, row: 2, assetIndex: 1 },
  { col: 16, row: 2, assetIndex: 1 },
  { col: 18, row: 2, assetIndex: 1 },
  { col: 15, row: 3, assetIndex: 1 },
  { col: 17, row: 3, assetIndex: 1 },
  { col: 8, row: 1, assetIndex: 2 },
  { col: 10, row: 1, assetIndex: 2 },
  { col: 12, row: 1, assetIndex: 2 },
  { col: 14, row: 1, assetIndex: 2 },
  { col: 16, row: 1, assetIndex: 2 },
  { col: 5, row: 2, assetIndex: 2 },
  { col: 7, row: 2, assetIndex: 2 },
  { col: 9, row: 2, assetIndex: 2 },
  { col: 11, row: 2, assetIndex: 2 },
  { col: 13, row: 2, assetIndex: 2 },
  { col: 2, row: 6, assetIndex: 3 },
  { col: 3, row: 6, assetIndex: 3 },
  { col: 2, row: 7, assetIndex: 3 },
  { col: 3, row: 7, assetIndex: 3 },
  { col: 2, row: 8, assetIndex: 3 },
  { col: 3, row: 8, assetIndex: 3 },
  { col: 21, row: 6, assetIndex: 4 },
  { col: 22, row: 6, assetIndex: 4 },
  { col: 21, row: 7, assetIndex: 4 },
  { col: 22, row: 7, assetIndex: 4 },
  { col: 21, row: 8, assetIndex: 4 },
  { col: 22, row: 8, assetIndex: 4 },
  { col: 6, row: 10, assetIndex: 4 },
  { col: 8, row: 10, assetIndex: 4 },
  { col: 10, row: 10, assetIndex: 4 },
  { col: 5, row: 11, assetIndex: 4 },
  { col: 7, row: 11, assetIndex: 4 },
  { col: 9, row: 11, assetIndex: 4 },
  { col: 4, row: 12, assetIndex: 4 },
  { col: 6, row: 12, assetIndex: 4 },
  { col: 7, row: 10, assetIndex: 5 },
  { col: 9, row: 10, assetIndex: 5 },
  { col: 4, row: 11, assetIndex: 5 },
  { col: 6, row: 11, assetIndex: 5 },
  { col: 8, row: 11, assetIndex: 5 },
  { col: 5, row: 12, assetIndex: 5 },
  { col: 7, row: 12, assetIndex: 5 },
  { col: 15, row: 10, assetIndex: 6 },
  { col: 17, row: 10, assetIndex: 6 },
  { col: 19, row: 10, assetIndex: 6 },
  { col: 14, row: 11, assetIndex: 6 },
  { col: 16, row: 11, assetIndex: 6 },
  { col: 18, row: 11, assetIndex: 6 },
  { col: 20, row: 11, assetIndex: 6 },
  { col: 15, row: 12, assetIndex: 6 },
  { col: 17, row: 12, assetIndex: 6 },
  { col: 14, row: 10, assetIndex: 7 },
  { col: 16, row: 10, assetIndex: 7 },
  { col: 18, row: 10, assetIndex: 7 },
  { col: 20, row: 10, assetIndex: 7 },
  { col: 15, row: 11, assetIndex: 7 },
  { col: 17, row: 11, assetIndex: 7 },
  { col: 19, row: 11, assetIndex: 7 },
  { col: 14, row: 12, assetIndex: 7 },
  { col: 16, row: 12, assetIndex: 7 },
  { col: 18, row: 12, assetIndex: 7 },
  { col: 20, row: 12, assetIndex: 7 },
  { col: 16, row: 3, assetIndex: 8 },
  { col: 14, row: 3, assetIndex: 8 },
  { col: 8, row: 12, assetIndex: 8 },
  { col: 9, row: 12, assetIndex: 8 },
  { col: 19, row: 12, assetIndex: 8 },
];

export const gardenPlantPlacements: GardenPlantPlacement[] = localPlantCells.map((cell) => ({
  col: gardenAreaMinCol + cell.col,
  row: gardenAreaMinRow + cell.row,
  assetKey: gardenPlantAssets[cell.assetIndex].key,
}));

export const gardenPlantBlockingBodies: GardenBlockingBody[] = gardenPlantPlacements.map((plant) => ({
  x: plant.col * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
  y: plant.row * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
  width: GARDEN_PLANT_BLOCKING_SIZE,
  height: GARDEN_PLANT_BLOCKING_SIZE,
}));
