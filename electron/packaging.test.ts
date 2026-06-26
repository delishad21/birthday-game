import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import indexHtmlSource from '../index.html?raw';
import packageJson from '../package.json';

describe('Electron packaging metadata', () => {
  it('uses the public portfolio app name everywhere users see it', () => {
    expect(indexHtmlSource).toContain('<title>Birthday Memory Adventure</title>');
    expect(packageJson.build.productName).toBe('Birthday Memory Adventure');
  });

  it('uses the generated Penguin Windows icon', () => {
    expect(packageJson.build.win.icon).toBe('build/icon.ico');
  });

  it('stores correct Windows icon frame sizes', () => {
    const icon = readFileSync('build/icon.ico');
    const imageCount = icon.readUInt16LE(4);
    const sizes = Array.from({ length: imageCount }, (_, index) => ({
      width: icon.readUInt8(6 + index * 16) || 256,
      height: icon.readUInt8(7 + index * 16) || 256,
    })).sort((left, right) => left.width - right.width);

    expect(sizes).toEqual([
      { width: 16, height: 16 },
      { width: 32, height: 32 },
      { width: 48, height: 48 },
      { width: 256, height: 256 },
    ]);
  });
});
