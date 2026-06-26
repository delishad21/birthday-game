import { describe, expect, it } from 'vitest';
import electronMainSource from './main.cjs?raw';

describe('Electron main process', () => {
  it('serves the packaged app through an app protocol instead of file URLs', () => {
    expect(electronMainSource).toContain("protocol.handle('app'");
    expect(electronMainSource).toContain("window.loadURL('app://birthday/index.html')");
    expect(electronMainSource).not.toContain('window.loadFile(');
  });
});
