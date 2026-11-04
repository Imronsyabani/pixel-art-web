import Phaser from 'phaser';
import { parseGameMode } from '../../config/gameMode.js';
import { preloadCharacterAssets } from '../assets/CharacterAssetLoader.js';
import { createCharacter, playCharacterAnimation } from '../systems/CharacterFactory.js';
import { registerCharacterAnimations } from '../systems/CharacterAnimationSystem.js';
import { updateCharacterMovement } from '../systems/CharacterMovementSystem.js';
import { CharacterTrail, updateFollowerMovement } from '../systems/CharacterTrail.js';
import { vectorToTarget } from '../systems/movementMath.js';
import { PlayerInputController } from '../systems/PlayerInputController.js';
import { AmbientAudio } from '../systems/AmbientAudio.js';
import { getInitialSoundEnabled, getResponsiveCameraZoom, getResponsiveHudLayout } from '../systems/responsiveLayout.js';
import { createGardenMap } from '../map/GardenMap.js';
import { AmbientEnvironment } from '../systems/AmbientEnvironment.js';
import { canOccupyPosition, getGardenObstacleRects } from '../map/GardenCollision.js';
import { TILE_SIZE } from '../map/gardenLayout.js';

const WORLD_PADDING = TILE_SIZE * 3;
const CHARACTER_RADIUS = 10;

function readSavedSoundPreference() {
  try { return globalThis.localStorage?.getItem('cliff-garden-audio') ?? null; }
  catch { return null; }
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.demoElapsed = 0;
  }

  preload() {
    this.mode = parseGameMode();
    this.assetLoadErrors = [];
    this.load.on('progress', (value) => {
      window.dispatchEvent(new CustomEvent('cliff-garden:progress', { detail: { value } }));
    });
    this.load.once('complete', () => {
      window.dispatchEvent(new Event('cliff-garden:preparing'));
    });
    this.load.on('loaderror', (file) => {
      const source = file?.src ?? file?.key ?? 'unknown asset';
      this.assetLoadErrors.push(source);
    });
    preloadCharacterAssets(this, this.mode.visibleCharacters);
  }

  create() {
    const { width, height } = this.scale;
    if (this.assetLoadErrors.length) {
      window.dispatchEvent(new CustomEvent('cliff-garden:error', {
        detail: { message: `Could not load required character assets: ${this.assetLoadErrors.join(', ')}` },
      }));
      return;
    }
    this.mode = this.mode ?? parseGameMode();
    registerCharacterAnimations(this, this.mode.visibleCharacters);
    this.worldMap = createGardenMap(this);
    this.ambient = new AmbientEnvironment(this, this.worldMap, this.worldMap.tree);

    const params = new URLSearchParams(globalThis.location?.search ?? '');
    this.demoEnabled = params.get('demo') === 'true';

    this.cameras.main.setBackgroundColor('#6da85d');
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
    this.audio = new AmbientAudio(this, {
      enabled: getInitialSoundEnabled(params.toString(), readSavedSoundPreference()),
    });
    this.audioKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.createHud(width, height);

    this.leader.setDepth(this.leader.y);
    this.follower?.setDepth(this.follower.y);

    this.cameras.main.startFollow(this.leader, true, 0.08, 0.08);
    this.scale.on('resize', this.handleResize, this);
    this.handleResize({ width, height });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.inputController?.destroy();
      this.audio?.destroy();
      this.ambient?.destroy();
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.dispatchEvent(new Event('cliff-garden:ready'));
    }));
  }

  createHud(width, height) {
    const baseStyle = {
      fontFamily: '"Pixelify Sans Variable", monospace',
      color: '#ffffff',
      stroke: '#315d53',
      strokeThickness: 3,
    };
    this.hudTitle = this.add.text(0, 0, 'BANYAN GARDEN', {
      ...baseStyle,
      fontSize: '32px',
      strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#23423d', blur: 2, fill: true },
    }).setScrollFactor(0).setDepth(5000);

    this.hudSubtitle = this.add.text(0, 0, 'FLOWER MEADOW', {
      ...baseStyle,
      fontSize: '17px',
      color: '#f3fff2',
    }).setScrollFactor(0).setDepth(5000);

    const modeText = this.mode.couple
      ? `COUPLE · ${this.mode.gender.toUpperCase()} LEADS`
      : `SOLO · ${this.mode.leader === 'rintaro' ? 'RINTARO' : 'KAORUKO'}`;
    this.modeLabel = this.add.text(0, 0, modeText, {
      fontFamily: '"Pixelify Sans Variable", monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.68)',
      padding: { x: 8, y: 5 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(5000);

    this.audioButton = this.add.text(0, 0, '', {
      fontFamily: '"Pixelify Sans Variable", monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.78)',
      padding: { x: 9, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(5001)
      .setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', () => this.toggleAudio());

    const hint = this.demoEnabled
      ? 'AUTO MOVEMENT DEMO'
      : this.inputController?.touchEnabled
        ? 'JOYSTICK · DRAG TO MOVE'
        : 'WASD / ARROWS · MOVE';
    this.controlHint = this.add.text(0, 0, hint, {
      fontFamily: '"Pixelify Sans Variable", monospace',
      fontSize: '15px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.62)',
      padding: { x: 10, y: 5 },
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(5000);

    this.layoutHud(width, height);
    this.updateAudioButton();
  }

  layoutHud(width, height) {
    const { margin, titleSize, bodySize, compact } = getResponsiveHudLayout(width, height);
    this.hudTitle.setPosition(margin, margin).setFontSize(titleSize);
    this.hudSubtitle
      .setPosition(margin, margin + titleSize + 2)
      .setFontSize(bodySize)
      .setVisible(!compact);
    this.modeLabel.setPosition(width - margin, margin).setFontSize(bodySize);
    this.audioButton.setPosition(width - margin, margin + bodySize + 19).setFontSize(bodySize);
    this.controlHint
      .setPosition(width - margin, height - margin)
      .setFontSize(bodySize)
      .setVisible(width >= 320 && height >= 260);
  }

  handleResize(gameSize) {
    const width = gameSize?.width ?? this.scale.width;
    const height = gameSize?.height ?? this.scale.height;
    this.cameras.main.setZoom(getResponsiveCameraZoom(width, height));
    this.cameras.main.setDeadzone(Math.min(300, width * 0.32), Math.min(180, height * 0.34));
    this.inputController?.resize(width, height);
    if (this.hudTitle) this.layoutHud(width, height);
  }

  updateAudioButton() {
    if (!this.audioButton || !this.audio) return;
    const state = this.audio.available ? (this.audio.enabled ? 'ON' : 'OFF') : 'N/A';
    this.audioButton.setText(`SOUND ${state} · M`);
  }

  toggleAudio() {
    if (!this.audio) return;
    this.audio.setEnabled(!this.audio.enabled);
    this.updateAudioButton();
  }

  createCharacterLabel(sprite, characterId) {
    const name = characterId === 'rintaro' ? 'RINTARO' : 'KAORUKO';
    return this.add.text(sprite.x, sprite.y + 54, name, {
      fontFamily: '"Pixelify Sans Variable", monospace',
      fontSize: '17px',
      color: '#ffffff',
      backgroundColor: 'rgba(35,66,61,0.68)',
      padding: { x: 5, y: 1 },
    }).setOrigin(0.5).setDepth(sprite.y + 1);
  }

  update(_time, delta) {
    if (!this.leader) return;
    this.ambient?.update(_time, delta);
    if (this.audioKey && Phaser.Input.Keyboard.JustDown(this.audioKey)) this.toggleAudio();

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
    this.audio?.updateMovement(delta, movement.moved);
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
