import { describe, expect, it } from 'vitest';
import {
  FOOD_FLOOR_DISPLAY_SIZE,
  FOOD_FOUND_THUMBNAIL_SIZE,
  FOOD_FOUND_THUMBNAIL_TEXT_GAP,
  countMissingFoodItems,
  foodQuestItems,
  getFoodCropScale,
  getFoodQuestItemById,
} from './foodQuest';

describe('food quest data', () => {
  it('defines all 9 food quest items with unique ids and table asset keys', () => {
    expect(foodQuestItems.map((item) => item.name)).toEqual([
      'Acai',
      'Beef Bowl',
      'Burger',
      'Kakigori',
      'Mala',
      'Pizza',
      'Ramen',
      'Steak',
      'Sushi',
    ]);
    expect(new Set(foodQuestItems.map((item) => item.id)).size).toBe(foodQuestItems.length);
    expect(foodQuestItems.every((item) => item.tableAssetKey.startsWith('food-area-'))).toBe(true);
    expect(foodQuestItems.every((item) => item.floorAssetKey.endsWith('-floor'))).toBe(true);
    expect(foodQuestItems.every((item) => item.floorAssetPath.startsWith('/food-area/food-cropped/'))).toBe(true);
  });

  it('places every food collectible inside the food area bounds', () => {
    expect(foodQuestItems.every((item) => item.worldPosition.x >= 3020 && item.worldPosition.x <= 4220)).toBe(true);
    expect(foodQuestItems.every((item) => item.worldPosition.y >= 1915 && item.worldPosition.y <= 2665)).toBe(true);
  });

  it('keeps scattered food away from the food table and barbecue pit zones', () => {
    const tableZone = { left: 3350, right: 3890, top: 2180, bottom: 2460 };
    const barbecueZone = { left: 3900, right: 4200, top: 1920, bottom: 2190 };
    const inside = (item: (typeof foodQuestItems)[number], zone: typeof tableZone) =>
      item.worldPosition.x >= zone.left &&
      item.worldPosition.x <= zone.right &&
      item.worldPosition.y >= zone.top &&
      item.worldPosition.y <= zone.bottom;

    expect(foodQuestItems.some((item) => inside(item, tableZone))).toBe(false);
    expect(foodQuestItems.some((item) => inside(item, barbecueZone))).toBe(false);
  });

  it('looks up food quest items by id', () => {
    expect(getFoodQuestItemById('ramen')?.name).toBe('Ramen');
    expect(getFoodQuestItemById('missing')).toBeUndefined();
  });

  it('counts unreturned food items', () => {
    expect(countMissingFoodItems(new Set(['acai', 'ramen']))).toBe(7);
  });

  it('computes crop scale from visible bounds instead of padded texture size', () => {
    expect(getFoodCropScale({ minX: 400, minY: 200, maxX: 499, maxY: 249 }, 75)).toBe(0.75);
  });

  it('uses a smaller floor food display size than the pickup/table presentation', () => {
    expect(FOOD_FLOOR_DISPLAY_SIZE).toBeLessThan(70);
  });

  it('uses a compact food-found popup thumbnail next to the text', () => {
    expect(FOOD_FOUND_THUMBNAIL_SIZE).toBeLessThan(FOOD_FLOOR_DISPLAY_SIZE);
    expect(FOOD_FOUND_THUMBNAIL_TEXT_GAP).toBeLessThanOrEqual(12);
  });
});
