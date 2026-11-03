import { vectorToTarget } from './movementMath.js';
import { updateCharacterMovement, getFacingDirection } from './CharacterMovementSystem.js';

const distanceBetween = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Stores a sampled path behind the leader. Follower targets are interpolated
 * along the path, so they turn through the same corners instead of cutting them.
 */
export class CharacterTrail {
  constructor({ sampleSpacing = 4, maxLength = 1400 } = {}) {
    this.sampleSpacing = sampleSpacing;
    this.maxLength = maxLength;
    this.points = [];
    this.length = 0;
  }

  record(x, y) {
    const point = { x, y };
    const last = this.points[this.points.length - 1];
    if (last) {
      const gap = distanceBetween(last, point);
      if (gap < this.sampleSpacing) return false;
      this.length += gap;
    }
    this.points.push(point);
    this.trim();
    return true;
  }

  seed(points) {
    for (const point of points) this.record(point.x, point.y);
    return this;
  }

  trim() {
    while (this.points.length > 2 && this.length > this.maxLength) {
      const removed = this.points.shift();
      const next = this.points[0];
      this.length -= distanceBetween(removed, next);
    }
  }

  getPointBehind(distance) {
    if (this.points.length === 0) return null;
    let remaining = Math.max(0, distance);
    for (let index = this.points.length - 1; index > 0; index -= 1) {
      const newer = this.points[index];
      const older = this.points[index - 1];
      const segmentLength = distanceBetween(older, newer);
      if (segmentLength >= remaining && segmentLength > 0) {
        const ratio = remaining / segmentLength;
        return {
          x: newer.x + (older.x - newer.x) * ratio,
          y: newer.y + (older.y - newer.y) * ratio,
        };
      }
      remaining -= segmentLength;
    }
    return { ...this.points[0] };
  }
}

/** Move a follower toward a point a fixed path distance behind its leader. */
export function updateFollowerMovement(follower, trail, deltaMs, options = {}) {
  const {
    followDistance = 86,
    stopDistance = 5,
    speed = 112,
    bounds = null,
  } = options;
  const target = trail.getPointBehind(followDistance);
  if (!target) {
    return { moved: false, direction: follower.getData?.('direction') ?? 'down', target: null };
  }

  const gap = distanceBetween(follower, target);
  const directionVector = vectorToTarget(follower, target);
  const direction = getFacingDirection(directionVector, follower.getData?.('direction') ?? 'down');
  if (gap <= stopDistance) {
    return { moved: false, direction, target, x: follower.x, y: follower.y };
  }

  const safeDeltaMs = Math.max(0, Math.min(Number(deltaMs) || 0, 50));
  const maxStep = speed * safeDeltaMs / 1000;
  if (maxStep <= 0) {
    return { moved: false, direction, target, x: follower.x, y: follower.y };
  }
  const stepDistance = Math.min(gap - stopDistance, maxStep);
  const ratio = stepDistance / maxStep;
  const stepVector = {
    x: directionVector.x * ratio,
    y: directionVector.y * ratio,
  };
  const result = updateCharacterMovement(follower, stepVector, safeDeltaMs, { speed, bounds });
  return { ...result, target };
}
