export type DdrDirection = 'left' | 'down' | 'up' | 'right';

export interface BeatmapNote {
  id: string;
  timeMs: number;
  direction: DdrDirection;
}

export type Judgement =
  | { result: 'hit'; noteId: string; deltaMs: number }
  | { result: 'miss' };

export type DdrInputKeys = Partial<Record<DdrDirection | 'z' | 'x' | 'period' | 'slash', boolean>>;

const directions = new Set<DdrDirection>(['left', 'down', 'up', 'right']);

const sortNotes = (notes: BeatmapNote[]) =>
  [...notes].sort((a, b) => a.timeMs - b.timeMs || directionOrder(a.direction) - directionOrder(b.direction) || a.id.localeCompare(b.id));

const directionOrder = (direction: DdrDirection) => ['left', 'down', 'up', 'right'].indexOf(direction);

const makeNoteId = (timeMs: number, direction: DdrDirection, existingNotes: BeatmapNote[]) => {
  let suffix = 0;
  let id = `${timeMs}-${direction}-${suffix}`;
  const ids = new Set(existingNotes.map((note) => note.id));
  while (ids.has(id)) {
    suffix += 1;
    id = `${timeMs}-${direction}-${suffix}`;
  }
  return id;
};

export const addBeatmapNote = (notes: BeatmapNote[], timeMs: number, direction: DdrDirection) => {
  const roundedTime = Math.max(0, Math.round(timeMs));
  return sortNotes([
    ...notes,
    {
      id: makeNoteId(roundedTime, direction, notes),
      timeMs: roundedTime,
      direction,
    },
  ]);
};

export const updateBeatmapNote = (notes: BeatmapNote[], id: string, changes: Partial<Pick<BeatmapNote, 'timeMs' | 'direction'>>) =>
  sortNotes(
    notes.map((note) =>
      note.id === id
        ? {
            ...note,
            ...changes,
            timeMs: changes.timeMs === undefined ? note.timeMs : Math.max(0, Math.round(changes.timeMs)),
          }
        : note,
    ),
  );

export const nudgeBeatmapNote = (notes: BeatmapNote[], id: string, deltaMs: number) =>
  updateBeatmapNote(notes, id, { timeMs: (notes.find((note) => note.id === id)?.timeMs ?? 0) + deltaMs });

export const deleteBeatmapNote = (notes: BeatmapNote[], id: string) => notes.filter((note) => note.id !== id);

export const formatBeatmapJson = (notes: BeatmapNote[]) =>
  JSON.stringify(
    sortNotes(notes).map(({ timeMs, direction }) => ({ timeMs, direction })),
    null,
    2,
  );

export const parseBeatmapJson = (json: string) => {
  const parsed = JSON.parse(json) as Array<{ timeMs: number; direction: string }>;
  return parsed.reduce<BeatmapNote[]>((notes, note) => {
    if (!directions.has(note.direction as DdrDirection) || !Number.isFinite(note.timeMs)) {
      return notes;
    }
    return addBeatmapNote(notes, note.timeMs, note.direction as DdrDirection);
  }, []);
};

export const getActiveNotes = (notes: BeatmapNote[], currentTimeMs: number, leadTimeMs: number) =>
  sortNotes(notes).filter((note) => note.timeMs >= currentTimeMs && note.timeMs <= currentTimeMs + leadTimeMs);

export const getDdrDirectionsForInputKeys = (keys: DdrInputKeys): DdrDirection[] => {
  const pressed = new Set<DdrDirection>();
  if (keys.left || keys.z) pressed.add('left');
  if (keys.down || keys.x) pressed.add('down');
  if (keys.up || keys.period) pressed.add('up');
  if (keys.right || keys.slash) pressed.add('right');
  return ['left', 'down', 'up', 'right'].filter((direction) => pressed.has(direction as DdrDirection)) as DdrDirection[];
};

export const judgeBeatmapInput = (
  notes: BeatmapNote[],
  hitNoteIds: Set<string>,
  inputTimeMs: number,
  direction: DdrDirection,
  hitWindowMs: number,
): Judgement => {
  const matchingNotes = notes
    .filter((note) => note.direction === direction && !hitNoteIds.has(note.id))
    .map((note) => ({ note, deltaMs: inputTimeMs - note.timeMs, absoluteDeltaMs: Math.abs(inputTimeMs - note.timeMs) }))
    .filter(({ absoluteDeltaMs }) => absoluteDeltaMs <= hitWindowMs)
    .sort((a, b) => a.absoluteDeltaMs - b.absoluteDeltaMs);

  const best = matchingNotes[0];
  return best ? { result: 'hit', noteId: best.note.id, deltaMs: best.deltaMs } : { result: 'miss' };
};

export const getMissedNoteIds = (notes: BeatmapNote[], hitNoteIds: Set<string>, currentTimeMs: number, missWindowMs: number) =>
  sortNotes(notes)
    .filter((note) => !hitNoteIds.has(note.id) && note.timeMs + missWindowMs < currentTimeMs)
    .map((note) => note.id);

export const isBeatmapPastFinalNote = (notes: BeatmapNote[], currentTimeMs: number, missWindowMs: number) => {
  const finalNote = sortNotes(notes).at(-1);
  return finalNote ? finalNote.timeMs + missWindowMs < currentTimeMs : currentTimeMs >= 0;
};
