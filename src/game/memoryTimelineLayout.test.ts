import { describe, expect, it } from 'vitest';
import gameSceneSource from './GameScene.ts?raw';

describe('memory timeline layout', () => {
  it('places all memory photo slots in one horizontal row', () => {
    const positionsSource = gameSceneSource.match(/const MEMORY_PHOTO_SLOT_POSITIONS = \[([\s\S]*?)\] as const;/)?.[1] ?? '';
    const yValues = [...positionsSource.matchAll(/y: (\d+)/g)].map((match) => Number(match[1]));

    expect(yValues).toHaveLength(6);
    expect(new Set(yValues)).toEqual(new Set([284]));
  });
});
