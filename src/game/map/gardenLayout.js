export const TILE_SIZE = 32;
export const GARDEN_COLUMNS = 40;
export const GARDEN_ROWS = 28;
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

export const TREE_TILE_POSITION = Object.freeze({ x: 20, y: 11 });
const SPAWN_TILE_POSITION = Object.freeze({ x: 20, y: 20 });
const GRASS_TILES = Object.freeze([
  GARDEN_TILE.grass,
  GARDEN_TILE.grassLight,
  GARDEN_TILE.grassDark,
]);
const FLOWER_TILES = Object.freeze([
  GARDEN_TILE.flowerBlue,
  GARDEN_TILE.flowerWhite,
  GARDEN_TILE.flowerLilac,
  GARDEN_TILE.flowerPink,
]);

function cellRandom(x, y, salt = 0) {
  const value = Math.sin((x + salt * 17.13) * 127.1 + (y + salt * 9.7) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function chooseFlower(x, y) {
  const color = cellRandom(x, y, 5);
  if (color < 0.48) return GARDEN_TILE.flowerBlue;
  if (color < 0.70) return GARDEN_TILE.flowerWhite;
  if (color < 0.88) return GARDEN_TILE.flowerLilac;
  return GARDEN_TILE.flowerPink;
}

/**
 * A compact, fully walkable meadow. The banyan is the only large prop;
 * flowers are distributed across the complete grass field.
 */
export function buildGardenLayout(columns = GARDEN_COLUMNS, rows = GARDEN_ROWS) {
  if (!Number.isInteger(columns) || columns < 20) throw new RangeError('Garden columns must be an integer >= 20');
  if (!Number.isInteger(rows) || rows < 16) throw new RangeError('Garden rows must be an integer >= 16');

  const tree = {
    x: Math.min(TREE_TILE_POSITION.x, columns - 4),
    y: Math.min(TREE_TILE_POSITION.y, rows - 8),
  };
  const spawn = {
    x: Math.min(SPAWN_TILE_POSITION.x, columns - 3),
    y: Math.min(SPAWN_TILE_POSITION.y, rows - 3),
  };
  const ground = Array.from({ length: rows }, () => Array(columns).fill(GARDEN_TILE.grass));
  const decor = Array.from({ length: rows }, () => Array(columns).fill(0));

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const variation = cellRandom(x, y, 3);
      ground[y][x] = variation > 0.84 ? GARDEN_TILE.grassDark
        : variation > 0.48 ? GARDEN_TILE.grassLight
          : GARDEN_TILE.grass;

      const treeDistance = Math.hypot(x + 0.5 - tree.x, y + 0.5 - tree.y);
      const spawnDistance = Math.hypot(x + 0.5 - spawn.x, y + 0.5 - spawn.y);
      const beneathCanopy = treeDistance < 5.4;
      const clearCharacterSpace = spawnDistance < 2.1;
      if (beneathCanopy || clearCharacterSpace) continue;

      // Dense mixed flower cover, with blue flowers as the dominant color.
      if (cellRandom(x, y, 4) < 0.46) decor[y][x] = chooseFlower(x, y);
    }
  }

  return {
    columns,
    rows,
    ground,
    decor,
    tree,
    spawn,
  };
}
