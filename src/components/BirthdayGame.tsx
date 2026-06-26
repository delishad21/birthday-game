import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { createGame } from '../game/createGame';
import FlipbookOverlay from './FlipbookOverlay';
import MemoryPhotoOverlay from './MemoryPhotoOverlay';

export default function BirthdayGame() {
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hasStarted || !containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = createGame(containerRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [hasStarted]);

  return (
    <main className="birthday-game">
      <section className="game-shell" aria-label="The Missing Birthday Lights game">
        <div ref={containerRef} className="game-container" />
        <MemoryPhotoOverlay />
        <FlipbookOverlay />

        {!hasStarted && (
          <div className="title-screen">
            <div className="title-card">
              <button className="start-button" type="button" onClick={() => setHasStarted(true)}>
                Start Game
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
