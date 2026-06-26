import { describe, expect, it } from 'vitest';
import { finalGiftToyPlacements, starVisualsById, finalGiftStarHoleAsset } from './starVisuals';

describe('star visuals', () => {
  it('maps each collectible star to its world and final-area artwork', () => {
    expect(finalGiftStarHoleAsset).toEqual({
      key: 'final-star-holes',
      path: '/special-area/gift-area/Star Holes.png',
    });

    expect(starVisualsById).toEqual({
      'star-laughter': {
        starKey: 'star-laughter-image',
        starPath: '/stars/yellow star.png',
        filledKey: 'final-star-laughter-filled',
        filledPath: '/special-area/gift-area/Yellow star filled in.png',
      },
      'star-adventure': {
        starKey: 'star-adventure-image',
        starPath: '/stars/blue star.png',
        filledKey: 'final-star-adventure-filled',
        filledPath: '/special-area/gift-area/blue star filled in.png',
      },
      'star-food': {
        starKey: 'star-food-image',
        starPath: '/stars/green star.png',
        filledKey: 'final-star-food-filled',
        filledPath: '/special-area/gift-area/Green Star Filled in.png',
      },
      'star-memories': {
        starKey: 'star-memories-image',
        starPath: '/stars/pink star.png',
        filledKey: 'final-star-memories-filled',
        filledPath: '/special-area/gift-area/Pink Star filled in.png',
      },
    });
  });

  it('places collected Toys beside their matching final-area star spots', () => {
    expect(finalGiftToyPlacements).toEqual({
      'toy-marshmallow': {
        offsetX: -235,
        offsetY: 55,
        displaySize: 60,
      },
      'toy-bear': {
        offsetX: 235,
        offsetY: 55,
        displaySize: 60,
      },
      'toy-penguin': {
        offsetX: 0,
        offsetY: -190,
        displaySize: 60,
      },
    });
  });
});
