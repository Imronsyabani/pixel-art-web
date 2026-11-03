import { normalizeMovementVector } from './movementMath.js';

export function getFacingDirection(vector, fallback = 'down') {
  const normalized = normalizeMovementVector(vector);
  if (normalized.x === 0 && normalized.y === 0) return fallback;
  if (Math.abs(normalized.x) > Math.abs(normalized.y)) {
    return normalized.x > 0 ? 'right' : 'left';
  }
  return normalized.y > 0 ? 'down' : 'up';
}

/**
 * Move a sprite using a normalized direction vector and frame delta.
 * Bounds are optional world-coordinate limits for the sprite anchor.
 */
export function updateCharacterMovement(sprite, input, deltaMs, options = {}) {
  const {
    speed = 100,
    bounds = null,
    maxDeltaMs = 50,
  } = options;
  const vector = normalizeMovementVector(input);
  const delta = Math.max(0, Math.min(Number(deltaMs) || 0, maxDeltaMs));
  const direction = getFacingDirection(vector, sprite.getData?.('direction') ?? 'down');

  if (vector.x === 0 && vector.y === 0 || delta === 0) {
    return { moved: false, direction, vector, x: sprite.x, y: sprite.y };
  }

  const distance = speed * (delta / 1000);
  let x = sprite.x + vector.x * distance;
  let y = sprite.y + vector.y * distance;

  if (bounds) {
    x = Math.max(bounds.left, Math.min(bounds.right, x));
    y = Math.max(bounds.top, Math.min(bounds.bottom, y));
  }

  const moved = Math.hypot(x - sprite.x, y - sprite.y) > 0.001;
  if (moved) {
    if (typeof sprite.setPosition === 'function') sprite.setPosition(x, y);
    else { sprite.x = x; sprite.y = y; }
  }

  return { moved, direction, vector, x, y };
}
