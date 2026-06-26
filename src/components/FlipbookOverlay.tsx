import { useEffect, useRef, useState } from 'react';
import { flipbooks, type FinalFlipbookNote, type FlipbookId, type FlipbookPage } from '../game/data/flipbooks';

const OPEN_EVENT = 'flipbook:open';
const CLOSED_EVENT = 'flipbook:closed';

export interface FlipbookOpenDetail {
  flipbookId: FlipbookId;
  pages?: FlipbookPage[];
  title?: string;
}

interface FlipbookOverlayContent {
  flipbookId: FlipbookId;
  pages: FlipbookPage[];
  title: string;
  finalNote?: FinalFlipbookNote;
}

export const resolveFlipbookOverlayContent = (detail: FlipbookOpenDetail): FlipbookOverlayContent => {
  const definition = flipbooks[detail.flipbookId];

  return {
    flipbookId: detail.flipbookId,
    pages: detail.pages ?? definition.pages,
    title: detail.title ?? definition.title,
    finalNote: definition.finalNote,
  };
};

export const setFlipbookOverlayFocus = (
  previousFocus: HTMLElement | null,
  panel: HTMLElement | null,
  closeButton: HTMLElement | null,
) => {
  (closeButton ?? panel)?.focus();
  return previousFocus;
};

export const restoreFlipbookOverlayFocus = (previousFocus: HTMLElement | null) => {
  previousFocus?.focus();
};

const isFlipbookOpenDetail = (detail: unknown): detail is FlipbookOpenDetail => {
  if (!detail || typeof detail !== 'object') {
    return false;
  }

  const { flipbookId } = detail as { flipbookId?: string };
  return Boolean(flipbookId && flipbookId in flipbooks);
};

export default function FlipbookOverlay() {
  const [content, setContent] = useState<FlipbookOverlayContent | undefined>();
  const [pageIndex, setPageIndex] = useState(0);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closeFlipbook = (completed = false) => {
    if (!content) {
      return;
    }

    const { flipbookId } = content;
    setContent(undefined);
    setPageIndex(0);
    restoreFlipbookOverlayFocus(previousFocusRef.current);
    previousFocusRef.current = null;
    window.dispatchEvent(new CustomEvent(CLOSED_EVENT, { detail: { flipbookId, completed } }));
  };

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isFlipbookOpenDetail(detail)) {
        return;
      }

      if (!previousFocusRef.current && document.activeElement instanceof HTMLElement) {
        previousFocusRef.current = document.activeElement;
      }

      setContent(resolveFlipbookOverlayContent(detail));
      setPageIndex(0);
    };

    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && content) {
        closeFlipbook();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [content]);

  useEffect(() => {
    if (!content) {
      return;
    }

    previousFocusRef.current = setFlipbookOverlayFocus(
      previousFocusRef.current,
      panelRef.current,
      closeButtonRef.current,
    );
  }, [content]);

  useEffect(() => {
    return () => {
      restoreFlipbookOverlayFocus(previousFocusRef.current);
      previousFocusRef.current = null;
    };
  }, []);

  if (!content) {
    return null;
  }

  const page = content.pages[pageIndex];
  const isFinalNote = content.flipbookId === 'final';
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === content.pages.length - 1;

  const showPreviousPage = () => {
    setPageIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const showNextPage = () => {
    setPageIndex((currentIndex) => Math.min(content.pages.length - 1, currentIndex + 1));
  };

  return (
    <div className="flipbook-overlay" role="dialog" aria-modal="true" aria-label={content.title}>
      {!isFinalNote && <span className="flipbook-page-count">{content.pages.length === 0 ? '0 / 0' : `${pageIndex + 1} / ${content.pages.length}`}</span>}
      <section className="flipbook-panel" ref={panelRef} tabIndex={-1}>
        <button className="flipbook-close" type="button" onClick={() => closeFlipbook()} aria-label="Close flipbook" ref={closeButtonRef}>
          x
        </button>

        {isFinalNote ? (
          <article className="flipbook-final-note">
            <div className="flipbook-final-note-copy">
              {(content.finalNote?.body ?? '').split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                <p key={`${paragraph.slice(0, 24)}-${paragraphIndex}`}>{paragraph}</p>
              ))}
            </div>
            <button type="button" onClick={() => closeFlipbook(true)}>{content.finalNote?.continueLabel ?? 'Continue'}</button>
          </article>
        ) : page ? (
          <article className="flipbook-page">
            <>
              {(page.imagePath || page.videoPath) && (
                <div className="flipbook-image-frame">
                  {page.videoPath ? (
                    <video src={page.videoPath} controls />
                  ) : (
                    <img src={page.imagePath} alt={page.label} />
                  )}
                </div>
              )}
              <div className="flipbook-page-copy">
                <h3>{page.label}</h3>
                {page.date && <p className="flipbook-date">{page.date}</p>}
                <p>{page.description}</p>
              </div>
            </>
          </article>
        ) : (
          <article className="flipbook-page empty-page">
            <h3>No pages yet</h3>
            <p>This memory book is waiting for its first page.</p>
          </article>
        )}

        {!isFinalNote && (
          <footer className="flipbook-controls">
            <button type="button" onClick={showPreviousPage} disabled={isFirstPage}>Previous</button>
            <button type="button" onClick={showNextPage} disabled={isLastPage || content.pages.length === 0}>Next</button>
          </footer>
        )}
      </section>
    </div>
  );
}
