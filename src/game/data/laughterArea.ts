import manifest from '../../../public/special-area/laughter-area/laughter-manifest.json';
import { getBlockingLayerDepth } from './alphaCollision';
import { AREA_HEIGHT, AREA_WIDTH, MAP_TILE_SIZE, areaCenters } from './mapLayout';

export interface LaughterLayerManifest {
  key: string;
  file: string;
  render: 'flooring' | 'sortable';
  blockingTiles?: Array<{ x: number; y: number }>;
}

export interface LaughterAreaManifest {
  area: 'star-laughter';
  width: number;
  height: number;
  layerHeight: number;
  align: 'bottom';
  layers: LaughterLayerManifest[];
}

export const laughterAreaManifest = manifest as LaughterAreaManifest;
export const LAUGHTER_DEPTH_UP_SHIFT = 15;

export const laughterAreaOrigin = {
  x: areaCenters['star-laughter'].x - AREA_WIDTH / 2,
  y: areaCenters['star-laughter'].y - AREA_HEIGHT / 2,
} as const;

export const getLaughterLayerWorldPlacement = () => ({
  x: areaCenters['star-laughter'].x,
  y: areaCenters['star-laughter'].y + AREA_HEIGHT / 2,
  width: laughterAreaManifest.width,
  height: laughterAreaManifest.layerHeight,
});

export const getLaughterBlockingBodies = () =>
  laughterAreaManifest.layers.flatMap((layer) =>
    (layer.blockingTiles ?? []).map((tile) => ({
      layerKey: layer.key,
      x: laughterAreaOrigin.x + tile.x * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      y: laughterAreaOrigin.y + tile.y * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
      width: MAP_TILE_SIZE,
      height: MAP_TILE_SIZE,
    })),
  );

const getLaughterBlockingBodiesForLayer = (layer: LaughterLayerManifest) =>
  (layer.blockingTiles ?? []).map((tile) => ({
    x: laughterAreaOrigin.x + tile.x * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
    y: laughterAreaOrigin.y + tile.y * MAP_TILE_SIZE + MAP_TILE_SIZE / 2,
    width: MAP_TILE_SIZE,
    height: MAP_TILE_SIZE,
  }));

export const getLaughterLayerDepth = (layer: LaughterLayerManifest, playerFrontOffset = 0) => {
  if (layer.render === 'flooring') {
    return 1;
  }

  const maxBlockingTileY = Math.max(...(layer.blockingTiles ?? [{ x: 0, y: 0 }]).map((tile) => tile.y));
  const fallbackDepth = laughterAreaOrigin.y + maxBlockingTileY * MAP_TILE_SIZE + MAP_TILE_SIZE;
  return getBlockingLayerDepth(getLaughterBlockingBodiesForLayer(layer), fallbackDepth, playerFrontOffset, LAUGHTER_DEPTH_UP_SHIFT);
};
