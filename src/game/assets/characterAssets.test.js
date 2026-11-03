import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_ASSETS, CHARACTER_DIRECTIONS, getCharacterFrame } from './characterAssets.js';

test('both character assets share the 64x64 four-direction sheet contract', () => {
  assert.deepEqual([...Object.keys(CHARACTER_ASSETS)].sort(), ['kaoruko', 'rintaro']);
  for (const asset of Object.values(CHARACTER_ASSETS)) {
    assert.equal(asset.frameWidth, 64);
    assert.equal(asset.frameHeight, 64);
    assert.equal(asset.frameCount, 4);
    assert.deepEqual([...asset.directions], ['down', 'left', 'right', 'up']);
    assert.match(asset.src, /^\/assets\/characters\/(rintaro|kaoruko)\/spritesheet\.png$/);
  }
});

test('direction names map to stable frame indices', () => {
  assert.deepEqual(CHARACTER_DIRECTIONS.map((direction) => getCharacterFrame('rintaro', direction)), [0, 1, 2, 3]);
  assert.equal(getCharacterFrame('kaoruko', 'up'), 3);
});

test('unknown characters and directions fail clearly', () => {
  assert.throws(() => getCharacterFrame('unknown'), /Unknown character asset/);
  assert.throws(() => getCharacterFrame('rintaro', 'diagonal'), /Unknown direction/);
});
