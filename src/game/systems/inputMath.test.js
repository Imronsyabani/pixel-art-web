import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getKeyboardMovementVector,
  getJoystickMovementVector,
  combineMovementInputs,
} from './inputMath.js';

test('WASD and arrow-key states map to the four movement directions', () => {
  assert.deepEqual(getKeyboardMovementVector({ up: true }), { x: 0, y: -1 });
  assert.deepEqual(getKeyboardMovementVector({ down: true }), { x: 0, y: 1 });
  assert.deepEqual(getKeyboardMovementVector({ left: true }), { x: -1, y: 0 });
  assert.deepEqual(getKeyboardMovementVector({ right: true }), { x: 1, y: 0 });
  assert.deepEqual(getKeyboardMovementVector({ w: true }), { x: 0, y: -1 });
  assert.deepEqual(getKeyboardMovementVector({ a: true }), { x: -1, y: 0 });
  assert.deepEqual(getKeyboardMovementVector({ s: true }), { x: 0, y: 1 });
  assert.deepEqual(getKeyboardMovementVector({ d: true }), { x: 1, y: 0 });
});

test('keyboard diagonal input is normalized', () => {
  const vector = getKeyboardMovementVector({ up: true, right: true });
  assert.ok(Math.abs(Math.hypot(vector.x, vector.y) - 1) < 0.000001);
});

test('joystick applies a deadzone and clamps magnitude', () => {
  assert.deepEqual(getJoystickMovementVector(2, 0, 54), { x: 0, y: 0 });
  const full = getJoystickMovementVector(100, 0, 54);
  assert.equal(full.x, 1);
  assert.equal(full.y, 0);
});

test('joystick preserves analog direction and magnitude outside the deadzone', () => {
  const vector = getJoystickMovementVector(27, 0, 54);
  assert.ok(vector.x > 0 && vector.x < 1);
  assert.equal(vector.y, 0);
  const diagonal = getJoystickMovementVector(40, 40, 54);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 0.000001);
});

test('keyboard and joystick input combine without exceeding unit speed', () => {
  const combined = combineMovementInputs({ x: 1, y: 0 }, { x: 0, y: -1 });
  assert.ok(Math.abs(Math.hypot(combined.x, combined.y) - 1) < 0.000001);
  assert.deepEqual(combineMovementInputs({}, {}), { x: 0, y: 0 });
});
