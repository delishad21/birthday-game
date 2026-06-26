export interface AlphaCollisionPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlphaBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface AlphaLayerPlacement extends AlphaCollisionPlacement {
  visibleBottomY: number;
}

export interface AlphaStripSegment {
  minX: number;
  maxX: number;
}

export interface AlphaStripRow {
  y: number;
  segments: AlphaStripSegment[];
}

export const getPaddedLayerPlacement = (
  placement: AlphaCollisionPlacement,
  bounds: AlphaBounds,
  sourceSize: { width: number; height: number },
): AlphaLayerPlacement => ({
  x: placement.x,
  y: placement.y,
  width: placement.width,
  height: placement.height,
  visibleBottomY: placement.y - placement.height / 2 + ((bounds.maxY + 1) / sourceSize.height) * placement.height,
});

export const getAlphaStripBlockingBodies = (
  placement: AlphaCollisionPlacement,
  rows: AlphaStripRow[],
  sourceSize: { width: number; height: number },
  stripHeight: number,
  topTrim: number,
  visibleTopY = rows.length > 0 ? Math.min(...rows.map((row) => row.y)) : 0,
): AlphaCollisionPlacement[] => {
  if (rows.length === 0) {
    return [];
  }

  const scaleX = placement.width / sourceSize.width;
  const scaleY = placement.height / sourceSize.height;
  const areaLeft = placement.x - placement.width / 2;
  const areaTop = placement.y - placement.height / 2;
  const cutoff = visibleTopY + topTrim;

  return rows
    .filter((row) => row.y + stripHeight > cutoff)
    .flatMap((row) => {
      const rowBottom = row.y + stripHeight;
      const bodyTop = row.y < cutoff ? cutoff : row.y;
      const clippedHeight = rowBottom - bodyTop;
      const localCenterY = (bodyTop + clippedHeight / 2) * scaleY;

      return row.segments.map((segment) => {
        const sourceWidth = segment.maxX - segment.minX + 1;
        const localCenterX = (segment.minX + sourceWidth / 2) * scaleX;
        return {
          x: areaLeft + localCenterX,
          y: areaTop + localCenterY,
          width: sourceWidth * scaleX,
          height: clippedHeight * scaleY,
        };
      });
    });
};

export const getBlockingLayerDepth = (
  bodies: AlphaCollisionPlacement[],
  fallbackDepth: number,
  playerFrontOffset = 0,
  depthUpShift = 0,
) => {
  if (bodies.length === 0) {
    return fallbackDepth;
  }

  return Math.max(...bodies.map((body) => body.y + body.height / 2)) - playerFrontOffset - depthUpShift;
};
