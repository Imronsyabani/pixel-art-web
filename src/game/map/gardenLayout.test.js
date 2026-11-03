import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGardenLayout,
  GARDEN_COLUMNS,
  GARDEN_ROWS,
  GARDEN_TILE,
  TREE_TILE_POSITION,
} from './gardenLayout.js';

test('garden layout has stable world dimensions and rectangular tile layers', () => {
  const layout = buildGardenLayout();
  assert.equal(layout.columns, GARDEN_COLUMNS);
  assert.equal(layout.rows, GARDEN_ROWS);
  assert.equal(layout.ground.length, GARDEN_ROWS);
  assert.equal(layout.decor.length, GARDEN_ROWS);
  for (const row of [...layout.ground, ...layout.decor]) assert.equal(row.length, GARDEN_COLUMNS);
});

test('ocean, beach, cliff, grass and stone path all appear in the ground layer', () => {
  const { ground } = buildGardenLayout();
  const ids = new Set(ground.flat());
  for (const tile of [
    GARDEN_TILE.water, GARDEN_TILE.waterWave, GARDEN_TILE.sand,
    GARDEN_TILE.wetSand, GARDEN_TILE.cliffTop, GARDEN_TILE.grass,
    GARDEN_TILE.path, GARDEN_TILE.pathAlt,
  ]) assert.ok(ids.has(tile), `expected tile id ${tile} in generated ground`);
});

test('flower beds around the central tree are blue-dominant', () => {
  const { decor, tree } = buildGardenLayout();
  let blue = 0;
  let other = 0;
  for (let y = 0; y < decor.length; y += 1) {
    for (let x = 0; x < decor[y].length; x += 1) {
      const distance = Math.hypot(x + 0.5 - tree.x, y + 0.5 - tree.y);
      if (distance >= 3.2 && distance < 9.5) {
        if (decor[y][x] === GARDEN_TILE.flowerBlue) blue += 1;
        else if ([GARDEN_TILE.flowerWhite, GARDEN_TILE.flowerPink, GARDEN_TILE.flowerLilac].includes(decor[y][x])) other += 1;
      }
    }
  }
  assert.ok(blue > 0, 'expected blue flowers in central garden bed');
  assert.ok(blue > other, `blue flowers (${blue}) should outnumber other colors (${other})`);
});

test('central tree and spawn remain safely inside the garden map', () => {
  const layout = buildGardenLayout();
  assert.ok(layout.tree.x > 4 && layout.tree.x < layout.columns - 4);
  assert.ok(layout.tree.y > 4 && layout.tree.y < layout.rows - 4);
  assert.ok(layout.spawn.x > 0 && layout.spawn.x < layout.columns);
  assert.ok(layout.spawn.y > 0 && layout.spawn.y < layout.rows);
  assert.deepEqual(layout.tree, TREE_TILE_POSITION);
});

test('layout generator rejects invalid map sizes', () => {
  assert.throws(() => buildGardenLayout(10, 48), /columns/);
  assert.throws(() => buildGardenLayout(72, 8), /rows/);
});
