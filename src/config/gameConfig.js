import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene.js';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#b8e8df',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: {
    pixelArt: true,
    antialias: false,
    clearBeforeRender: true,
  },
  scene: [BootScene],
};

export function createGame() {
  return new Phaser.Game(gameConfig);
}
