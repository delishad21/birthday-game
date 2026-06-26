import { useEffect, useMemo, useRef, useState } from 'react';
import {
  arePhotosChronological,
  memoryPhotoAssets,
  pickMemoryPhotoRound,
  reorderPhotoIds,
  type MemoryPhotoAsset,
} from '../game/data/memoryPhotoMinigame';

const ROUND_SIZE = 6;
const START_EVENT = 'memory-photo-minigame:start';
const COMPLETE_EVENT = 'memory-photo-minigame:complete';
const CANCEL_EVENT = 'memory-photo-minigame:cancel';
const SKIP_FAILURE_THRESHOLD = 1;

const getOrderedPhotos = (photos: MemoryPhotoAsset[], order: string[]) =>
  order
    .map((photoId) => photos.find((photo) => photo.id === photoId))
    .filter((photo): photo is MemoryPhotoAsset => Boolean(photo));

export default function MemoryPhotoOverlay() {
  const [photos, setPhotos] = useState<MemoryPhotoAsset[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [status, setStatus] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [dropIndex, setDropIndex] = useState<number | undefined>();
  const draggedIdRef = useRef<string | undefined>(undefined);
  const completeTimerRef = useRef<number | undefined>(undefined);

  const orderedPhotos = useMemo(() => getOrderedPhotos(photos, order), [order, photos]);

  const startRound = (resetFailures = false) => {
    const selectedPhotos = pickMemoryPhotoRound(memoryPhotoAssets, ROUND_SIZE);
    setPhotos(selectedPhotos);
    setOrder(selectedPhotos.map((photo) => photo.id));
    setIsRevealed(false);
    setStatus('');
    setDropIndex(undefined);
    if (resetFailures) {
      setFailedAttempts(0);
    }
  };

  const exitMinigame = () => {
    setPhotos([]);
    setOrder([]);
    setIsRevealed(false);
    setStatus('');
    setDropIndex(undefined);
    setFailedAttempts(0);
    window.dispatchEvent(new CustomEvent(CANCEL_EVENT));
  };

  useEffect(() => {
    const onStart = () => startRound(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        exitMinigame();
      }
    };
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener('keydown', onKeyDown);
      if (completeTimerRef.current !== undefined) {
        window.clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  if (photos.length === 0) {
    return null;
  }

  const dropDraggedPhoto = (insertionIndex: number) => {
    const draggedId = draggedIdRef.current;
    draggedIdRef.current = undefined;
    setDropIndex(undefined);
    if (!draggedId) {
      return;
    }
    setOrder((currentOrder) => reorderPhotoIds(currentOrder, draggedId, insertionIndex));
  };

  const submitOrder = () => {
    setIsRevealed(true);
    if (arePhotosChronological(orderedPhotos)) {
      setStatus('Correct! The Star of Moments returns.');
      completeTimerRef.current = window.setTimeout(() => {
        setPhotos([]);
        window.dispatchEvent(new CustomEvent(COMPLETE_EVENT));
      }, 800);
      return;
    }
    setFailedAttempts((currentAttempts) => {
      const nextAttempts = currentAttempts + 1;
      setStatus(`Not quite. Check the dates, then try a fresh set. Failed attempts ${nextAttempts}/${SKIP_FAILURE_THRESHOLD}.`);
      return nextAttempts;
    });
  };

  const skipChallenge = () => {
    setPhotos([]);
    setOrder([]);
    setIsRevealed(false);
    setStatus('');
    setDropIndex(undefined);
    setFailedAttempts(0);
    window.dispatchEvent(new CustomEvent(COMPLETE_EVENT));
  };

  return (
    <div className="memory-photo-overlay" role="dialog" aria-modal="true" aria-labelledby="memory-photo-title">
      <section className="memory-photo-panel">
        <div className="memory-photo-header">
          <p className="eyebrow">Star Challenge</p>
          <h2 id="memory-photo-title">Memory Timeline</h2>
          <p>Drag photos between cards so they read oldest to newest. Press Esc to leave.</p>
        </div>

        <div
          className="memory-photo-grid memory-photo-grid-single-row"
          onDragOver={(event) => {
            if (!isRevealed && draggedIdRef.current) {
              event.preventDefault();
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            dropDraggedPhoto(dropIndex ?? order.length);
          }}
        >
          {orderedPhotos.map((photo, index) => (
            <article
              className={`memory-photo-card${dropIndex === index ? ' drop-before' : ''}${dropIndex === index + 1 ? ' drop-after' : ''}`}
              draggable={!isRevealed}
              key={photo.id}
              onDragStart={(event) => {
                draggedIdRef.current = photo.id;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', photo.id);
              }}
              onDragEnd={() => setDropIndex(undefined)}
              onDragOver={(event) => {
                if (isRevealed) return;
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                setDropIndex(index + (event.clientX > rect.left + rect.width / 2 ? 1 : 0));
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const rect = event.currentTarget.getBoundingClientRect();
                dropDraggedPhoto(index + (event.clientX > rect.left + rect.width / 2 ? 1 : 0));
              }}
            >
              <div className="memory-photo-frame">
                <img src={photo.path} alt="Memory to arrange" draggable={false} />
              </div>
              <p className="memory-photo-date">{isRevealed ? photo.displayDate : 'Date hidden'}</p>
            </article>
          ))}
        </div>

        <p className="memory-photo-status" aria-live="polite">{status}</p>
        <div className="memory-photo-actions">
          {!isRevealed && <button type="button" onClick={submitOrder}>Submit</button>}
          {isRevealed && !arePhotosChronological(orderedPhotos) && <button type="button" onClick={() => startRound(false)}>Retry</button>}
          {failedAttempts >= SKIP_FAILURE_THRESHOLD && <button type="button" onClick={skipChallenge}>Skip Challenge</button>}
        </div>
      </section>
    </div>
  );
}
