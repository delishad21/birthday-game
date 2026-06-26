import { AREA_HEIGHT, AREA_WIDTH, areaCenters } from './mapLayout';
import {
  getAlphaStripBlockingBodies as getAlphaStripBlockingBodiesForPlacement,
  getBlockingLayerDepth,
  getPaddedLayerPlacement,
  type AlphaBounds,
  type AlphaCollisionPlacement,
  type AlphaLayerPlacement,
  type AlphaStripRow,
  type AlphaStripSegment,
} from './alphaCollision';

export const foodAreaPlacement = {
  x: areaCenters['star-food'].x,
  y: areaCenters['star-food'].y,
  width: AREA_WIDTH,
  height: AREA_HEIGHT,
} as const;

export interface FoodAreaLayer {
  key: string;
  path: string;
  blocksMovement: boolean;
  depthOffset?: number;
  alwaysBelowPlayer?: boolean;
}

export interface FoodObjectLayer extends FoodAreaLayer {
  croppedPath: string;
}

export const FOOD_TABLETOP_DEPTH_OFFSET = 1000;
export const FOOD_ON_TABLE_DEPTH_OFFSET = 25;

export const foodAreaLayers: FoodAreaLayer[] = [
  { key: 'food-area-flooring', path: '/food-area/Flooring.png', blocksMovement: false },
  { key: 'food-area-table', path: '/food-area/Table.png', blocksMovement: true },
  { key: 'food-area-round-table', path: '/food-area/Round Table.png', blocksMovement: true },
  { key: 'food-area-bbq-pit', path: '/food-area/BBQ Pit.png', blocksMovement: true },
  { key: 'food-area-drink-box', path: '/food-area/Drink Box.png', blocksMovement: true },
  { key: 'food-area-menu-left', path: '/food-area/Menu Left.png', blocksMovement: true },
  { key: 'food-area-menu-right', path: '/food-area/Menu Right.png', blocksMovement: true },
  { key: 'food-area-sauce', path: '/food-area/Sauce.png', blocksMovement: true, depthOffset: FOOD_TABLETOP_DEPTH_OFFSET },
  { key: 'food-area-tray', path: '/food-area/Tray.png', blocksMovement: true },
  { key: 'food-area-utencils', path: '/food-area/utencils.png', blocksMovement: true, depthOffset: FOOD_TABLETOP_DEPTH_OFFSET },
  { key: 'food-area-seat-left', path: '/food-area/Seat Left.png', blocksMovement: false, alwaysBelowPlayer: true },
  { key: 'food-area-seat-right', path: '/food-area/Seat Right.png', blocksMovement: false, alwaysBelowPlayer: true },
];

export const foodObjectAssets: FoodObjectLayer[] = [
  { key: 'food-area-acai', path: '/food-area/Food/Acai.png', croppedPath: '/food-area/food-cropped/Acai.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-beef-bowl', path: '/food-area/Food/Beef Bowl.png', croppedPath: '/food-area/food-cropped/Beef Bowl.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-burger', path: '/food-area/Food/Burger.png', croppedPath: '/food-area/food-cropped/Burger.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-kakigori', path: '/food-area/Food/Kakigori.png', croppedPath: '/food-area/food-cropped/Kakigori.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-mala', path: '/food-area/Food/Mala.png', croppedPath: '/food-area/food-cropped/Mala.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-pizza', path: '/food-area/Food/Pizza.png', croppedPath: '/food-area/food-cropped/Pizza.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-ramen', path: '/food-area/Food/Ramen.png', croppedPath: '/food-area/food-cropped/Ramen.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-steak', path: '/food-area/Food/Steak.png', croppedPath: '/food-area/food-cropped/Steak.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
  { key: 'food-area-sushi', path: '/food-area/Food/Sushi.png', croppedPath: '/food-area/food-cropped/Sushi.png', blocksMovement: false, depthOffset: FOOD_ON_TABLE_DEPTH_OFFSET },
];

export const foodAreaAssets = foodAreaLayers;

export type { AlphaBounds, AlphaStripRow, AlphaStripSegment };
export type FoodObjectPlacement = AlphaCollisionPlacement;
export type FoodLayerRenderPlacement = AlphaLayerPlacement;

export const FOOD_COLLISION_STRIP_HEIGHT = 8;
export const FOOD_COLLISION_TOP_TRIM = 8;
export const FOOD_BLOCKING_DEPTH_UP_SHIFT = 15;

export const getPaddedFoodLayerPlacement = (
  bounds: AlphaBounds,
  sourceSize: { width: number; height: number },
): FoodLayerRenderPlacement => getPaddedLayerPlacement(foodAreaPlacement, bounds, sourceSize);

export const getAlphaStripBlockingBodies = (
  rows: AlphaStripRow[],
  sourceSize: { width: number; height: number },
  stripHeight = FOOD_COLLISION_STRIP_HEIGHT,
  topTrim = FOOD_COLLISION_TOP_TRIM,
  visibleTopY = rows.length > 0 ? Math.min(...rows.map((row) => row.y)) : 0,
): FoodObjectPlacement[] => getAlphaStripBlockingBodiesForPlacement(foodAreaPlacement, rows, sourceSize, stripHeight, topTrim, visibleTopY);

export const getFoodBlockingLayerDepth = (
  bodies: FoodObjectPlacement[],
  fallbackDepth: number,
  playerFrontOffset = 0,
  depthUpShift = 0,
) => getBlockingLayerDepth(bodies, fallbackDepth, playerFrontOffset, depthUpShift);
