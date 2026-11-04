import { combineMovementInputs, getKeyboardMovementVector } from './inputMath.js';
import { VirtualJoystick } from './VirtualJoystick.js';
import { getResponsiveJoystickLayout } from './responsiveLayout.js';

function detectTouchDevice(scene) {
  const phaserTouch = Boolean(scene.sys.game.device?.input?.touch);
  const browserTouch = Number(globalThis.navigator?.maxTouchPoints ?? 0) > 0;
  return phaserTouch || browserTouch;
}

/** Unified keyboard + optional touch input. Input controls only the leader. */
export class PlayerInputController {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.keyboard = scene.input.keyboard ?? null;
    this.cursors = this.keyboard?.createCursorKeys() ?? null;
    this.wasd = this.keyboard?.addKeys('W,A,S,D') ?? null;
    this.touchEnabled = options.touchEnabled ?? detectTouchDevice(scene);

    this.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D']);
    const joystickLayout = getResponsiveJoystickLayout(scene.scale.width, scene.scale.height);
    this.joystick = this.touchEnabled
      ? new VirtualJoystick(scene, {
          ...joystickLayout,
          x: options.joystickX ?? joystickLayout.x,
          y: options.joystickY ?? joystickLayout.y,
          radius: options.joystickRadius ?? joystickLayout.radius,
        })
      : null;
    this.onResize = (size) => this.resize(size.width, size.height);
    scene.scale?.on('resize', this.onResize);
  }

  resize(width, height) {
    if (!this.joystick) return;
    const layout = getResponsiveJoystickLayout(width, height);
    this.joystick.setLayout(layout.x, layout.y, layout.radius);
  }

  getVector() {
    const keyboardVector = getKeyboardMovementVector({
      left: this.cursors?.left?.isDown || this.wasd?.A?.isDown,
      right: this.cursors?.right?.isDown || this.wasd?.D?.isDown,
      up: this.cursors?.up?.isDown || this.wasd?.W?.isDown,
      down: this.cursors?.down?.isDown || this.wasd?.S?.isDown,
    });
    return combineMovementInputs(keyboardVector, this.joystick?.getVector());
  }

  destroy() {
    this.scene.scale?.off('resize', this.onResize);
    this.joystick?.destroy();
    this.joystick = null;
  }
}
