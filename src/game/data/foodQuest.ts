import { foodAreaPlacement } from './foodArea';

export const FOOD_FLOOR_DISPLAY_SIZE = 58;
export const FOOD_FOUND_THUMBNAIL_SIZE = 40;
export const FOOD_FOUND_THUMBNAIL_TEXT_GAP = 8;

export interface FoodAlphaBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface FoodQuestItem {
  id: string;
  name: string;
  tableAssetKey: string;
  floorAssetKey: string;
  floorAssetPath: string;
  worldPosition: { x: number; y: number };
}

const left = foodAreaPlacement.x - foodAreaPlacement.width / 2;
const top = foodAreaPlacement.y - foodAreaPlacement.height / 2;

export const foodQuestItems: FoodQuestItem[] = [
  { id: 'acai', name: 'Acai', tableAssetKey: 'food-area-acai', floorAssetKey: 'food-area-acai-floor', floorAssetPath: '/food-area/food-cropped/Acai.png', worldPosition: { x: left + 150, y: top + 155 } },
  { id: 'beef-bowl', name: 'Beef Bowl', tableAssetKey: 'food-area-beef-bowl', floorAssetKey: 'food-area-beef-bowl-floor', floorAssetPath: '/food-area/food-cropped/Beef Bowl.png', worldPosition: { x: left + 390, y: top + 135 } },
  { id: 'burger', name: 'Burger', tableAssetKey: 'food-area-burger', floorAssetKey: 'food-area-burger-floor', floorAssetPath: '/food-area/food-cropped/Burger.png', worldPosition: { x: left + 690, y: top + 140 } },
  { id: 'kakigori', name: 'Kakigori', tableAssetKey: 'food-area-kakigori', floorAssetKey: 'food-area-kakigori-floor', floorAssetPath: '/food-area/food-cropped/Kakigori.png', worldPosition: { x: left + 1040, y: top + 300 } },
  { id: 'mala', name: 'Mala', tableAssetKey: 'food-area-mala', floorAssetKey: 'food-area-mala-floor', floorAssetPath: '/food-area/food-cropped/Mala.png', worldPosition: { x: left + 190, y: top + 380 } },
  { id: 'pizza', name: 'Pizza', tableAssetKey: 'food-area-pizza', floorAssetKey: 'food-area-pizza-floor', floorAssetPath: '/food-area/food-cropped/Pizza.png', worldPosition: { x: left + 420, y: top + 555 } },
  { id: 'ramen', name: 'Ramen', tableAssetKey: 'food-area-ramen', floorAssetKey: 'food-area-ramen-floor', floorAssetPath: '/food-area/food-cropped/Ramen.png', worldPosition: { x: left + 855, y: top + 560 } },
  { id: 'steak', name: 'Steak', tableAssetKey: 'food-area-steak', floorAssetKey: 'food-area-steak-floor', floorAssetPath: '/food-area/food-cropped/Steak.png', worldPosition: { x: left + 1080, y: top + 520 } },
  { id: 'sushi', name: 'Sushi', tableAssetKey: 'food-area-sushi', floorAssetKey: 'food-area-sushi-floor', floorAssetPath: '/food-area/food-cropped/Sushi.png', worldPosition: { x: left + 610, y: top + 150 } },
];

export const getFoodQuestItemById = (id: string) => foodQuestItems.find((item) => item.id === id);

export const countMissingFoodItems = (returnedFoodIds: Set<string>) =>
  foodQuestItems.filter((item) => !returnedFoodIds.has(item.id)).length;

export const getFoodCropScale = (bounds: FoodAlphaBounds, maxVisibleSize: number) => {
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  return maxVisibleSize / Math.max(width, height);
};
