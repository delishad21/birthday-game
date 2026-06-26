import { describe, expect, it } from 'vitest';
import gameSceneSource from './GameScene.ts?raw';
import flipbookOverlaySource from '../components/FlipbookOverlay.tsx?raw';
import memoryPhotoOverlaySource from '../components/MemoryPhotoOverlay.tsx?raw';

describe('GameScene core-memory expansion copy and wiring', () => {
  it('uses required memory count constants in HUD and final gift copy', () => {
    expect(gameSceneSource).toContain('REQUIRED_MEMORY_STARS');
    expect(gameSceneSource).toContain('REQUIRED_TOYS');
    expect(gameSceneSource).toContain('Memory Stars: ${counts.stars}/${REQUIRED_MEMORY_STARS}');
    expect(gameSceneSource).toContain('Toys: ${counts.toys}/${REQUIRED_TOYS}');
    expect(gameSceneSource).toContain('Not all core memories have been restored!');
  });

  it('renders expanded Toy image assets without the generic rectangle fallback', () => {
    expect(gameSceneSource).toContain('PATH_FRIEND_DISPLAY_SIZE');
    expect(gameSceneSource).toContain('HIDDEN_MASCOT_DISPLAY_SIZE');
    expect(gameSceneSource).toContain('toyImageAssets.penguin.key');
    expect(gameSceneSource).toContain('toyImageAssets.cow.key');
    expect(gameSceneSource).not.toContain('this.add.rectangle(item.x, item.y, 34, 34, item.color, 1).setStrokeStyle(3, 0x3b2a24)');
  });

  it('dispatches flipbooks and handles close events for post-collection completion copy', () => {
    expect(gameSceneSource).toContain("window.addEventListener('flipbook:closed'");
    expect(gameSceneSource).toContain("window.dispatchEvent(new CustomEvent('flipbook:open'");
    expect(gameSceneSource).toContain('All core memories have been restored! Return to the starting area.');
  });

  it('opens the Star of Moments manifest after collecting the moments star', () => {
    expect(gameSceneSource).toContain("this.openFlipbook('moments')");
    expect(gameSceneSource).not.toContain("this.openFlipbook('moments', createMomentFlipbookPages(memoryPhotoAssets)");
  });

  it('shows a simple The End screen only after the final flipbook completes', () => {
    expect(gameSceneSource).toContain("detail?.flipbookId === 'final' && detail.completed");
    expect(gameSceneSource).toContain('this.startFinalEnding();');
    expect(gameSceneSource).toContain("'The End'");
    expect(gameSceneSource).toContain("'Press R to play again'");
    expect(gameSceneSource).not.toContain('The Birthday Sky Is Restored');
    expect(gameSceneSource).not.toContain('showEndingLines');
    expect(flipbookOverlaySource).toContain('closeFlipbook(true)');
    expect(flipbookOverlaySource).not.toContain('onEnded={onFinalVideoEnded}');
  });

  it('uses Star of Moments copy for the memory photo overlay success state', () => {
    expect(memoryPhotoOverlaySource).toContain('Correct! The Star of Moments returns.');
    expect(memoryPhotoOverlaySource).not.toContain(`Correct! The Star of ${'Memories'} returns.`);
  });

  it('blocks Phaser input while flipbooks are open', () => {
    expect(gameSceneSource).toContain('private flipbookActive = false;');
    expect(gameSceneSource).toContain('this.flipbookActive = true;');
    expect(gameSceneSource).toContain('this.flipbookActive = false;');
    expect(gameSceneSource).toContain('if (this.flipbookActive)');
  });

  it('does not open the all-core-memories dialogue over another active overlay', () => {
    expect(gameSceneSource).toContain('private canShowCoreMemoryRestoredMessage()');
    expect(gameSceneSource).toContain('!this.activeDialogue');
    expect(gameSceneSource).toContain('!this.endingActive');
    expect(gameSceneSource).toContain('!this.endingContainer');
    expect(gameSceneSource).toContain('!this.flipbookActive');
  });

  it('offers challenge skips after the first failed memory attempt', () => {
    expect(gameSceneSource).toContain('CHALLENGE_SKIP_FAILURE_THRESHOLD = 1');
    expect(memoryPhotoOverlaySource).toContain('SKIP_FAILURE_THRESHOLD = 1');
    expect(memoryPhotoOverlaySource).toContain('Skip Challenge');
  });

  it('lets DDR finish regardless of misses and offers retry or continue with final stats', () => {
    expect(gameSceneSource).not.toContain('Too many misses. Try the dance again.');
    expect(gameSceneSource).not.toContain('failDanceMinigame');
    expect(gameSceneSource).toContain('Dance Results');
    expect(gameSceneSource).toContain('Hits ${this.danceHitNoteIds.size}/${this.danceNotes.length}');
    expect(gameSceneSource).toContain('Misses ${this.danceMissCount}');
    expect(gameSceneSource).toContain('showDanceResultsScreen');
    expect(gameSceneSource).toContain('Continue');
    expect(gameSceneSource).toContain('continueDanceMinigame');
  });

  it('uses the larger simplified memory and flipbook layouts', () => {
    expect(flipbookOverlaySource).toContain('flipbook-page-count');
    expect(flipbookOverlaySource).toContain('flipbook-page-copy');
    expect(flipbookOverlaySource).toContain('flipbook-image-frame');
    expect(flipbookOverlaySource).not.toContain('id="flipbook-title"');
  });
});
