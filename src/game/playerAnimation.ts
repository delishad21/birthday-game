export type PlayerDirection = 'forward' | 'back' | 'side';

export interface PlayerVelocity {
  x: number;
  y: number;
}

export interface PlayerAnimationFrame {
  textureKey: string;
  direction: PlayerDirection;
  flipX: boolean;
}

const WALK_FRAME_MS = 250;

export const getPlayerAnimationFrame = (
  velocity: PlayerVelocity,
  lastDirection: PlayerDirection,
  lastFlipX: boolean,
  now: number,
): PlayerAnimationFrame => {
  if (velocity.x === 0 && velocity.y === 0) {
    return {
      textureKey: `player-${lastDirection}-standing`,
      direction: lastDirection,
      flipX: lastDirection === 'side' ? lastFlipX : false,
    };
  }

  const direction: PlayerDirection = velocity.y > 0 ? 'forward' : velocity.y < 0 ? 'back' : 'side';
  const flipX = direction === 'side' ? velocity.x < 0 : false;
  const walkFrame = Math.floor(now / WALK_FRAME_MS) % 2 === 0 ? 'walk-1' : 'walk-2';

  return {
    textureKey: `player-${direction}-${walkFrame}`,
    direction,
    flipX,
  };
};
