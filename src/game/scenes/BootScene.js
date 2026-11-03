import Phaser from 'phaser';
import { parseGameMode } from '../../config/gameMode.js';
import { preloadCharacterAssets } from '../assets/CharacterAssetLoader.js';
import { createCharacter } from '../systems/CharacterFactory.js';
import { registerCharacterAnimations } from '../systems/CharacterAnimationSystem.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    preloadCharacterAssets(this);
  }

  create() {
    const { width, height } = this.scale;
    const mode = parseGameMode();
    registerCharacterAnimations(this);

    this.cameras.main.setBackgroundColor('#b8e8df');
    this.add.rectangle(width / 2, height / 2, width, height, 0xb8e8df);
    this.add.ellipse(width / 2, 365, 600, 104, 0x8bc6a8, 0.48);
    this.add.ellipse(width / 2, 376, 430, 52, 0x6eaa8d, 0.2);

    this.add.text(width / 2, 58, 'CLIFF GARDEN', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '48px',
      color: '#315d53',
      stroke: '#eefaf1',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, 104, 'PHASE 3 · IDLE & WALK ANIMATION', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '22px',
      color: '#47766a',
    }).setOrigin(0.5);

    // Single mode previews idle and walk for the selected character. Couple mode
    // previews the leader idling and follower walking without adding movement yet.
    const previews = mode.couple
      ? [
          { characterId: mode.leader, state: 'idle', label: 'LEADER · IDLE' },
          { characterId: mode.follower, state: 'walk', label: 'FOLLOWER · WALK' },
        ]
      : [
          { characterId: mode.leader, state: 'idle', label: 'IDLE PREVIEW' },
          { characterId: mode.leader, state: 'walk', label: 'WALK PREVIEW' },
        ];

    const positions = previews.length === 1 ? [width / 2] : [width * 0.34, width * 0.66];
    previews.forEach((preview, index) => {
      const x = positions[index];
      const y = 350;
      createCharacter(this, preview.characterId, x, y, {
        scale: 3.0,
        direction: 'down',
        state: preview.state,
      });
      this.add.text(x, y + 58, preview.characterId.toUpperCase(), {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '24px',
        color: '#315d53',
      }).setOrigin(0.5);
      this.add.text(x, y + 84, preview.label, {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '16px',
        color: '#47766a',
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, height - 32, `MODE: ${mode.mode.toUpperCase()}  ·  G=${mode.gender}  ·  C=${mode.couple}  ·  IDLE 3 FPS / WALK 9 FPS`, {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '15px',
      color: '#47766a',
    }).setOrigin(0.5);
  }
}
