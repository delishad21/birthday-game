export const PLAYER_SPEED = 190;
export const SPRINT_MULTIPLIER = 1.6;

export const getPlayerMoveSpeed = (isSprinting: boolean) => PLAYER_SPEED * (isSprinting ? SPRINT_MULTIPLIER : 1);
