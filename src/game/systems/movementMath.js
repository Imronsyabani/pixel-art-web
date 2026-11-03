/** Normalize digital or analog input without making diagonal movement faster. */
export function normalizeMovementVector(input = {}) {
  const x = Number.isFinite(input.x) ? input.x : 0;
  const y = Number.isFinite(input.y) ? input.y : 0;
  const magnitude = Math.hypot(x, y);
  if (magnitude < 0.0001) return { x: 0, y: 0 };
  const divisor = Math.max(1, magnitude);
  return { x: x / divisor, y: y / divisor };
}

export function vectorToTarget(from, to) {
  return normalizeMovementVector({ x: to.x - from.x, y: to.y - from.y });
}
