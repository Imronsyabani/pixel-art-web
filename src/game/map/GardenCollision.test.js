import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGardenLayout, GARDEN_TILE, TILE_SIZE } from './gardenLayout.js';
import { canOccupyPosition, getGardenObstacleRects, isWalkableTile } from './GardenCollision.js';

const layout = buildGardenLayout();

test('grass and flower tiles are walkable while legacy water, wet sand and cliffs stay blocked', () => {
  for (const tile of [
    GARDEN_TILE.grass,
    GARDEN_TILE.grassLight,
    GARDEN_TILE.grassDark,
  ]) assert.equal(isWalkableTile(tile, 0), true);
  assert.equal(isWalkableTile(GARDEN_TILE.grass, GARDEN_TILE.flowerBlue), true);
  for (const tile of [
    GARDEN_TILE.water,
    GARDEN_TILE.waterWave,
    GARDEN_TILE.wetSand,
    GARDEN_TILE.cliffTop,
  ]) assert.equal(isWalkableTile(tile, 0), false);
});

test('legacy decorative obstacles remain blocked but the new meadow only places flowers', () => {
  for (const tile of [
    GARDEN_TILE.shrub,
    GARDEN_TILE.rock,
    GARDEN_TILE.fenceHorizontal,
    GARDEN_TILE.fenceVertical,
  ]) assert.equal(isWalkableTile(GARDEN_TILE.grass, tile), false);

  const placed = new Set(layout.decor.flat().filter(Boolean));
  for (const tile of [
    GARDEN_TILE.shrub,
    GARDEN_TILE.rock,
    GARDEN_TILE.fenceHorizontal,
    GARDEN_TILE.fenceVertical,
  ]) assert.equal(placed.has(tile), false);
});

test('full grass map allows walking from edge to edge within world bounds', () => {
  assert.equal(canOccupyPosition(layout, 16, 16), true);
  assert.equal(canOccupyPosition(layout, 1, 1), false);
  assert.equal(canOccupyPosition(layout, 640, 760), true);
});

test('only banyan trunk and roots expose obstacle rectangles', () => {
  const obstacles = getGardenObstacleRects(layout.tree);
  assert.deepEqual(
    obstacles.map((rect) => rect.id),
    ['central-banyan-trunk', 'banyan-west-root', 'banyan-east-root'],
  );
  assert.equal(
    canOccupyPosition(
      layout,
      layout.tree.x * TILE_SIZE + 16,
      layout.tree.y * TILE_SIZE + 16,
    ),
    false,
  );
  assert.equal(canOccupyPosition(layout, 416, 392), true);
});

test('flower decorations do not block a character footprint', () => {
  let found = false;
  for (let y = 0; y < layout.rows && !found; y += 1) {
    for (let x = 0; x < layout.columns && !found; x += 1) {
      if ([GARDEN_TILE.flowerBlue, GARDEN_TILE.flowerWhite, GARDEN_TILE.flowerPink, GARDEN_TILE.flowerLilac].includes(layout.decor[y][x])) {
        assert.equal(
          canOccupyPosition(layout, x * TILE_SIZE + 16, y * TILE_SIZE + 16, { radius: 4 }),
          true,
        );
        found = true;
      }
    }
  }
  assert.equal(found, true);
});
