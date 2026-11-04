import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGardenLayout,
  GARDEN_COLUMNS,
  GARDEN_ROWS,
  GARDEN_TILE,
  TREE_TILE_POSITION,
} from './gardenLayout.js';

test('garden is a compact 40 by 28 tile grass meadow', () => {
  const layout = buildGardenLayout();
  assert.equal(GARDEN_COLUMNS, 40);
  assert.equal(GARDEN_ROWS, 28);
  assert.equal(layout.columns, 40);
  assert.equal(layout.rows, 28);
  assert.equal(layout.ground.length, 28);
  assert.equal(layout.decor.length, 28);
  for (const row of [...layout.ground, ...layout.decor]) assert.equal(row.length, 40);

  const groundIds = new Set(layout.ground.flat());
  for (const tile of [GARDEN_TILE.grass, GARDEN_TILE.grassLight, GARDEN_TILE.grassDark]) {
    assert.ok(groundIds.has(tile), \`expected grass tile id \${tile}\`);
  }
  for (const tile of [
    GARDEN_TILE.water, GARDEN_TILE.waterWave, GARDEN_TILE.sand,
    GARDEN_TILE.wetSand, GARDEN_TILE.cliffTop, GARDEN_TILE.path,
    GARDEN_TILE.pathAlt,
  ]) assert.equal(groundIds.has(tile), false, \`unexpected terrain tile \${tile}\`);
});

test('flowers cover the meadow with a blue-dominant mix of four colors', () => {
  const { decor } = buildGardenLayout();
  const counts = new Map();
  for (const tile of decor.flat()) {
    if (tile) counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }
  const flowerCount = [...counts.values()].reduce((sum, count) => sum + count, 0);
  assert.ok(flowerCount > GARDEN_COLUMNS * GARDEN_ROWS * 0.25);
  for (const tile of [
    GARDEN_TILE.flowerBlue,
    GARDEN_TILE.flowerWhite,
    GARDEN_TILE.flowerLilac,
    GARDEN_TILE.flowerPink,
  ]) assert.ok((counts.get(tile) ?? 0) > 0, \`missing flower tile \${tile}\`);
  assert.ok(counts.get(GARDEN_TILE.flowerBlue) > counts.get(GARDEN_TILE.flowerPink));
});

test('banyan stays centered and the player spawn is below its trunk', () => {
  const layout = buildGardenLayout();
  assert.deepEqual(layout.tree, TREE_TILE_POSITION);
  assert.equal(layout.spawn.x, 20);
  assert.ok(layout.spawn.y > layout.tree.y + 6);
  assert.ok(layout.tree.x > 4 && layout.tree.x < layout.columns - 4);
  assert.ok(layout.tree.y > 4 && layout.tree.y < layout.rows - 4);
});

test('layout generator rejects invalid map sizes', () => {
  assert.throws(() => buildGardenLayout(10, 28), /columns/);
  assert.throws(() => buildGardenLayout(40, 8), /rows/);
});
