
export const TILE_SIZE = 32;
export const GARDEN_COLUMNS = 72;
export const GARDEN_ROWS = 48;
export const GARDEN_TILE = Object.freeze({
  water: 1,
  waterWave: 2,
  grass: 3,
  grassLight: 4,
  grassDark: 5,
  sand: 6,
  wetSand: 7,
  path: 8,
  pathAlt: 9,
  cliffTop: 10,
  flowerBlue: 11,
  flowerWhite: 12,
  flowerPink: 13,
  flowerLilac: 14,
  shrub: 15,
  rock: 16,
  fenceHorizontal: 17,
  fenceVertical: 18,
});

export const TREE_TILE_POSITION = Object.freeze({ x: 34, y: 20 });

const MAIN_PATH = Object.freeze([
  [8, 8], [13, 12], [18, 16], [24, 19], [30, 21], [36, 22],
  [42, 25], [48, 29], [54, 32], [61, 35],
]);
const BEACH_PATH = Object.freeze([
  [30, 21], [28, 27], [25, 32], [21, 36], [16, 39],
]);

function islandEdges(x, y) {
  const top = 3 + Math.round(1.4 + Math.sin(x * 0.16) * 1.4);
  const left = 3 + Math.round(1.4 + Math.sin(y * 0.19) * 1.5);
  const right = GARDEN_COLUMNS - 4 - Math.round(1 + Math.cos(y * 0.14) * 1.2);
  const bottom = GARDEN_ROWS - 5 + Math.round(Math.sin(x * 0.11) * 1.2);
  return { top, left, right, bottom };
}

function distanceToSegment(px, py, start, end) {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distanceToPath(x, y, points) {
  let best = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    best = Math.min(best, distanceToSegment(x, y, points[index - 1], points[index]));
  }
  return best;
}

function cellRandom(x, y, salt = 0) {
  const value = Math.sin((x + salt * 17.13) * 127.1 + (y + salt * 9.7) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function isOnLand(x, y) {
  const edge = islandEdges(x, y);
  return x >= edge.left && x <= edge.right && y >= edge.top && y <= edge.bottom;
}

export function buildGardenLayout(columns = GARDEN_COLUMNS, rows = GARDEN_ROWS) {
  if (!Number.isInteger(columns) || columns < 20) throw new RangeError('Garden columns must be an integer >= 20');
  if (!Number.isInteger(rows) || rows < 16) throw new RangeError('Garden rows must be an integer >= 16');

  const ground = Array.from({ length: rows }, () => Array(columns).fill(GARDEN_TILE.water));
  const decor = Array.from({ length: rows }, () => Array(columns).fill(0));
  const tree = { x: Math.min(TREE_TILE_POSITION.x, columns - 8), y: Math.min(TREE_TILE_POSITION.y, rows - 9) };
  const pathLines = [MAIN_PATH, BEACH_PATH];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      if (!isOnLand(x, y)) {
        ground[y][x] = cellRandom(x, y, 1) > 0.78 ? GARDEN_TILE.waterWave : GARDEN_TILE.water;
        continue;
      }

      const edge = islandEdges(x, y);
      const edgeDistance = Math.min(x - edge.left, edge.right - x, y - edge.top, edge.bottom - y);
      const pathDistance = Math.min(...pathLines.map((line) => distanceToPath(x + 0.5, y + 0.5, line)));

      if (pathDistance < 1.08) {
        ground[y][x] = cellRandom(x, y, 2) > 0.72 ? GARDEN_TILE.pathAlt : GARDEN_TILE.path;
      } else if (edgeDistance <= 1) {
        const beachSide = (x - edge.left <= 1 || y - edge.bottom <= 1) && x < Math.floor(columns * 0.42);
        ground[y][x] = beachSide
          ? (edgeDistance === 0 ? GARDEN_TILE.sand : GARDEN_TILE.wetSand)
          : GARDEN_TILE.cliffTop;
      } else if (edgeDistance <= 2 && x < Math.floor(columns * 0.3) && y > rows * 0.65) {
        ground[y][x] = GARDEN_TILE.sand;
      } else {
        const variation = cellRandom(x, y, 3);
        ground[y][x] = variation > 0.88 ? GARDEN_TILE.grassDark
          : variation > 0.55 ? GARDEN_TILE.grassLight
            : GARDEN_TILE.grass;
      }

      const treeDistance = Math.hypot(x + 0.5 - tree.x, y + 0.5 - tree.y);
      const onPath = pathDistance < 1.45;
      const isGrass = [GARDEN_TILE.grass, GARDEN_TILE.grassLight, GARDEN_TILE.grassDark].includes(ground[y][x]);
      if (!isGrass || treeDistance < 2.6 || onPath) continue;

      const random = cellRandom(x, y, 4);
      if (treeDistance > 3.2 && treeDistance < 9.5 && random < 0.27) {
        const color = cellRandom(x, y, 5);
        decor[y][x] = color < 0.68 ? GARDEN_TILE.flowerBlue
          : color < 0.84 ? GARDEN_TILE.flowerWhite
            : color < 0.95 ? GARDEN_TILE.flowerLilac
              : GARDEN_TILE.flowerPink;
      } else if (random < 0.035) {
        decor[y][x] = GARDEN_TILE.flowerBlue;
      } else if (random > 0.965) {
        decor[y][x] = GARDEN_TILE.shrub;
      } else if (random > 0.945) {
        decor[y][x] = GARDEN_TILE.rock;
      }
    }
  }

  const fenceRow = Math.min(rows - 7, 10);
  for (let x = Math.min(columns - 10, 53); x < Math.min(columns - 5, 64); x += 1) {
    if ([GARDEN_TILE.grass, GARDEN_TILE.grassLight, GARDEN_TILE.grassDark].includes(ground[fenceRow][x])) {
      decor[fenceRow][x] = GARDEN_TILE.fenceHorizontal;
    }
  }
  decor[fenceRow][Math.min(columns - 7, 58)] = GARDEN_TILE.fenceVertical;

  for (let y = Math.max(0, tree.y - 3); y <= Math.min(rows - 1, tree.y + 1); y += 1) {
    for (let x = Math.max(0, tree.x - 3); x <= Math.min(columns - 1, tree.x + 3); x += 1) {
      decor[y][x] = 0;
    }
  }

  return {
    columns,
    rows,
    ground,
    decor,
    tree,
    spawn: { x: Math.min(columns - 12, tree.x + 2), y: Math.min(rows - 10, tree.y + 7) },
  };
}
