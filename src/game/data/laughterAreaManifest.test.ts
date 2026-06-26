import { describe, expect, it } from 'vitest';
import manifest from '../../../public/special-area/laughter-area/laughter-manifest.json';

interface LaughterLayer {
  key: string;
  file: string;
  render: 'flooring' | 'sortable';
  blockingTiles?: Array<{ x: number; y: number }>;
}

interface LaughterManifest {
  area: string;
  width: number;
  height: number;
  layerHeight: number;
  align: string;
  layers: LaughterLayer[];
}

const laughterManifest = manifest as LaughterManifest;

describe('laughter area manifest', () => {
  it('uses system-friendly file names for every layer', () => {
    const expectedFiles = [
      'laughter-flooring.png',
      'laughter-top-fence.png',
      'laughter-table-2.png',
      'laughter-table-1.png',
      'laughter-balloon-1.png',
      'laughter-table-4.png',
      'laughter-table-3.png',
      'laughter-bottom-fence.png',
      'laughter-left-fence.png',
    ];

    expect(laughterManifest.layers.map((layer) => layer.file)).toEqual(expectedFiles);
  });

  it('describes bottom-aligned full-width layers for the laughter area', () => {
    expect(laughterManifest.area).toBe('star-laughter');
    expect(laughterManifest.width).toBe(1200);
    expect(laughterManifest.height).toBe(750);
    expect(laughterManifest.layerHeight).toBe(850);
    expect(laughterManifest.align).toBe('bottom');
    expect(laughterManifest.layers).toHaveLength(9);
    expect(laughterManifest.layers[0]).toEqual({
      key: 'laughter-flooring',
      file: 'laughter-flooring.png',
      render: 'flooring',
    });
  });

  it('expands blocking tile ranges for every blocking layer', () => {
    const tilesFor = (key: string) => laughterManifest.layers.find((layer) => layer.key === key)?.blockingTiles ?? [];

    expect(tilesFor('laughter-flooring')).toEqual([]);
    expect(tilesFor('laughter-top-fence')).toEqual(Array.from({ length: 10 }, (_, index) => ({ x: index + 7, y: 0 })));
    expect(tilesFor('laughter-table-2')).toEqual([
      { x: 18, y: 1 },
      { x: 18, y: 2 },
      { x: 19, y: 1 },
      { x: 19, y: 2 },
    ]);
    expect(tilesFor('laughter-table-1')).toEqual([
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
    ]);
    expect(tilesFor('laughter-balloon-2')).toEqual([]);
    expect(tilesFor('laughter-balloon-1')).toEqual([{ x: 3, y: 12 }]);
    expect(tilesFor('laughter-table-4')).toEqual([
      { x: 17, y: 10 },
      { x: 17, y: 11 },
      { x: 18, y: 10 },
      { x: 18, y: 11 },
    ]);
    expect(tilesFor('laughter-table-3')).toEqual([
      { x: 4, y: 8 },
      { x: 4, y: 9 },
      { x: 5, y: 8 },
      { x: 5, y: 9 },
    ]);
    expect(tilesFor('laughter-bottom-fence')).toEqual(Array.from({ length: 11 }, (_, index) => ({ x: index + 6, y: 14 })));
    expect(tilesFor('laughter-left-fence')).toEqual(Array.from({ length: 4 }, (_, index) => ({ x: 1, y: index + 6 })));
    expect(tilesFor('laughter-right-fence')).toEqual([]);
  });
});
