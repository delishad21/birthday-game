import { describe, expect, it } from 'vitest';
import birthdayGameSource from './BirthdayGame.tsx?raw';

describe('BirthdayGame start screen', () => {
  it('shows only the start game button copy before the game starts', () => {
    expect(birthdayGameSource).toContain('Start Game');
    expect(birthdayGameSource).not.toMatch(/<h1>[\s\S]*The Missing Birthday Lights[\s\S]*<\/h1>/);
    expect(birthdayGameSource).not.toMatch(/<p>[\s\S]*A tiny birthday adventure[\s\S]*<\/p>/);
  });
});
