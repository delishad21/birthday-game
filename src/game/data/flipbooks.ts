import type { MemoryPhotoAsset } from './memoryPhotoMinigame';

export type FlipbookId = 'laughter' | 'moments' | 'food' | 'adventure' | 'final';

export interface FlipbookPage {
  id: string;
  imagePath?: string;
  videoPath?: string;
  label: string;
  description: string;
  date?: string;
}

export interface FinalFlipbookNote {
  body: string;
  continueLabel: string;
}

export interface FlipbookDefinition {
  id: FlipbookId;
  title: string;
  pages: FlipbookPage[];
  finalNote?: FinalFlipbookNote;
}

const firstPlaceholderDescriptions: Record<Exclude<FlipbookId, 'final'>, string> = {
  laughter:
    'This is a placeholder description. The game was for the laughter star, so ideally, you can populate this popup with images and videos that show funny and joyful moments of the relationship.',
  moments:
    'This is a placeholder description. The game was for the moments star, so ideally, you can populate this popup with images and videos that show meaningful milestones and favorite memories from the relationship.',
  food:
    'This is a placeholder description. The game was for the food star, so ideally, you can populate this popup with images and videos that show meals, snacks, cafes, and food moments from the relationship.',
  adventure:
    'This is a placeholder description. The game was for the adventure star, so ideally, you can populate this popup with images and videos that show trips, walks, explorations, and shared adventures from the relationship.',
};

const makePlaceholderPage = (section: Exclude<FlipbookId, 'final'>, index: number): FlipbookPage => ({
  id: `${section}-${index}`,
  imagePath: `/portfolio-media/flipbooks/${section}-${index}.svg`,
  label: `[Title ${index}]`,
  description: index === 1 ? firstPlaceholderDescriptions[section] : `[Description ${index}]`,
  date: `[Date ${index}]`,
});

const makePlaceholderPages = (section: Exclude<FlipbookId, 'final'>): FlipbookPage[] =>
  [1, 2, 3, 4].map((index) => makePlaceholderPage(section, index));

export const flipbooks: Record<FlipbookId, FlipbookDefinition> = {
  laughter: {
    id: 'laughter',
    title: 'Playful Memories',
    pages: makePlaceholderPages('laughter'),
  },
  moments: {
    id: 'moments',
    title: 'Star of Moments',
    pages: makePlaceholderPages('moments'),
  },
  food: {
    id: 'food',
    title: 'Food Memories',
    pages: makePlaceholderPages('food'),
  },
  adventure: {
    id: 'adventure',
    title: 'Adventure Memories',
    pages: makePlaceholderPages('adventure'),
  },
  final: {
    id: 'final',
    title: 'Inside The Gift Box',
    pages: [],
    finalNote: {
      body: `You have reached the final note of the game.

This is where you can write a final, personalized message to the recipient of the game.

This portfolio edition replaces the original private images, videos, audio, and messages with neutral placeholders. Feel free to replace the text, add your own media, and adapt the flipbooks for your own story.

`,
      continueLabel: 'Continue',
    },
  },
};

export const createMomentFlipbookPages = (photos: MemoryPhotoAsset[]): FlipbookPage[] =>
  photos.map((photo) => ({
    id: photo.id,
    imagePath: photo.path,
    label: photo.label ?? photo.filename,
    date: photo.displayDate,
    description: photo.description ?? `A key moment from ${photo.displayDate}.`,
  }));
