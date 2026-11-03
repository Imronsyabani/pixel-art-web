import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterTrail, updateFollowerMovement } from './CharacterTrail.js';

function makeSprite(x = 0, y = 0) {
  const data = new Map([['direction', 'down']]);
  return {
    x, y,
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; },
  };
}

test('records path points only after the configured sampling distance', () => {
  const trail = new CharacterTrail({ sampleSpacing: 5 });
  assert.equal(trail.record(0, 0), true);
  assert.equal(trail.record(2, 0), false);
  assert.equal(trail.record(6, 0), true);
  assert.equal(trail.points.length, 2);
});

test('interpolates the follower target along corners in the leader path', () => {
  const trail = new CharacterTrail({ sampleSpacing: 1 }).seed([
    { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 },
  ]);
  assert.deepEqual(trail.getPointBehind(5), { x: 10, y: 5 });
  assert.deepEqual(trail.getPointBehind(15), { x: 5, y: 0 });
});

test('trims old path data while preserving a minimum of two points', () => {
  const trail = new CharacterTrail({ sampleSpacing: 1, maxLength: 12 });
  trail.seed([{x:0,y:0},{x:5,y:0},{x:10,y:0},{x:15,y:0},{x:20,y:0}]);
  assert.ok(trail.length <= 12);
  assert.ok(trail.points.length >= 2);
});

test('moves the follower toward its target and respects stop distance', () => {
  const trail = new CharacterTrail({ sampleSpacing: 1 }).seed([
    { x: 0, y: 0 }, { x: 100, y: 0 },
  ]);
  const follower = makeSprite(0, 20);
  const result = updateFollowerMovement(follower, trail, 100, {
    followDistance: 30, stopDistance: 2, speed: 100,
  });
  assert.equal(result.moved, true);
  assert.ok(follower.x > 0);

  const closeFollower = makeSprite(70, 0);
  const stopped = updateFollowerMovement(closeFollower, trail, 16, {
    followDistance: 30, stopDistance: 2,
  });
  assert.equal(stopped.moved, false);
});
