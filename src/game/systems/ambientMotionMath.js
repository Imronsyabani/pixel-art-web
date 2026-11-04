export function getSwayRotation(timeMs, phase = 0, amplitude = 0.06, speed = 1.5) {
  return Math.sin((timeMs / 1000) * speed + phase) * amplitude;
}

export function getPulseAlpha(timeMs, phase = 0, min = 0.18, max = 0.58, speed = 1.2) {
  const wave = (Math.sin((timeMs / 1000) * speed + phase) + 1) / 2;
  return min + (max - min) * wave;
}

export function wrapDriftingX(x, worldWidth, margin = 12) {
  if (x > worldWidth + margin) return -margin;
  if (x < -margin) return worldWidth + margin;
  return x;
}

export function getPetalDriftY(baseY, timeMs, phase = 0, amplitude = 5, speed = 1.1) {
  return baseY + Math.sin((timeMs / 1000) * speed + phase) * amplitude;
}
