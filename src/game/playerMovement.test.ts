import { describe, expect, it } from 'vitest';
import { PLAYER_SPEED, SPRINT_MULTIPLIER, getPlayerMoveSpeed } from './playerMovement';

describe('player movement', () => {
  it('uses normal speed when sprint is not held', () => {
    expect(PLAYER_SPEED).toBe(190);
    expect(getPlayerMoveSpeed(false)).toBe(190);
  });

  it('uses a 1.6x speed multiplier while sprinting', () => {
    expect(SPRINT_MULTIPLIER).toBe(1.6);
    expect(getPlayerMoveSpeed(true)).toBe(304);
  });
});
