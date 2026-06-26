import { describe, expect, it } from 'vitest';
import {
  addBeatmapNote,
  deleteBeatmapNote,
  formatBeatmapJson,
  getActiveNotes,
  getDdrDirectionsForInputKeys,
  isBeatmapPastFinalNote,
  judgeBeatmapInput,
  getMissedNoteIds,
  nudgeBeatmapNote,
  parseBeatmapJson,
  updateBeatmapNote,
  type BeatmapNote,
} from './beatmap';

describe('DDR beatmap utilities', () => {
  it('records and sorts notes by timestamp', () => {
    const notes = addBeatmapNote(addBeatmapNote([], 1200, 'left'), 800, 'up');

    expect(notes).toEqual([
      { id: '800-up-0', timeMs: 800, direction: 'up' },
      { id: '1200-left-0', timeMs: 1200, direction: 'left' },
    ]);
  });

  it('keeps simultaneous notes as separate same-time entries for chords', () => {
    const notes = addBeatmapNote(addBeatmapNote([], 1000, 'left'), 1000, 'up');

    expect(notes).toEqual([
      { id: '1000-left-0', timeMs: 1000, direction: 'left' },
      { id: '1000-up-0', timeMs: 1000, direction: 'up' },
    ]);
  });

  it('updates, nudges, and deletes notes', () => {
    const notes: BeatmapNote[] = [
      { id: 'a', timeMs: 1000, direction: 'left' },
      { id: 'b', timeMs: 1200, direction: 'right' },
    ];

    expect(updateBeatmapNote(notes, 'a', { timeMs: 1300, direction: 'down' })).toEqual([
      { id: 'b', timeMs: 1200, direction: 'right' },
      { id: 'a', timeMs: 1300, direction: 'down' },
    ]);
    expect(nudgeBeatmapNote(notes, 'a', -125)[0]).toEqual({ id: 'a', timeMs: 875, direction: 'left' });
    expect(deleteBeatmapNote(notes, 'b')).toEqual([{ id: 'a', timeMs: 1000, direction: 'left' }]);
  });

  it('parses and formats portable beatmap json', () => {
    const notes = parseBeatmapJson('[{"timeMs":500,"direction":"left"},{"timeMs":250,"direction":"up"}]');

    expect(notes).toEqual([
      { id: '250-up-0', timeMs: 250, direction: 'up' },
      { id: '500-left-0', timeMs: 500, direction: 'left' },
    ]);
    expect(formatBeatmapJson(notes)).toBe('[\n  {\n    "timeMs": 250,\n    "direction": "up"\n  },\n  {\n    "timeMs": 500,\n    "direction": "left"\n  }\n]');
  });

  it('finds active preview notes in a time window', () => {
    const notes: BeatmapNote[] = [
      { id: 'a', timeMs: 1000, direction: 'left' },
      { id: 'b', timeMs: 1800, direction: 'right' },
      { id: 'c', timeMs: 2600, direction: 'up' },
    ];

    expect(getActiveNotes(notes, 1600, 700).map((note) => note.id)).toEqual(['b']);
  });

  it('judges gameplay input using the closest unhit matching note', () => {
    const notes: BeatmapNote[] = [
      { id: 'early', timeMs: 1000, direction: 'left' },
      { id: 'hit', timeMs: 1250, direction: 'left' },
      { id: 'wrong', timeMs: 1260, direction: 'up' },
    ];

    expect(judgeBeatmapInput(notes, new Set(['early']), 1310, 'left', 100)).toEqual({
      result: 'hit',
      noteId: 'hit',
      deltaMs: 60,
    });
    expect(judgeBeatmapInput(notes, new Set(['early']), 1310, 'down', 100)).toEqual({ result: 'miss' });
  });

  it('maps arrow keys and Z/X/./slash keys to DDR directions', () => {
    expect(getDdrDirectionsForInputKeys({ left: true, z: true, slash: true })).toEqual(['left', 'right']);
    expect(getDdrDirectionsForInputKeys({ x: true, period: true })).toEqual(['down', 'up']);
  });

  it('finds unhit notes that are past the miss window', () => {
    const notes: BeatmapNote[] = [
      { id: 'missed', timeMs: 1000, direction: 'left' },
      { id: 'hit', timeMs: 1100, direction: 'up' },
      { id: 'pending', timeMs: 1400, direction: 'right' },
    ];

    expect(getMissedNoteIds(notes, new Set(['hit']), 1250, 100)).toEqual(['missed']);
  });

  it('detects when playback is past the final note miss window', () => {
    const notes: BeatmapNote[] = [
      { id: 'first', timeMs: 1000, direction: 'left' },
      { id: 'final', timeMs: 2000, direction: 'right' },
    ];

    expect(isBeatmapPastFinalNote(notes, 2100, 100)).toBe(false);
    expect(isBeatmapPastFinalNote(notes, 2101, 100)).toBe(true);
  });
});
