import test from 'node:test';
import assert from 'node:assert/strict';
import { VirtualJoystick } from './VirtualJoystick.js';

class MockEmitter {
  constructor() { this.listeners = new Map(); }
  on(event, handler) {
    const handlers = this.listeners.get(event) ?? new Set();
    handlers.add(handler);
    this.listeners.set(event, handlers);
    return this;
  }
  off(event, handler) { this.listeners.get(event)?.delete(handler); return this; }
  emit(event, payload) {
    for (const handler of this.listeners.get(event) ?? []) handler(payload);
  }
  count(event) { return this.listeners.get(event)?.size ?? 0; }
}

function createMockScene() {
  const input = new MockEmitter();
  const graphics = {
    clear() { return this; }, fillStyle() { return this; }, fillCircle() { return this; },
    lineStyle() { return this; }, strokeCircle() { return this; },
    setScrollFactor() { return this; }, setDepth() { return this; },
    destroy() { this.destroyed = true; },
  };
  return {
    scale: { height: 540 },
    input,
    add: { graphics: () => graphics },
    graphics,
  };
}

test('joystick claims a pointer only when it begins inside the control zone', () => {
  const scene = createMockScene();
  const joystick = new VirtualJoystick(scene, { x: 80, y: 450, radius: 50 });
  scene.input.emit('pointerdown', { id: 1, x: 300, y: 300, isDown: true });
  assert.equal(joystick.pointerId, null);
  scene.input.emit('pointerdown', { id: 2, x: 80, y: 450, isDown: true });
  assert.equal(joystick.pointerId, 2);
  joystick.destroy();
});

test('drag updates the analog vector and clamps the visual knob to its radius', () => {
  const scene = createMockScene();
  const joystick = new VirtualJoystick(scene, { x: 80, y: 450, radius: 50 });
  scene.input.emit('pointerdown', { id: 1, x: 80, y: 450, isDown: true });
  scene.input.emit('pointermove', { id: 1, x: 180, y: 450, isDown: true });
  assert.deepEqual(joystick.getVector(), { x: 1, y: 0 });
  assert.equal(Math.round(Math.hypot(joystick.knobX - 80, joystick.knobY - 450)), 50);
  joystick.destroy();
});

test('another pointer cannot take over an active joystick', () => {
  const scene = createMockScene();
  const joystick = new VirtualJoystick(scene, { x: 80, y: 450, radius: 50 });
  scene.input.emit('pointerdown', { id: 1, x: 80, y: 450, isDown: true });
  scene.input.emit('pointerdown', { id: 2, x: 80, y: 450, isDown: true });
  scene.input.emit('pointermove', { id: 2, x: 130, y: 450, isDown: true });
  assert.equal(joystick.pointerId, 1);
  assert.deepEqual(joystick.getVector(), { x: 0, y: 0 });
  joystick.destroy();
});

test('pointer release resets the joystick and removes listeners on destroy', () => {
  const scene = createMockScene();
  const joystick = new VirtualJoystick(scene, { x: 80, y: 450, radius: 50 });
  scene.input.emit('pointerdown', { id: 1, x: 80, y: 450, isDown: true });
  scene.input.emit('pointermove', { id: 1, x: 130, y: 450, isDown: true });
  scene.input.emit('pointerupoutside', { id: 1 });
  assert.equal(joystick.pointerId, null);
  assert.deepEqual(joystick.getVector(), { x: 0, y: 0 });
  joystick.destroy();
  assert.equal(scene.input.count('pointerdown'), 0);
  assert.equal(scene.input.count('pointermove'), 0);
  assert.equal(scene.graphics.destroyed, true);
});


test('responsive layout resets an active drag and moves the joystick safely', () => {
  const scene = createMockScene();
  const joystick = new VirtualJoystick(scene, { x: 80, y: 450, radius: 50 });
  scene.input.emit('pointerdown', { id: 1, x: 80, y: 450, isDown: true });
  scene.input.emit('pointermove', { id: 1, x: 130, y: 450, isDown: true });
  joystick.setLayout(62, 690, 42);
  assert.equal(joystick.pointerId, null);
  assert.deepEqual(joystick.getVector(), { x: 0, y: 0 });
  assert.equal(joystick.centerX, 62);
  assert.equal(joystick.centerY, 690);
  assert.ok(Math.hypot(joystick.knobX - 62, joystick.knobY - 690) <= 42.001);
  assert.equal(joystick.hitRadius, 60.9);
  joystick.destroy();
});
