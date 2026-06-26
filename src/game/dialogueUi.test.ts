import { describe, expect, it } from 'vitest';
import gameSceneSource from './GameScene.ts?raw';

describe('dialogue UI layout', () => {
  it('uses a taller dialogue panel so the continue prompt stays inside the box', () => {
    expect(gameSceneSource).toContain('ui(480), ui(430), ui(880), ui(180)');
  });

  it('adds extra vertical spacing above the continue prompt', () => {
    expect(gameSceneSource).toContain("ui(492), 'Press E or Space to continue'");
  });

  it('starts dialogue text near the top of the taller panel', () => {
    expect(gameSceneSource).toContain("this.dialogueNameText = this.add.text(ui(72), ui(354)");
    expect(gameSceneSource).toContain("this.dialogueLineText = this.add.text(ui(72), ui(392)");
  });
});
