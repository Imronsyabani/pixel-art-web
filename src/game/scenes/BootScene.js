import Phaser from 'phaser';
import { parseGameMode } from '../../config/gameMode.js';
import { preloadCharacterAssets } from '../assets/CharacterAssetLoader.js';
import { createCharacter, playCharacterAnimation } from '../systems/CharacterFactory.js';
import { registerCharacterAnimations } from '../systems/CharacterAnimationSystem.js';
import { updateCharacterMovement } from '../systems/CharacterMovementSystem.js';
import { CharacterTrail, updateFollowerMovement } from '../systems/CharacterTrail.js';
import { vectorToTarget } from '../systems/movementMath.js';

const WORLD_BOUNDS = Object.freeze({ left: 180, right: 780, top: 175, bottom: 405 });

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

    this.cameras.main.setBackgroundColor('#b8e8df');
    this.add.rectangle(width / 2, height / 2, width, height, 0xb8e8df);
    this.add.ellipse(width / 2, 365, 640, 112, 0x8bc6a8, 0.48);
    this.add.ellipse(width / 2, 376, 450, 52, 0x6eaa8d, 0.2);
    this.add.ellipse(width / 2, 381, 300, 24, 0x47766a, 0.08);

    this.add.text(width / 2, 48, 'CLIFF GARDEN', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '48px',
      color: '#315d53',
      stroke: '#eefaf1',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, 94, 'PHASE 4 · MOVEMENT & FOLLOWER SYSTEM', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '22px',
      color: '#47766a',
    }).setOrigin(0.5);

    this.demoEnabled = new URLSearchParams(globalThis.location?.search ?? '').get('demo') === 'true';
    const leaderStart = this.demoEnabled
      ? { x: width / 2 + 180, y: 315 }
      : { x: this.mode.couple ? width / 2 + 65 : width / 2, y: 330 };

    this.leader = createCharacter(this, this.mode.leader, leaderStart.x, leaderStart.y, {
      scale: 2.25,
      direction: this.demoEnabled ? 'right' : 'down',
      state: 'idle',
    });

    this.trail = new CharacterTrail({ sampleSpacing: 3, maxLength: 1600 });
    if (this.mode.couple) {
      const followerStart = this.demoEnabled
        ? { x: leaderStart.x - 142, y: leaderStart.y }
        : { x: leaderStart.x - 142, y: leaderStart.y };
      this.follower = createCharacter(this, this.mode.follower, followerStart.x, followerStart.y, {
        scale: 2.25,
        direction: 'right',
        state: 'idle',
      });

      // Seed the recent route so the follower starts at the correct trail offset.
      const seedStart = leaderStart.x - 150;
      for (let x = seedStart; x <= leaderStart.x; x += 6) {
        this.trail.record(x, leaderStart.y);
      }
    }

    const nameFor = (characterId) => characterId === 'rintaro' ? 'RINTARO' : 'KAORUKO';
    this.add.text(this.leader.x, this.leader.y + 62, nameFor(this.mode.leader), {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '21px',
      color: '#315d53',
    }).setOrigin(0.5);

    if (this.follower) {
      this.add.text(this.follower.x, this.follower.y + 62, nameFor(this.mode.follower), {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '21px',
        color: '#315d53',
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, 454,
      this.mode.couple ? 'LEADER → FOLLOWER · TRAIL DISTANCE 142 PX' : 'SINGLE CHARACTER MOVEMENT CORE',
      {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '17px',
        color: '#47766a',
      },
    ).setOrigin(0.5);

    this.demoLabel = this.add.text(width / 2, 486,
      this.demoEnabled ? 'MOVEMENT DEMO: ON' : 'ADD ?demo=true TO PREVIEW MOVEMENT',
      {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '17px',
        color: this.demoEnabled ? '#286b4e' : '#47766a',
      },
    ).setOrigin(0.5);

    this.add.text(width / 2, height - 20,
      `MODE: ${this.mode.mode.toUpperCase()}  ·  G=${this.mode.gender}  ·  C=${this.mode.couple}`,
      {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '14px',
        color: '#47766a',
      },
    ).setOrigin(0.5);

    this.leader.setDepth(this.leader.y);
    this.follower?.setDepth(this.follower.y);
  }

  update(_time, delta) {
    if (!this.demoEnabled || !this.leader) return;

    this.demoElapsed += Math.min(delta, 50);
    const angle = this.demoElapsed * 0.00048;
    const target = {
      x: this.scale.width / 2 + Math.cos(angle) * 180,
      y: 315 + Math.sin(angle) * 92,
    };

    const movement = updateCharacterMovement(
      this.leader,
      vectorToTarget(this.leader, target),
      delta,
      { speed: 88, bounds: WORLD_BOUNDS },
    );
    this.updateCharacterVisual(this.leader, movement);

    if (movement.moved) {
      this.trail.record(this.leader.x, this.leader.y);
    }

    if (this.follower) {
      const follow = updateFollowerMovement(this.follower, this.trail, delta, {
        followDistance: 86,
        stopDistance: 4,
        speed: 116,
        bounds: WORLD_BOUNDS,
      });
      this.updateCharacterVisual(this.follower, follow);
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
}
