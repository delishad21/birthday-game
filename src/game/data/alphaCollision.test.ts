import { describe, expect, it } from 'vitest';
import {
  getAlphaStripBlockingBodies,
  getBlockingLayerDepth,
  getPaddedLayerPlacement,
} from './alphaCollision';

const placement = { x: 500, y: 400, width: 1200, height: 750 };

describe('alpha collision helpers', () => {
  it('places a padded layer using scaled source bounds', () => {
    expect(getPaddedLayerPlacement(placement, { minX: 100, minY: 120, maxX: 299, maxY: 319 }, { width: 1200, height: 751 })).toEqual({
      x: 500,
      y: 400,
      width: 1200,
      height: 750,
      visibleBottomY: 400 - 750 / 2 + (320 / 751) * 750,
    });
  });

  it('builds trimmed alpha strip collision bodies for disconnected segments', () => {
    const rows = [
      { y: 0, segments: [{ minX: 10, maxX: 30 }] },
      { y: 8, segments: [{ minX: 8, maxX: 32 }, { minX: 80, maxX: 88 }] },
      { y: 16, segments: [{ minX: 6, maxX: 34 }] },
    ];

    expect(getAlphaStripBlockingBodies(placement, rows, { width: 1200, height: 751 }, 8, 8)).toEqual([
      {
        x: 500 - 1200 / 2 + 20.5,
        y: expect.closeTo(400 - 750 / 2 + (12 / 751) * 750),
        width: 25,
        height: expect.closeTo(8 * (750 / 751)),
      },
      {
        x: 500 - 1200 / 2 + 84.5,
        y: expect.closeTo(400 - 750 / 2 + (12 / 751) * 750),
        width: 9,
        height: expect.closeTo(8 * (750 / 751)),
      },
      {
        x: 500 - 1200 / 2 + 20.5,
        y: expect.closeTo(400 - 750 / 2 + (20 / 751) * 750),
        width: 29,
        height: expect.closeTo(8 * (750 / 751)),
      },
    ]);
  });

  it('clips strips from an exact visible top pixel', () => {
    const rows = [
      { y: 200, segments: [{ minX: 10, maxX: 30 }] },
      { y: 208, segments: [{ minX: 8, maxX: 32 }] },
    ];

    expect(getAlphaStripBlockingBodies(placement, rows, { width: 1200, height: 751 }, 8, 8, 203)).toEqual([
      {
        x: 500 - 1200 / 2 + 20.5,
        y: expect.closeTo(400 - 750 / 2 + (213.5 / 751) * 750),
        width: 25,
        height: expect.closeTo(5 * (750 / 751)),
      },
    ]);
  });

  it('sorts blocking layers by front edge with player and area shifts', () => {
    expect(
      getBlockingLayerDepth(
        [
          { x: 100, y: 200, width: 20, height: 8 },
          { x: 100, y: 212, width: 20, height: 8 },
        ],
        260,
        19.5,
        15,
      ),
    ).toBe(181.5);
  });
});
