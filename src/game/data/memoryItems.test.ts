import { describe, expect, it } from 'vitest';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters, grassOverlayPlacements, pathCells, treePlacements } from './mapLayout';
import { foodTableStarPosition, memoryItems, cowEasterEggPosition, penguinPathSidePosition } from './memoryItems';

describe('memory items', () => {
  it('defines four star objectives, three Toys, and one uncounted easter egg', () => {
    expect(memoryItems.filter((item) => item.category === 'star').map((item) => item.id)).toEqual([
      'star-laughter',
      'star-adventure',
      'star-food',
      'star-memories',
    ]);
    expect(memoryItems.filter((item) => item.category === 'toy').map((item) => item.id)).toEqual(['toy-bear', 'toy-marshmallow', 'toy-penguin']);
    expect(memoryItems.filter((item) => item.category === 'easter-egg').map((item) => item.id)).toEqual(['easter-cow']);
  });

  it('uses the public star names instead of legacy ids', () => {
    expect(memoryItems.some((item) => item.id === 'star-chaos' || item.id === 'star-love')).toBe(false);
    expect(memoryItems.find((item) => item.id === 'star-adventure')?.name).toBe('Star of Adventure');
    expect(memoryItems.find((item) => item.id === 'star-memories')?.name).toBe('Star of Moments');
  });

  it('places Penguin as a Toy next to a clear path cell', () => {
    const pathFriend = memoryItems.find((item) => item.id === 'toy-penguin');
    const itemCell = {
      col: Math.floor(penguinPathSidePosition.x / MAP_TILE_SIZE),
      row: Math.floor(penguinPathSidePosition.y / MAP_TILE_SIZE),
    };
    const nearestPathDistance = Math.min(
      ...pathCells.map((cell) => Math.abs(cell.col - itemCell.col) + Math.abs(cell.row - itemCell.row)),
    );
    const blockingDecorCells = new Set([
      ...treePlacements.map((placement) => `${placement.col},${placement.row}`),
      ...grassOverlayPlacements.filter((placement) => placement.blocksMovement).map((placement) => `${placement.col},${placement.row}`),
    ]);

    expect(pathFriend).toEqual(
      expect.objectContaining({
        category: 'toy',
        x: penguinPathSidePosition.x,
        y: penguinPathSidePosition.y,
      }),
    );
    expect(nearestPathDistance).toBeLessThanOrEqual(2);
    expect(blockingDecorCells.has(`${itemCell.col},${itemCell.row}`)).toBe(false);
  });
  it('places CaveGuide at the bottom-center cave entrance', () => {
    const caveGuide = memoryItems.find((item) => item.id === 'toy-bear');
    const center = areaCenters['toy-bear'];

    expect(caveGuide).toBeDefined();
    expect(caveGuide).toEqual(
      expect.objectContaining({
        category: 'toy',
        x: center.x,
        y: center.y + AREA_HEIGHT / 2 - MAP_TILE_SIZE * 2,
      }),
    );
    expect({ x: caveGuide?.x, y: caveGuide?.y }).not.toEqual({
      x: center.x + AREA_WIDTH / 2 - MAP_TILE_SIZE / 2,
      y: center.y,
    });
  });

  it('places Garden at the center of her garden area', () => {
    const garden = memoryItems.find((item) => item.id === 'toy-marshmallow');
    const center = areaCenters['toy-marshmallow'];

    expect(garden).toEqual(
      expect.objectContaining({
        category: 'toy',
        x: center.x,
        y: center.y,
      }),
    );
  });

  it('places the Star of Food in the middle of the food table', () => {
    const foodStar = memoryItems.find((item) => item.id === 'star-food');

    expect(foodStar).toEqual(expect.objectContaining(foodTableStarPosition));
    expect(foodStar?.y).toBeLessThan(areaCenters['star-food'].y);
  });

  it('places HiddenMascot to the left of the adventure maze area', () => {
    const hiddenMascot = memoryItems.find((item) => item.id === 'easter-cow');

    expect(hiddenMascot).toEqual(expect.objectContaining(cowEasterEggPosition));
    expect(cowEasterEggPosition.x).toBeLessThan(areaCenters['star-adventure'].x - AREA_WIDTH / 2);
    expect(Math.abs(cowEasterEggPosition.y - areaCenters['star-adventure'].y)).toBeLessThan(AREA_HEIGHT / 2);
  });
});
