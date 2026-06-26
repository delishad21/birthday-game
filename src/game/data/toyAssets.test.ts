import { describe, expect, it } from 'vitest';
import { toyImageAssets } from './toyAssets';

describe('Toy image assets', () => {
  it('uses public portfolio toy images', () => {
    expect(toyImageAssets).toEqual({
      bear: { key: 'bear-toy', path: '/toys/bear.png' },
      marshmallow: { key: 'marshmallow-toy', path: '/toys/marshmallow.png' },
      penguin: { key: 'penguin-toy', path: '/toys/penguin.png' },
      cow: { key: 'cow-easter-egg', path: '/toys/cow.png' },
    });
  });
});
