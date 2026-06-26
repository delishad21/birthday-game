import manifest from '../../../public/special-area/cave-area/cave-manifest.json';
import {
  getAlphaStripBlockingBodies,
  type AlphaBounds,
  type AlphaStripRow,
} from './alphaCollision';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';

export interface CaveLayerManifest {
  key: string;
  file: string;
  render: 'sortable';
  blockingTileRows: Array<{ y: number; ranges: number[][] }>;
}

export interface CaveAreaManifest {
  area: 'toy-bear';
  width: number;
  height: number;
  layerHeight: number;
  align: 'bottom';
  layers: CaveLayerManifest[];
}

export const caveAreaManifest = manifest as CaveAreaManifest;
export const CAVE_COLLISION_STRIP_HEIGHT = 8;
export const CAVE_COLLISION_TOP_TRIM = 0;

export const caveAreaOrigin = {
  x: areaCenters['toy-bear'].x - AREA_WIDTH / 2,
  y: areaCenters['toy-bear'].y - AREA_HEIGHT / 2,
} as const;

export const getCaveLayerWorldPlacement = () => ({
  x: areaCenters['toy-bear'].x,
  y: areaCenters['toy-bear'].y + AREA_HEIGHT / 2,
  width: caveAreaManifest.width,
  height: caveAreaManifest.layerHeight,
});

const caveAlphaPlacement = {
  x: areaCenters['toy-bear'].x,
  y: areaCenters['toy-bear'].y + AREA_HEIGHT / 2 - caveAreaManifest.layerHeight / 2,
  width: caveAreaManifest.width,
  height: caveAreaManifest.layerHeight,
} as const;

export const getCaveBlockingTiles = (layer: CaveLayerManifest) =>
  layer.blockingTileRows.flatMap((row) =>
    row.ranges.flatMap(([startX, endX]) =>
      Array.from({ length: endX - startX + 1 }, (_, index) => ({ x: startX + index, y: row.y })),
    ),
  );

export const getCaveBlockingBodies = () =>
  caveAreaManifest.layers.flatMap((layer) =>
    getCaveBlockingTiles(layer).map((tile) => ({
      layerKey: layer.key,
      x: caveAreaOrigin.x + tile.x * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      y: caveAreaOrigin.y + tile.y * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      width: MAP_TILE_SIZE,
      height: MAP_TILE_SIZE,
    })),
  );

const isInsideCaveEntrance = (body: { x: number; y: number }) => {
  const entranceWidth = MAP_TILE_SIZE * 4;
  const entranceHeight = MAP_TILE_SIZE * 3;
  const entranceTop = areaCenters['toy-bear'].y + AREA_HEIGHT / 2 - entranceHeight;
  return (
    body.x >= areaCenters['toy-bear'].x - entranceWidth / 2 &&
    body.x <= areaCenters['toy-bear'].x + entranceWidth / 2 &&
    body.y >= entranceTop
  );
};

export const getCaveBlockingBodiesFromAlpha = (
  rows: AlphaStripRow[],
  sourceSize: { width: number; height: number },
  bounds: AlphaBounds,
) => {
  const scaleX = caveAlphaPlacement.width / sourceSize.width;
  const scaleY = caveAlphaPlacement.height / sourceSize.height;
  const imageTop = caveAlphaPlacement.y - caveAlphaPlacement.height / 2;
  const imageLeft = caveAlphaPlacement.x - caveAlphaPlacement.width / 2;
  const topBlocker = {
    layerKey: 'caveGuide-cave-top',
    x: imageLeft + (bounds.minX + (bounds.maxX - bounds.minX + 1) / 2) * scaleX,
    y: imageTop + bounds.minY * scaleY,
    width: (bounds.maxX - bounds.minX + 1) * scaleX,
    height: CAVE_COLLISION_STRIP_HEIGHT * scaleY,
  };
  const alphaBodies = getAlphaStripBlockingBodies(
    caveAlphaPlacement,
    rows,
    sourceSize,
    CAVE_COLLISION_STRIP_HEIGHT,
    CAVE_COLLISION_TOP_TRIM,
    bounds.minY,
  )
    .filter((body) => !isInsideCaveEntrance(body))
    .map((body) => ({ layerKey: 'caveGuide-cave', ...body }));

  return [topBlocker, ...alphaBodies];
};

export const getCaveLayerDepth = (layer: CaveLayerManifest) => {
  const maxBlockingTileY = Math.max(...getCaveBlockingTiles(layer).map((tile) => tile.y));
  return caveAreaOrigin.y + maxBlockingTileY * MAP_TILE_SIZE + MAP_TILE_SIZE;
};

export const getCaveDepthForPlayerY = (playerY: number, caveBaseDepth: number) => {
  const caveGuideAreaTop = areaCenters['toy-bear'].y - AREA_HEIGHT / 2;
  const topDepthBandBottom = caveGuideAreaTop + MAP_TILE_SIZE * 3;

  return playerY < topDepthBandBottom ? caveBaseDepth + MAP_TILE_SIZE : 0.75;
};
