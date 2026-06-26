import { describe, expect, it } from 'vitest';
import { getPlayerAnimationFrame } from './playerAnimation';

describe('player animation', () => {
  it('uses forward sprites for downward movement', () => {
    expect(getPlayerAnimationFrame({ x: 0, y: 190 }, 'back', false, 0)).toEqual({
      textureKey: 'player-forward-walk-1',
      direction: 'forward',
      flipX: false,
    });
    expect(getPlayerAnimationFrame({ x: 0, y: 190 }, 'back', false, 250).textureKey).toBe('player-forward-walk-2');
    expect(getPlayerAnimationFrame({ x: 0, y: 190 }, 'back', false, 500).textureKey).toBe('player-forward-walk-1');
  });

  it('uses back sprites for upward movement', () => {
    expect(getPlayerAnimationFrame({ x: 0, y: -190 }, 'forward', false, 0)).toEqual({
      textureKey: 'player-back-walk-1',
      direction: 'back',
      flipX: false,
    });
  });

  it('uses side sprites and flips only for left movement', () => {
    expect(getPlayerAnimationFrame({ x: 190, y: 0 }, 'forward', true, 0)).toEqual({
      textureKey: 'player-side-walk-1',
      direction: 'side',
      flipX: false,
    });
    expect(getPlayerAnimationFrame({ x: -190, y: 0 }, 'forward', false, 0)).toEqual({
      textureKey: 'player-side-walk-1',
      direction: 'side',
      flipX: true,
    });
  });

  it('uses standing sprite for the last movement direction when idle', () => {
    expect(getPlayerAnimationFrame({ x: 0, y: 0 }, 'side', true, 1200)).toEqual({
      textureKey: 'player-side-standing',
      direction: 'side',
      flipX: true,
    });
  });

  it('prioritizes vertical direction during diagonal movement', () => {
    expect(getPlayerAnimationFrame({ x: -190, y: -190 }, 'side', true, 0)).toEqual({
      textureKey: 'player-back-walk-1',
      direction: 'back',
      flipX: false,
    });
  });
});
