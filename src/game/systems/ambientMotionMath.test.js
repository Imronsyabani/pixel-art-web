import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPetalDriftY,
  getPulseAlpha,
  getSwayRotation,
  wrapDriftingX,
} from './ambientMotionMath.js';

test('flower sway remains within its configured rotation amplitude', () => {
  for (let time = 0; time < 10000; time += 37) {
    assert.ok(Math.abs(getSwayRotation(time, 0.4, 0.08)) <= 0.080001);
  }
});

test('ocean glint alpha remains in its configured range', () => {
  for (let time = 0; time < 10000; time += 53) {
    const alpha = getPulseAlpha(time, 1.2, 0.1, 0.5);
    assert.ok(alpha >= 0.1 && alpha <= 0.5);
  }
});

test('petal drift gently oscillates around its base position', () => {
  const y = getPetalDriftY(150, 900, 0.3, 6);
  assert.ok(y >= 144 && y <= 156);
});

test('drifting petals wrap at horizontal world edges', () => {
  assert.equal(wrapDriftingX(120, 100), -12);
  assert.equal(wrapDriftingX(-20, 100), 112);
  assert.equal(wrapDriftingX(50, 100), 50);
});
