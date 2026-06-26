export const GAME_VIEW_WIDTH = 1920;
export const GAME_VIEW_HEIGHT = 1080;
export const CAMERA_ZOOM = 1.3;
export const UI_SCALE = 2;
export const HUD_DEPTH = 10_000;
export const DIALOGUE_DEPTH = HUD_DEPTH + 100;
export const ENDING_DEPTH = HUD_DEPTH + 200;
export const UI_CAMERA_ZOOM = 1;

export const PLAYER_DISPLAY_WIDTH = 84;
export const PLAYER_DISPLAY_HEIGHT = 89;
export const PLAYER_HITBOX_WIDTH = 25;
export const PLAYER_HITBOX_HEIGHT = 25;
export const PLAYER_HITBOX_OFFSET_X = 30;
export const PLAYER_HITBOX_OFFSET_Y = 64;
export const TREE_VISUAL_DEPTH_OFFSET = PLAYER_HITBOX_OFFSET_Y - PLAYER_DISPLAY_HEIGHT / 2 + 1;
export const FINAL_GIFT_VISUAL_SIZE = 150;
export const FINAL_GIFT_FOOTPRINT_SIZE = 50;
export const CAVE_GUIDE_DISPLAY_SIZE = 60;
export const GARDEN_KEEPER_DISPLAY_SIZE = 60;
export const PATH_FRIEND_DISPLAY_SIZE = 60;
export const HIDDEN_MASCOT_DISPLAY_SIZE = 60;
export const STAR_DISPLAY_SIZE = 64;
export const STAR_FLOAT_DISTANCE = 6;
export const COLLECTED_ITEM_DISPLAY_SCALE = 0.78;

export const getCollectedItemDisplaySize = (displaySize: number) => displaySize * COLLECTED_ITEM_DISPLAY_SCALE;
