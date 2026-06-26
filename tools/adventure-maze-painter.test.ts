import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

interface MazePainterCore {
  readonly columns: number;
  readonly rows: number;
  createBlockedMatrix: () => string[][];
  paintHorizontalPath: (matrix: string[][], col: number, row: number) => string[][];
  paintVerticalPath: (matrix: string[][], col: number, row: number) => string[][];
  setWall: (matrix: string[][], col: number, row: number) => string[][];
  serializeMatrix: (matrix: string[][]) => string;
  parseMatrix: (source: string) => string[][];
}

const loadCore = (): MazePainterCore => {
  const html = readFileSync('tools/adventure-maze-painter.html', 'utf8');
  const match = html.match(/\/\* CORE_START \*\/[\s\S]*?\/\* CORE_END \*\//);
  if (!match) {
    throw new Error('Core helper block not found');
  }

  const context = { globalThis: {} as { __adventureMazePainterCore?: MazePainterCore } };
  vm.runInNewContext(match[0], context);
  const core = context.globalThis.__adventureMazePainterCore;
  if (!core) {
    throw new Error('Core helpers were not exported');
  }
  return core;
};

describe('adventure maze painter core', () => {
  it('creates a blocked 44 by 38 matrix', () => {
    const core = loadCore();
    const matrix = core.createBlockedMatrix();

    expect(core.columns).toBe(44);
    expect(core.rows).toBe(38);
    expect(matrix).toHaveLength(38);
    expect(matrix.every((row) => row.length === 44)).toBe(true);
    expect(matrix.every((row) => row.every((cell) => cell === '#'))).toBe(true);
  });

  it('paints left-right paths as three rows tall', () => {
    const core = loadCore();
    const matrix = core.paintHorizontalPath(core.createBlockedMatrix(), 12, 10);

    expect(matrix[9][12]).toBe('.');
    expect(matrix[10][12]).toBe('.');
    expect(matrix[11][12]).toBe('.');
    expect(matrix[8][12]).toBe('#');
    expect(matrix[12][12]).toBe('#');
  });

  it('paints up-down paths as two columns wide', () => {
    const core = loadCore();
    const matrix = core.paintVerticalPath(core.createBlockedMatrix(), 12, 10);

    expect(matrix[10][12]).toBe('.');
    expect(matrix[10][13]).toBe('.');
    expect(matrix[10][11]).toBe('#');
    expect(matrix[10][14]).toBe('#');
  });

  it('shifts full brushes inward at grid edges', () => {
    const core = loadCore();
    const horizontal = core.paintHorizontalPath(core.createBlockedMatrix(), 0, 0);
    const vertical = core.paintVerticalPath(core.createBlockedMatrix(), 43, 37);

    expect(horizontal[0][0]).toBe('.');
    expect(horizontal[1][0]).toBe('.');
    expect(horizontal[2][0]).toBe('.');
    expect(vertical[37][42]).toBe('.');
    expect(vertical[37][43]).toBe('.');
  });

  it('serializes and parses matrices with dot and hash characters', () => {
    const core = loadCore();
    const matrix = core.paintVerticalPath(core.paintHorizontalPath(core.createBlockedMatrix(), 5, 5), 8, 8);
    const serialized = core.serializeMatrix(matrix);
    const parsed = core.parseMatrix(serialized);

    expect(serialized.split('\n')).toHaveLength(38);
    expect(serialized.split('\n').every((line) => line.length === 44)).toBe(true);
    expect(parsed).toEqual(matrix);
  });

  it('normalizes undersized matrices while serializing', () => {
    const core = loadCore();
    const serialized = core.serializeMatrix([['.']]);
    const lines = serialized.split('\n');

    expect(lines).toHaveLength(38);
    expect(lines.every((line) => line.length === 44)).toBe(true);
    expect(lines[0][0]).toBe('.');
    expect(lines[0].slice(1)).toBe('#'.repeat(43));
    expect(lines.slice(1).every((line) => line === '#'.repeat(44))).toBe(true);
  });

  it('rejects malformed matrix imports', () => {
    const core = loadCore();

    expect(() => core.parseMatrix('###')).toThrow('Expected 38 rows');
    expect(() => core.parseMatrix(`${'#'.repeat(44)}\n${'#'.repeat(43)}\n${Array.from({ length: 36 }, () => '#'.repeat(44)).join('\n')}`)).toThrow(
      'Expected row 2 to have 44 columns',
    );
    expect(() => core.parseMatrix(Array.from({ length: 38 }, () => '#'.repeat(43) + 'x').join('\n'))).toThrow(
      'Invalid character',
    );
  });
});
