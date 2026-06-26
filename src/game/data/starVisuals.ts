export const finalGiftStarHoleAsset = {
  key: 'final-star-holes',
  path: '/special-area/gift-area/Star Holes.png',
} as const;

export const starVisualsById = {
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
} as const;

export type StarVisualId = keyof typeof starVisualsById;

export const finalGiftToyPlacements = {
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
} as const;

export type FinalGiftToyId = keyof typeof finalGiftToyPlacements;
