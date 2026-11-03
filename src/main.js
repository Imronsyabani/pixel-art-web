import './styles.css';
import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import { parseGameMode } from './config/gameMode.js';

const mode = parseGameMode();
document.documentElement.dataset.gameMode = mode.mode;
document.documentElement.dataset.player = mode.gender;

const game = new Phaser.Game(gameConfig);

window.addEventListener('beforeunload', () => game.destroy(true));
