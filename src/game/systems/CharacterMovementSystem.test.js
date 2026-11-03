import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMovementVector, vectorToTarget } from './movementMath.js';
import { getFacingDirection, updateCharacterMovement } from './CharacterMovementSystem.js';

function makeSprite(x = 0, y = 0) {
  const data = new Map([['direction', 'down']]);
  return {
    x, y,
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; },
  };
}

test('normalizes diagonal vectors to avoid faster diagonal movement', () => {
  const diagonal = normalizeMovementVector({ x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 0.000001);
  assert.deepEqual(normalizeMovementVector({ x: 0, y: 0 }), { x: 0, y: 0 });
});

test('maps vectors to four cardinal facing directions', () => {
  assert.equal(getFacingDirection({ x: 1, y: 0 }), 'right');
  assert.equal(getFacingDirection({ x: -1, y: 0 }), 'left');
  assert.equal(getFacingDirection({ x: 0, y: 1 }), 'down');
  assert.equal(getFacingDirection({ x: 0, y: -1 }), 'up');
  assert.equal(getFacingDirection({ x: 0, y: 0 }, 'left'), 'left');
});

test('moves consistently by delta time and clamps to world bounds', () => {
  const sprite = makeSprite(10, 10);
  const result = updateCharacterMovement(sprite, { x: 1, y: 0 }, 100, {
    speed: 100, maxDeltaMs: 100, radius: 0, maxSubstep: 1, bounds: { left: 0, right: 15, top: 0, bottom: 20 },
  });
  assert.equal(result.moved, true);
  assert.equal(sprite.x, 15);
  assert.equal(sprite.y, 10);
  assert.equal(result.direction, 'right');
});

test('zero input does not move the sprite', () => {
  const sprite = makeSprite(10, 12);
  const result = updateCharacterMovement(sprite, { x: 0, y: 0 }, 16);
  assert.equal(result.moved, false);
  assert.equal(sprite.x, 10);
  assert.equal(sprite.y, 12);
});

test('target vector is normalized', () => {
  const vector = vectorToTarget({ x: 0, y: 0 }, { x: 3, y: 4 });
  assert.deepEqual(vector, { x: 0.6, y: 0.8 });
});
