import { combineMovementInputs, getKeyboardMovementVector } from './inputMath.js';
import { VirtualJoystick } from './VirtualJoystick.js';

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
    this.joystick = this.touchEnabled
      ? new VirtualJoystick(scene, {
          x: options.joystickX ?? 82,
          y: options.joystickY ?? scene.scale.height - 88,
          radius: options.joystickRadius ?? 54,
        })
      : null;
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
    this.joystick?.destroy();
    this.joystick = null;
  }
}
