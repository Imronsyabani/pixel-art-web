import { GARDEN_TILE, TILE_SIZE } from './gardenLayout.js';

const BLOCKED_GROUND = new Set([
  GARDEN_TILE.water,
  GARDEN_TILE.waterWave,
  GARDEN_TILE.wetSand,
  GARDEN_TILE.cliffTop,
]);
const BLOCKED_DECOR = new Set([
  GARDEN_TILE.shrub,
  GARDEN_TILE.rock,
  GARDEN_TILE.fenceHorizontal,
  GARDEN_TILE.fenceVertical,
]);

export function isWalkableTile(groundTile, decorTile = 0) {
  return !BLOCKED_GROUND.has(groundTile) && !BLOCKED_DECOR.has(decorTile);
}

export function getGardenObstacleRects(tree) {
  const centerX = tree.x * TILE_SIZE + TILE_SIZE / 2;
  const anchorY = tree.y * TILE_SIZE + TILE_SIZE * 1.15;
  return [
    {
      id: 'central-banyan-trunk',
      left: centerX - 34,
      right: centerX + 34,
      top: anchorY - 144,
      bottom: anchorY + 28,
    },
    {
      id: 'banyan-west-root',
      left: centerX - 126,
      right: centerX - 18,
      top: anchorY - 2,
      bottom: anchorY + 16,
    },
    {
      id: 'banyan-east-root',
      left: centerX + 18,
      right: centerX + 126,
      top: anchorY - 2,
      bottom: anchorY + 16,
    },
  ];
}

function circleIntersectsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.left, Math.min(rect.right, x));
  const nearestY = Math.max(rect.top, Math.min(rect.bottom, y));
  return (x - nearestX) ** 2 + (y - nearestY) ** 2 < radius ** 2;
}

function samplePoints(x, y, radius) {
  const points = [{ x, y }];
  for (let index = 0; index < 8; index += 1) {
    const angle = Math.PI * 2 * index / 8;
    points.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
    });
  }
  return points;
}

export function canOccupyPosition(layout, x, y, options = {}) {
  const { radius = 10, obstacles = getGardenObstacleRects(layout.tree) } = options;
  if (!Number.isFinite(x) || !Number.isFinite(y) || radius < 0) return false;

  const width = layout.columns * TILE_SIZE;
  const height = layout.rows * TILE_SIZE;
  if (x - radius < 0 || y - radius < 0 || x + radius >= width || y + radius >= height) return false;

  for (const point of samplePoints(x, y, radius)) {
    const column = Math.floor(point.x / TILE_SIZE);
    const row = Math.floor(point.y / TILE_SIZE);
    if (!isWalkableTile(layout.ground[row]?.[column], layout.decor[row]?.[column] ?? 0)) return false;
  }
  return !obstacles.some((rect) => circleIntersectsRect(x, y, radius, rect));
}
