import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addBeatmapNote,
  deleteBeatmapNote,
  formatBeatmapJson,
  getActiveNotes,
  judgeBeatmapInput,
  parseBeatmapJson,
  updateBeatmapNote,
  type BeatmapNote,
  type DdrDirection,
} from '../game/ddr/beatmap';

const SONG_PATH = '/portfolio-media/chacha-no-star.mp3';
const PREVIEW_LEAD_TIME_MS = 1800;
const HIT_WINDOW_MS = 140;
const CHORD_SNAP_WINDOW_MS = 45;
const keyToDirection: Record<string, DdrDirection | undefined> = {
  ArrowLeft: 'left',
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowRight: 'right',
};
const directionLabels: Record<DdrDirection, string> = {
  left: '←',
  down: '↓',
  up: '↑',
  right: '→',
};
const directions: DdrDirection[] = ['left', 'down', 'up', 'right'];

type ToolMode = 'record' | 'playtest';

export default function BeatmapEditor() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const notesRef = useRef<BeatmapNote[]>([]);
  const modeRef = useRef<ToolMode>('record');
  const lastRecordedTimeRef = useRef<number | undefined>(undefined);
  const hitNoteIdsRef = useRef<Set<string>>(new Set());
  const [notes, setNotes] = useState<BeatmapNote[]>([]);
  const [mode, setMode] = useState<ToolMode>('record');
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [jsonDraft, setJsonDraft] = useState('[]');
  const [status, setStatus] = useState('Press Play, then tap arrow keys to record notes.');
  const [hitNoteIds, setHitNoteIds] = useState<Set<string>>(new Set());
  const [missCount, setMissCount] = useState(0);
  const [lastJudgement, setLastJudgement] = useState('');

  useEffect(() => {
    notesRef.current = notes;
    setJsonDraft(formatBeatmapJson(notes));
  }, [notes]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTimeMs(Math.round(audio.currentTime * 1000));
        setIsPlaying(!audio.paused);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = keyToDirection[event.key];
      if (!direction || event.repeat) {
        return;
      }

      const audio = audioRef.current;
      if (!audio || audio.paused) {
        return;
      }

      event.preventDefault();
      const rawTimeMs = Math.round(audio.currentTime * 1000);

      if (modeRef.current === 'record') {
        const previousTime = lastRecordedTimeRef.current;
        const timeMs = previousTime !== undefined && Math.abs(rawTimeMs - previousTime) <= CHORD_SNAP_WINDOW_MS
          ? previousTime
          : rawTimeMs;
        lastRecordedTimeRef.current = timeMs;
        setNotes((currentNotes) => addBeatmapNote(currentNotes, timeMs, direction));
        setStatus(`Recorded ${direction} at ${timeMs}ms.`);
        return;
      }

      const judgement = judgeBeatmapInput(notesRef.current, hitNoteIdsRef.current, rawTimeMs, direction, HIT_WINDOW_MS);
      if (judgement.result === 'hit') {
        const nextHitIds = new Set(hitNoteIdsRef.current).add(judgement.noteId);
        hitNoteIdsRef.current = nextHitIds;
        setHitNoteIds(nextHitIds);
        setLastJudgement(`Hit ${direction} (${judgement.deltaMs >= 0 ? '+' : ''}${judgement.deltaMs}ms)`);
      } else {
        setMissCount((count) => count + 1);
        setLastJudgement(`Miss ${direction}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeNotes = useMemo(() => getActiveNotes(notes, currentTimeMs, PREVIEW_LEAD_TIME_MS), [currentTimeMs, notes]);
  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const play = async () => {
    await audioRef.current?.play();
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const restart = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    lastRecordedTimeRef.current = undefined;
    resetPlaytest();
    await audio.play();
  };

  const resetPlaytest = () => {
    hitNoteIdsRef.current = new Set();
    setHitNoteIds(new Set());
    setMissCount(0);
    setLastJudgement('');
  };

  const loadJsonDraft = () => {
    try {
      const parsedNotes = parseBeatmapJson(jsonDraft);
      setNotes(parsedNotes);
      setSelectedNoteId(undefined);
      setStatus(`Loaded ${parsedNotes.length} notes from JSON.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not parse JSON.');
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(formatBeatmapJson(notes));
    setStatus('Copied beatmap JSON.');
  };

  const updateSelectedNote = (changes: Partial<Pick<BeatmapNote, 'timeMs' | 'direction'>>) => {
    if (!selectedNoteId) {
      return;
    }
    setNotes((currentNotes) => updateBeatmapNote(currentNotes, selectedNoteId, changes));
  };

  return (
    <main className="beatmap-editor">
      <section className="beatmap-panel beatmap-hero">
        <div>
          <p className="eyebrow">DDR Beatmap Tool</p>
          <h1>Demo Beat Editor</h1>
          <p>Record arrow keys, edit timestamps, then playtest the same beatmap timing logic the game will use later.</p>
        </div>
        <a className="back-link" href="/">Back to game</a>
      </section>

      <section className="beatmap-panel transport-panel">
        <audio ref={audioRef} controls src={SONG_PATH} onEnded={() => setIsPlaying(false)} />
        <div className="tool-row">
          <button type="button" onClick={play}>Play</button>
          <button type="button" onClick={pause}>Pause</button>
          <button type="button" onClick={restart}>Restart</button>
          <button type="button" onClick={() => setNotes((currentNotes) => currentNotes.slice(0, -1))}>Undo Note</button>
          <button type="button" onClick={() => { setNotes([]); setSelectedNoteId(undefined); }}>Clear</button>
        </div>
        <div className="mode-switch" role="group" aria-label="Beatmap mode">
          <button type="button" className={mode === 'record' ? 'active' : ''} onClick={() => setMode('record')}>Record</button>
          <button type="button" className={mode === 'playtest' ? 'active' : ''} onClick={() => { setMode('playtest'); resetPlaytest(); }}>Playtest</button>
        </div>
        <p className="beatmap-status">
          {isPlaying ? 'Playing' : 'Paused'} at {currentTimeMs}ms · {notes.length} notes · {status}
        </p>
      </section>

      <section className="beatmap-stage beatmap-panel">
        <div className="target-row">
          {directions.map((direction) => <div key={direction} className="target-hole">{directionLabels[direction]}</div>)}
        </div>
        <div className="lanes">
          {directions.map((direction) => (
            <div key={direction} className="lane">
              {activeNotes.filter((note) => note.direction === direction).map((note) => {
                const progress = 1 - (note.timeMs - currentTimeMs) / PREVIEW_LEAD_TIME_MS;
                return (
                  <button
                    key={note.id}
                    type="button"
                    className={`falling-note ${hitNoteIds.has(note.id) ? 'hit' : ''}`}
                    style={{ top: `${Math.max(8, Math.min(90, progress * 88))}%` }}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    {directionLabels[direction]}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="judgement-line">{mode === 'playtest' ? `${lastJudgement || 'Press arrows as notes hit the holes.'} · Hits ${hitNoteIds.size}/${notes.length} · Misses ${missCount}` : 'Record mode: tap arrow keys while the song plays. Press two arrows together to make a chord.'}</p>
      </section>

      <section className="beatmap-grid">
        <div className="beatmap-panel note-list-panel">
          <h2>Notes</h2>
          <div className="note-list">
            {notes.map((note) => (
              <button key={note.id} type="button" className={note.id === selectedNoteId ? 'selected note-row' : 'note-row'} onClick={() => setSelectedNoteId(note.id)}>
                <span>{note.timeMs}ms</span>
                <strong>{directionLabels[note.direction]} {note.direction}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="beatmap-panel edit-panel">
          <h2>Edit Selected Note</h2>
          {selectedNote ? (
            <>
              <label>
                Time ms
                <input type="number" value={selectedNote.timeMs} onChange={(event) => updateSelectedNote({ timeMs: Number(event.target.value) })} />
              </label>
              <label>
                Direction
                <select value={selectedNote.direction} onChange={(event) => updateSelectedNote({ direction: event.target.value as DdrDirection })}>
                  {directions.map((direction) => <option key={direction} value={direction}>{direction}</option>)}
                </select>
              </label>
              <div className="tool-row compact">
                <button type="button" onClick={() => updateSelectedNote({ timeMs: selectedNote.timeMs - 25 })}>-25ms</button>
                <button type="button" onClick={() => updateSelectedNote({ timeMs: selectedNote.timeMs + 25 })}>+25ms</button>
                <button type="button" onClick={() => setNotes((currentNotes) => deleteBeatmapNote(currentNotes, selectedNote.id))}>Delete</button>
              </div>
            </>
          ) : <p>Select a note from the list or the preview lanes.</p>}
        </div>

        <div className="beatmap-panel json-panel">
          <h2>Portable JSON</h2>
          <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} spellCheck={false} />
          <div className="tool-row compact">
            <button type="button" onClick={loadJsonDraft}>Load JSON</button>
            <button type="button" onClick={copyJson}>Copy JSON</button>
          </div>
        </div>
      </section>
    </main>
  );
}
