import { getJoystickMovementVector } from './inputMath.js';

const OUTER_RADIUS = 54;

/** Semi-transparent touch joystick, drawn in fixed screen coordinates. */
export class VirtualJoystick {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.radius = options.radius ?? OUTER_RADIUS;
    this.hitRadius = options.hitRadius ?? this.radius * 1.45;
    this.centerX = options.x ?? 82;
    this.centerY = options.y ?? scene.scale.height - 88;
    this.knobX = this.centerX;
    this.knobY = this.centerY;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };

    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointermove', this.onPointerMove);
    scene.input.on('pointerup', this.onPointerUp);
    scene.input.on('pointerupoutside', this.onPointerUp);
    this.draw();
  }

  setLayout(x, y, radius = this.radius) {
    this.centerX = x;
    this.centerY = y;
    this.radius = radius;
    this.hitRadius = radius * 1.45;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.knobX = x;
    this.knobY = y;
    this.draw();
  }

  handlePointerDown(pointer) {
    if (this.pointerId !== null) return;
    const dx = pointer.x - this.centerX;
    const dy = pointer.y - this.centerY;
    if (Math.hypot(dx, dy) > this.hitRadius) return;

    this.pointerId = pointer.id;
    this.updateFromPointer(pointer);
  }

  handlePointerMove(pointer) {
    if (this.pointerId !== pointer.id || !pointer.isDown) return;
    this.updateFromPointer(pointer);
  }

  handlePointerUp(pointer) {
    if (this.pointerId !== pointer.id) return;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.knobX = this.centerX;
    this.knobY = this.centerY;
    this.draw();
  }

  updateFromPointer(pointer) {
    const dx = pointer.x - this.centerX;
    const dy = pointer.y - this.centerY;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, this.radius);
    const ratio = distance > 0 ? clampedDistance / distance : 0;

    this.knobX = this.centerX + dx * ratio;
    this.knobY = this.centerY + dy * ratio;
    this.vector = getJoystickMovementVector(dx, dy, this.radius);
    this.draw();
  }

  getVector() {
    return { ...this.vector };
  }

  draw() {
    this.graphics.clear();
    this.graphics.fillStyle(0xffffff, 0.5);
    this.graphics.fillCircle(this.centerX, this.centerY, this.radius);
    this.graphics.lineStyle(3, 0xffffff, 0.72);
    this.graphics.strokeCircle(this.centerX, this.centerY, this.radius);
    this.graphics.fillStyle(0xffffff, 0.78);
    this.graphics.fillCircle(this.knobX, this.knobY, 20);
    this.graphics.lineStyle(2, 0xffffff, 0.9);
    this.graphics.strokeCircle(this.knobX, this.knobY, 20);
  }

  destroy() {
    this.scene.input.off('pointerdown', this.onPointerDown);
    this.scene.input.off('pointermove', this.onPointerMove);
    this.scene.input.off('pointerup', this.onPointerUp);
    this.scene.input.off('pointerupoutside', this.onPointerUp);
    this.graphics.destroy();
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
  }
}
