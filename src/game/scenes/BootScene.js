import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xb8e8df);
    this.add.text(width / 2, height / 2 - 20, 'CLIFF GARDEN', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '42px',
      color: '#315d53',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 28, 'Phase 1 · Project foundation', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '20px',
      color: '#47766a',
    }).setOrigin(0.5);
    this.add.text(width / 2, height - 36, 'Exploration begins soon...', {
      fontFamily: '"Pixelify Sans", monospace',
      fontSize: '16px',
      color: '#47766a',
    }).setOrigin(0.5);
  }
}
