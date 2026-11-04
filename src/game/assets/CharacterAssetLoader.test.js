import test from 'node:test';
import assert from 'node:assert/strict';
import { preloadCharacterAssets } from './CharacterAssetLoader.js';

function makeScene() {
  const queued = [];
  return {
    queued,
    load: {
      spritesheet(key, source, config) {
        queued.push({ key, source, config });
      },
    },
  };
}

test('single-character URL mode queues only the visible character sheets', () => {
  const scene = makeScene();
  preloadCharacterAssets(scene, ['rintaro']);
  assert.deepEqual(scene.queued.map((item) => item.key), ['rintaro-idle', 'rintaro-walk']);
});

test('couple URL mode queues both characters before scene creation', () => {
  const scene = makeScene();
  preloadCharacterAssets(scene, ['rintaro', 'kaoruko']);
  assert.deepEqual(scene.queued.map((item) => item.key), [
    'rintaro-idle', 'rintaro-walk', 'kaoruko-idle', 'kaoruko-walk',
  ]);
});

test('unknown character IDs do not cause unrelated assets to be queued', () => {
  const scene = makeScene();
  preloadCharacterAssets(scene, ['not-a-character']);
  assert.equal(scene.queued.length, 0);
});
