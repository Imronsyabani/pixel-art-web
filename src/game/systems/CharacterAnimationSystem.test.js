import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCharacterAnimationFrames,
  getCharacterAnimationKey,
  CHARACTER_ANIMATION_STATES,
} from './CharacterAnimationSystem.js';

for (const characterId of ['rintaro', 'kaoruko']) {
  test(`${characterId} has four directional idle and walk animations`, () => {
    for (const [row, direction] of ['down', 'left', 'right', 'up'].entries()) {
      assert.equal(getCharacterAnimationKey(characterId, 'idle', direction), `${characterId}-idle-${direction}`);
      assert.equal(getCharacterAnimationKey(characterId, 'walk', direction), `${characterId}-walk-${direction}`);
      assert.deepEqual(getCharacterAnimationFrames(characterId, 'idle', direction), [row * 4, row * 4 + 1, row * 4 + 2, row * 4 + 3]);
      assert.deepEqual(getCharacterAnimationFrames(characterId, 'walk', direction), Array.from({length:6}, (_, i) => row * 6 + i));
    }
  });
}

test('animation speeds are explicit and loop continuously', () => {
  assert.equal(CHARACTER_ANIMATION_STATES.idle.frameRate, 3);
  assert.equal(CHARACTER_ANIMATION_STATES.walk.frameRate, 9);
  assert.equal(CHARACTER_ANIMATION_STATES.idle.repeat, -1);
  assert.equal(CHARACTER_ANIMATION_STATES.walk.repeat, -1);
});

test('invalid animation names fail with useful errors', () => {
  assert.throws(() => getCharacterAnimationKey('unknown', 'idle', 'down'), /Unknown character/);
  assert.throws(() => getCharacterAnimationKey('rintaro', 'run', 'down'), /Unknown animation state/);
  assert.throws(() => getCharacterAnimationKey('rintaro', 'walk', 'diagonal'), /Unknown direction/);
});
