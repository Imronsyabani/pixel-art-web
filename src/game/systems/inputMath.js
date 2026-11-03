import { normalizeMovementVector } from './movementMath.js';

/** Convert cursor/WASD state into a signed movement vector. */
export function getKeyboardMovementVector(keys = {}) {
  const left = Boolean(keys.left || keys.a);
  const right = Boolean(keys.right || keys.d);
  const up = Boolean(keys.up || keys.w);
  const down = Boolean(keys.down || keys.s);
  return normalizeMovementVector({
    x: Number(right) - Number(left),
    y: Number(down) - Number(up),
  });
}

/** Convert a pointer displacement into a normalized analog stick vector. */
export function getJoystickMovementVector(dx, dy, radius, deadzone = 0.16) {
  if (!Number.isFinite(radius) || radius <= 0) return { x: 0, y: 0 };
  const safeDeadzone = Math.max(0, Math.min(deadzone, 0.95));
  const rawX = Number.isFinite(dx) ? dx / radius : 0;
  const rawY = Number.isFinite(dy) ? dy / radius : 0;
  const magnitude = Math.hypot(rawX, rawY);
  if (magnitude <= safeDeadzone || magnitude === 0) return { x: 0, y: 0 };

  const clampedMagnitude = Math.min(1, magnitude);
  const adjustedMagnitude = (clampedMagnitude - safeDeadzone) / (1 - safeDeadzone);
  const scale = adjustedMagnitude / magnitude;
  return { x: rawX * scale, y: rawY * scale };
}

/** Combine keyboard and analog input; diagonal speed stays capped at one. */
export function combineMovementInputs(keyboard = {}, joystick = {}) {
  return normalizeMovementVector({
    x: (Number.isFinite(keyboard.x) ? keyboard.x : 0) + (Number.isFinite(joystick.x) ? joystick.x : 0),
    y: (Number.isFinite(keyboard.y) ? keyboard.y : 0) + (Number.isFinite(joystick.y) ? joystick.y : 0),
  });
}
