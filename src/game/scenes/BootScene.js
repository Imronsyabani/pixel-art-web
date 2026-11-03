import Phaser from 'phaser';
import { parseGameMode } from '../../config/gameMode.js';
import { preloadCharacterAssets } from '../assets/CharacterAssetLoader.js';
import { createCharacter } from '../systems/CharacterFactory.js';

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

    this.cameras.main.setBackgroundColor('#b8e8df');
    this.add.rectangle(width / 2, height / 2, width, height, 0xb8e8df);

    // A simple display stage keeps Phase 2 focused on asset validation, not map work.
    this.add.ellipse(width / 2, 355, 560, 90, 0x8bc6a8, 0.45);
    this.add.ellipse(width / 2, 365, 420, 46, 0x6eaa8d, 0.18);

    this.add.text(width / 2, 66, 'CLIFF GARDEN', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '48px',
      color: '#315d53',
      stroke: '#eefaf1',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 112, 'PHASE 2 · CHARACTER ASSET PIPELINE', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '22px',
      color: '#47766a',
    }).setOrigin(0.5);

    const characters = mode.visibleCharacters;
    const spacing = 190;
    const startX = width / 2 - ((characters.length - 1) * spacing) / 2;

    characters.forEach((characterId, index) => {
      const x = startX + index * spacing;
      const y = 348;
      createCharacter(this, characterId, x, y, { scale: 2.8, direction: 'down' });

      const name = characterId === 'rintaro' ? 'RINTARO' : 'KAORUKO';
      const role = mode.couple ? (index === 0 ? 'LEADER' : 'FOLLOWER') : 'PLAYER';
      this.add.text(x, y + 52, name, {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '24px',
        color: '#315d53',
      }).setOrigin(0.5);
      this.add.text(x, y + 78, role, {
        fontFamily: '"Pixelify Sans", monospace',
        fontSize: '15px',
        color: '#47766a',
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, height - 34, `MODE: ${mode.mode.toUpperCase()}  ·  G=${mode.gender}  ·  C=${mode.couple}`, {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '16px',
      color: '#47766a',
    }).setOrigin(0.5);
  }
}
