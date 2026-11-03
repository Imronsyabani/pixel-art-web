import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_ASSETS, CHARACTER_DIRECTIONS, getCharacterFrame, getDirectionRow } from './characterAssets.js';

test('both characters use consistent 64x64 idle and walk sheets', () => {
  assert.deepEqual([...Object.keys(CHARACTER_ASSETS)].sort(), ['kaoruko', 'rintaro']);
  for (const asset of Object.values(CHARACTER_ASSETS)) {
    assert.equal(asset.frameWidth, 64);
    assert.equal(asset.frameHeight, 64);
    assert.equal(asset.idleFrameCount, 4);
    assert.equal(asset.walkFrameCount, 6);
    assert.deepEqual([...asset.directions], ['down', 'left', 'right', 'up']);
    assert.match(asset.idleSrc, /^\/assets\/characters\/(rintaro|kaoruko)\/idle\.png$/);
    assert.match(asset.walkSrc, /^\/assets\/characters\/(rintaro|kaoruko)\/walk\.png$/);
  }
});

test('direction names map to consistent texture rows and idle frame starts', () => {
  assert.deepEqual(CHARACTER_DIRECTIONS.map((direction) => getDirectionRow('rintaro', direction)), [0, 1, 2, 3]);
  assert.deepEqual(CHARACTER_DIRECTIONS.map((direction) => getCharacterFrame('kaoruko', direction)), [0, 4, 8, 12]);
});

test('unknown characters and directions fail clearly', () => {
  assert.throws(() => getDirectionRow('unknown'), /Unknown character asset/);
  assert.throws(() => getDirectionRow('rintaro', 'diagonal'), /Unknown direction/);
});
