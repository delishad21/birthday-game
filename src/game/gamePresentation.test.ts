import { describe, expect, it } from 'vitest';
import { MAP_TILE_SIZE, MAP_WORLD_HEIGHT } from './data/mapLayout';
import {
  CAVE_GUIDE_DISPLAY_SIZE,
  CAMERA_ZOOM,
  GARDEN_KEEPER_DISPLAY_SIZE,
  COLLECTED_ITEM_DISPLAY_SCALE,
  FINAL_GIFT_FOOTPRINT_SIZE,
  FINAL_GIFT_VISUAL_SIZE,
  GAME_VIEW_HEIGHT,
  GAME_VIEW_WIDTH,
  getCollectedItemDisplaySize,
  HUD_DEPTH,
  PLAYER_DISPLAY_HEIGHT,
  PLAYER_DISPLAY_WIDTH,
  PLAYER_HITBOX_HEIGHT,
  PLAYER_HITBOX_OFFSET_X,
  PLAYER_HITBOX_OFFSET_Y,
  PLAYER_HITBOX_WIDTH,
  STAR_DISPLAY_SIZE,
  STAR_FLOAT_DISTANCE,
  TREE_VISUAL_DEPTH_OFFSET,
  UI_SCALE,
  UI_CAMERA_ZOOM,
} from './gamePresentation';

describe('game presentation constants', () => {
  it('renders at double the original internal resolution while preserving world composition', () => {
    expect(GAME_VIEW_WIDTH).toBe(1920);
    expect(GAME_VIEW_HEIGHT).toBe(1080);
    expect(CAMERA_ZOOM).toBe(1.3);
    expect(GAME_VIEW_WIDTH / CAMERA_ZOOM).toBeCloseTo(960 / 0.65);
    expect(GAME_VIEW_HEIGHT / CAMERA_ZOOM).toBeCloseTo(540 / 0.65);
  });

  it('scales fixed UI to keep the same relative layout at higher resolution', () => {
    expect(UI_SCALE).toBe(2);
  });

  it('keeps fixed HUD above world-depth props like trees', () => {
    expect(HUD_DEPTH).toBeGreaterThan(MAP_WORLD_HEIGHT + TREE_VISUAL_DEPTH_OFFSET);
  });

  it('uses a large player scale for the provided sprite art', () => {
    expect(PLAYER_DISPLAY_WIDTH).toBe(84);
    expect(PLAYER_DISPLAY_HEIGHT).toBe(89);
  });

  it('keeps the player hitbox small and centered at the feet', () => {
    expect(PLAYER_HITBOX_WIDTH).toBe(MAP_TILE_SIZE / 2);
    expect(PLAYER_HITBOX_HEIGHT).toBe(MAP_TILE_SIZE / 2);
    expect(PLAYER_HITBOX_OFFSET_X).toBe(30);
    expect(PLAYER_HITBOX_OFFSET_Y).toBe(64);
  });

  it('keeps trees behind the player until the hitbox front reaches their collision body', () => {
    const playerDepthToHitboxFrontOffset = PLAYER_HITBOX_OFFSET_Y - PLAYER_DISPLAY_HEIGHT / 2;

    expect(TREE_VISUAL_DEPTH_OFFSET).toBe(playerDepthToHitboxFrontOffset + 1);
  });

  it('keeps fixed UI on an unzoomed camera', () => {
    expect(UI_CAMERA_ZOOM).toBe(1);
  });

  it('uses native-size final gift images with a one-tile footprint', () => {
    expect(FINAL_GIFT_VISUAL_SIZE).toBe(150);
    expect(FINAL_GIFT_FOOTPRINT_SIZE).toBe(MAP_TILE_SIZE);
  });

  it('uses compact Toy sprite sizes', () => {
    expect(CAVE_GUIDE_DISPLAY_SIZE).toBe(60);
    expect(GARDEN_KEEPER_DISPLAY_SIZE).toBe(60);
  });

  it('shrinks collected Toy residue from displayed size instead of raw texture scale', () => {
    expect(CAVE_GUIDE_DISPLAY_SIZE * COLLECTED_ITEM_DISPLAY_SCALE).toBeCloseTo(46.8);
    expect(GARDEN_KEEPER_DISPLAY_SIZE * COLLECTED_ITEM_DISPLAY_SCALE).toBeCloseTo(46.8);
    expect(getCollectedItemDisplaySize(CAVE_GUIDE_DISPLAY_SIZE)).toBeCloseTo(46.8);
    expect(getCollectedItemDisplaySize(GARDEN_KEEPER_DISPLAY_SIZE)).toBeCloseTo(46.8);
  });

  it('uses image stars with a subtle floating motion', () => {
    expect(STAR_DISPLAY_SIZE).toBe(64);
    expect(STAR_FLOAT_DISTANCE).toBe(6);
    expect(getCollectedItemDisplaySize(STAR_DISPLAY_SIZE)).toBeCloseTo(49.92);
  });
});
