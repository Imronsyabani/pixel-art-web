import Phaser from 'phaser';
import { parseGameMode } from '../../config/gameMode.js';
import { preloadCharacterAssets } from '../assets/CharacterAssetLoader.js';
import { createCharacter, playCharacterAnimation } from '../systems/CharacterFactory.js';
import { registerCharacterAnimations } from '../systems/CharacterAnimationSystem.js';
import { updateCharacterMovement } from '../systems/CharacterMovementSystem.js';
import { CharacterTrail, updateFollowerMovement } from '../systems/CharacterTrail.js';
import { vectorToTarget } from '../systems/movementMath.js';
import { PlayerInputController } from '../systems/PlayerInputController.js';
import { createGardenMap } from '../map/GardenMap.js';
import { canOccupyPosition, getGardenObstacleRects } from '../map/GardenCollision.js';
import { TILE_SIZE } from '../map/gardenLayout.js';

const WORLD_PADDING = TILE_SIZE * 3;
const CHARACTER_RADIUS = 10;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.demoElapsed = 0;
  }

  preload() {
    preloadCharacterAssets(this);
  }

  create() {
    const { width, height } = this.scale;
    this.mode = parseGameMode();
    registerCharacterAnimations(this);
    this.worldMap = createGardenMap(this);

    const params = new URLSearchParams(globalThis.location?.search ?? '');
    this.demoEnabled = params.get('demo') === 'true';

    this.cameras.main.setBackgroundColor('#236f9c');
    this.cameras.main.setBounds(0, 0, this.worldMap.worldWidth, this.worldMap.worldHeight);
    this.movementBounds = {
      left: WORLD_PADDING + CHARACTER_RADIUS,
      right: this.worldMap.worldWidth - WORLD_PADDING - CHARACTER_RADIUS,
      top: WORLD_PADDING + CHARACTER_RADIUS,
      bottom: this.worldMap.worldHeight - WORLD_PADDING - CHARACTER_RADIUS,
    };
    this.worldObstacles = getGardenObstacleRects(this.worldMap.tree);
    this.canOccupy = (x, y, radius = CHARACTER_RADIUS) => canOccupyPosition(
      this.worldMap,
      x,
      y,
      { radius, obstacles: this.worldObstacles },
    );

    const spawn = this.worldMap.playerSpawn;
    const leaderStart = this.demoEnabled
      ? { x: spawn.x + 180, y: spawn.y }
      : { x: this.mode.couple ? spawn.x + 54 : spawn.x, y: spawn.y };

    this.leader = createCharacter(this, this.mode.leader, leaderStart.x, leaderStart.y, {
      scale: 2.25,
      direction: this.demoEnabled ? 'right' : 'down',
      state: 'idle',
    });
    this.leaderLabel = this.createCharacterLabel(this.leader, this.mode.leader);

    this.trail = new CharacterTrail({ sampleSpacing: 3, maxLength: 1800 });
    if (this.mode.couple) {
      const followerStart = { x: leaderStart.x - 142, y: leaderStart.y };
      this.follower = createCharacter(this, this.mode.follower, followerStart.x, followerStart.y, {
        scale: 2.25,
        direction: 'right',
        state: 'idle',
      });
      this.followerLabel = this.createCharacterLabel(this.follower, this.mode.follower);
      for (let x = leaderStart.x - 150; x <= leaderStart.x; x += 6) {
        this.trail.record(x, leaderStart.y);
      }
    }

    const touchOption = params.get('touch');
    const touchEnabled = !this.demoEnabled && (
      touchOption === 'true' ? true
        : touchOption === 'false' ? false
          : undefined
    );
    this.inputController = new PlayerInputController(this, { touchEnabled });
    this.createHud(width, height);

    this.leader.setDepth(this.leader.y);
    this.follower?.setDepth(this.follower.y);

    this.cameras.main.startFollow(this.leader, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(300, 180);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputController?.destroy());
  }

  createHud(width, height) {
    this.add.text(26, 20, 'CLIFF GARDEN', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#315d53',
      strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#23423d', blur: 2, fill: true },
    }).setScrollFactor(0).setDepth(5000);

    this.add.text(28, 58, 'PHASE 7 · COLLISION & WORLD BOUNDARIES', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '17px',
      color: '#f3fff2',
      stroke: '#315d53',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(5000);

    const modeLabel = `MODE: ${this.mode.mode.toUpperCase()} · G=${this.mode.gender} · C=${this.mode.couple}`;
    this.add.text(width - 22, 22, modeLabel, {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.62)',
      padding: { x: 8, y: 5 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(5000);

    const hint = this.demoEnabled
      ? 'AUTO MOVEMENT DEMO'
      : this.inputController?.touchEnabled
        ? 'DRAG JOYSTICK TO MOVE'
        : 'WASD / ARROW KEYS TO MOVE';
    this.controlHint = this.add.text(width / 2, height - 18, hint, {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '15px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.56)',
      padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(5000);
  }

  createCharacterLabel(sprite, characterId) {
    const name = characterId === 'rintaro' ? 'RINTARO' : 'KAORUKO';
    return this.add.text(sprite.x, sprite.y + 54, name, {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '17px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.68)',
      padding: { x: 5, y: 1 },
    }).setOrigin(0.5).setDepth(sprite.y + 1);
  }

  update(_time, delta) {
    if (!this.leader) return;

    let leaderVector;
    if (this.demoEnabled) {
      this.demoElapsed += Math.min(delta, 50);
      const angle = this.demoElapsed * 0.00035;
      const target = {
        x: this.worldMap.playerSpawn.x + Math.cos(angle) * 260,
        y: this.worldMap.playerSpawn.y + Math.sin(angle) * 180,
      };
      leaderVector = vectorToTarget(this.leader, target);
    } else {
      leaderVector = this.inputController?.getVector() ?? { x: 0, y: 0 };
    }

    const movement = updateCharacterMovement(
      this.leader,
      leaderVector,
      delta,
      {
        speed: 150,
        bounds: this.movementBounds,
        canOccupy: this.canOccupy,
        radius: CHARACTER_RADIUS,
        maxSubstep: 3,
      },
    );
    this.updateCharacterVisual(this.leader, movement);
    this.updateLabelPosition(this.leader, this.leaderLabel);

    if (movement.moved) this.trail.record(this.leader.x, this.leader.y);

    if (this.follower) {
      const follow = updateFollowerMovement(this.follower, this.trail, delta, {
        followDistance: 86,
        stopDistance: 4,
        speed: 116,
        bounds: this.movementBounds,
        canOccupy: this.canOccupy,
        radius: CHARACTER_RADIUS,
      });
      this.updateCharacterVisual(this.follower, follow);
      this.updateLabelPosition(this.follower, this.followerLabel);
      this.follower.setDepth(this.follower.y);
    }

    this.leader.setDepth(this.leader.y);
  }

  updateCharacterVisual(sprite, movement) {
    const direction = movement.direction ?? sprite.getData('direction') ?? 'down';
    const state = movement.moved ? 'walk' : 'idle';
    sprite.setData('direction', direction);
    playCharacterAnimation(sprite, state, direction);
  }

  updateLabelPosition(sprite, label) {
    if (!label) return;
    label.setPosition(sprite.x, sprite.y + 54);
    label.setDepth(sprite.y + 1);
  }
}
