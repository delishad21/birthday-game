import { describe, expect, it } from 'vitest';
import { laughterDanceBeatmap, laughterDanceMaxMisses, laughterDancePreSongBufferMs, laughterDanceInstruction, laughterDanceSong } from './laughterDance';

describe('laughter dance beatmap', () => {
  it('uses the public chacha song asset and trimmed beatmap notes', () => {
    expect(laughterDanceSong).toEqual({ key: 'laughter-dance-song', path: '/portfolio-media/chacha-no-star.mp3' });
    expect(laughterDanceBeatmap).toHaveLength(112);
    expect(laughterDanceBeatmap[0]).toEqual({ timeMs: 0, direction: 'left' });
    expect(laughterDanceBeatmap.at(-1)).toEqual({ timeMs: 32588, direction: 'up' });
    expect(laughterDanceBeatmap.every((note) => note.timeMs + 180 <= 32928)).toBe(true);
  });

  it('keeps simultaneous notes for chord moments', () => {
    expect(laughterDanceBeatmap.filter((note) => note.timeMs === 17810).map((note) => note.direction)).toEqual(['left', 'up', 'right']);
    expect(laughterDanceBeatmap.filter((note) => note.timeMs === 27241).map((note) => note.direction)).toEqual(['left', 'up', 'right']);
  });

  it('defines a pre-song instruction and buffer delay', () => {
    expect(laughterDancePreSongBufferMs).toBe(3000);
    expect(laughterDanceMaxMisses).toBe(20);
    expect(laughterDanceInstruction).toBe('Successfully complete the farewell dance to collect the Star of Laughter.');
  });
});
