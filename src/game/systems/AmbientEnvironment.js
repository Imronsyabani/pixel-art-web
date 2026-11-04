import { GARDEN_TILE, TILE_SIZE } from '../map/gardenLayout.js';
import {
  getPetalDriftY,
  getPulseAlpha,
  getSwayRotation,
  wrapDriftingX,
} from './ambientMotionMath.js';

const TEXTURE_KEYS = {
  wave: 'ambient-wave-glint',
  petal: 'ambient-petal',
  leaf: 'ambient-leaf',
  flowerBlue: 'ambient-flower-blue',
  flowerWhite: 'ambient-flower-white',
  flowerPink: 'ambient-flower-pink',
  flowerLilac: 'ambient-flower-lilac',
};
const FLOWER_TEXTURES = new Map([
  [GARDEN_TILE.flowerBlue, TEXTURE_KEYS.flowerBlue],
  [GARDEN_TILE.flowerWhite, TEXTURE_KEYS.flowerWhite],
  [GARDEN_TILE.flowerPink, TEXTURE_KEYS.flowerPink],
  [GARDEN_TILE.flowerLilac, TEXTURE_KEYS.flowerLilac],
]);

function unitRandom(x, y, salt = 0) {
  const value = Math.sin((x + salt * 17.13) * 127.1 + (y + salt * 9.7) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function createTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.clearRect(0, 0, width, height);
  draw(context);
  texture.refresh();
}

function buildAmbientTextures(scene) {
  createTexture(scene, TEXTURE_KEYS.wave, 14, 5, (ctx) => {
    ctx.fillStyle = '#b5e8e8';
    ctx.fillRect(1, 1, 8, 2);
    ctx.fillRect(5, 3, 7, 1);
    ctx.fillStyle = '#e4f5e9';
    ctx.fillRect(3, 0, 4, 1);
  });
  createTexture(scene, TEXTURE_KEYS.petal, 7, 6, (ctx) => {
    ctx.fillStyle = '#f4bdd2';
    ctx.fillRect(2, 0, 3, 2);
    ctx.fillRect(0, 2, 7, 2);
    ctx.fillRect(2, 4, 3, 2);
    ctx.fillStyle = '#ffe7ec';
    ctx.fillRect(3, 1, 2, 2);
  });
  createTexture(scene, TEXTURE_KEYS.leaf, 10, 6, (ctx) => {
    ctx.fillStyle = '#4c965b';
    ctx.fillRect(1, 2, 7, 3);
    ctx.fillRect(3, 1, 4, 5);
    ctx.fillStyle = '#9acb76';
    ctx.fillRect(3, 2, 4, 1);
    ctx.fillStyle = '#326f4b';
    ctx.fillRect(7, 3, 2, 1);
  });

  const palettes = [
    [GARDEN_TILE.flowerBlue, '#63b2ed', '#fff1ba'],
    [GARDEN_TILE.flowerWhite, '#f3f2e4', '#efcf82'],
    [GARDEN_TILE.flowerPink, '#e9a4c3', '#fff0c1'],
    [GARDEN_TILE.flowerLilac, '#b8a5e7', '#f8edb7'],
  ];
  for (const [tile, petal, center] of palettes) {
    createTexture(scene, FLOWER_TEXTURES.get(tile), 16, 23, (ctx) => {
      ctx.fillStyle = '#3f8550';
      ctx.fillRect(7, 11, 2, 11);
      ctx.fillRect(3, 16, 4, 2);
      ctx.fillRect(9, 18, 4, 2);
      ctx.fillStyle = petal;
      ctx.fillRect(5, 3, 6, 4);
      ctx.fillRect(2, 6, 12, 4);
      ctx.fillRect(5, 9, 6, 3);
      ctx.fillStyle = center;
      ctx.fillRect(6, 6, 4, 4);
    });
  }
}

/** Small deterministic ambient layer; no per-frame allocations or particle emitter. */
export class AmbientEnvironment {
  constructor(scene, layout, treePosition) {
    this.scene = scene;
    this.layout = layout;
    this.worldWidth = layout.columns * TILE_SIZE;
    this.worldHeight = layout.rows * TILE_SIZE;
    this.flowers = [];
    this.waves = [];
    this.leaves = [];
    this.petals = [];
    this.elapsed = 0;

    buildAmbientTextures(scene);
    this.createWaveGlints();
    this.createSwayingFlowers();
    this.createTreeLeaves(treePosition);
    this.createFloatingPetals();
  }

  createWaveGlints() {
    let count = 0;
    for (let row = 0; row < this.layout.rows && count < 30; row += 1) {
      for (let column = 0; column < this.layout.columns && count < 30; column += 1) {
        const tile = this.layout.ground[row][column];
        if (tile !== GARDEN_TILE.water && tile !== GARDEN_TILE.waterWave) continue;
        if (unitRandom(column, row, 8) > 0.018) continue;

        const x = column * TILE_SIZE + 5 + unitRandom(column, row, 9) * 18;
        const y = row * TILE_SIZE + 8 + unitRandom(column, row, 10) * 16;
        const sprite = this.scene.add.image(x, y, TEXTURE_KEYS.wave)
          .setOrigin(0.5)
          .setDepth(0.5)
          .setAlpha(0.25);
        this.waves.push({
          sprite, x, y,
          phase: unitRandom(column, row, 11) * Math.PI * 2,
          drift: 1.2 + unitRandom(column, row, 12) * 2,
        });
        count += 1;
      }
    }
  }

  createSwayingFlowers() {
    let count = 0;
    for (let row = 0; row < this.layout.rows && count < 22; row += 1) {
      for (let column = 0; column < this.layout.columns && count < 22; column += 1) {
        const tile = this.layout.decor[row][column];
        const texture = FLOWER_TEXTURES.get(tile);
        if (!texture || (column * 7 + row * 11) % 4 !== 0) continue;

        const x = column * TILE_SIZE + 16;
        const y = row * TILE_SIZE + 23;
        const sprite = this.scene.add.image(x, y, texture)
          .setOrigin(0.5, 0.92)
          .setDepth(y + 2);
        this.flowers.push({
          sprite,
          phase: unitRandom(column, row, 14) * Math.PI * 2,
          amplitude: 0.035 + unitRandom(column, row, 15) * 0.025,
          speed: 1.1 + unitRandom(column, row, 16) * 0.6,
        });
        count += 1;
      }
    }
  }

  createTreeLeaves(treePosition) {
    const centerX = treePosition.x * TILE_SIZE + TILE_SIZE / 2;
    const baseDepth = treePosition.y * TILE_SIZE + TILE_SIZE * 1.15 + 4;
    for (let index = 0; index < 7; index += 1) {
      const phase = (index / 7) * Math.PI * 2;
      const x = centerX + Math.cos(phase) * (22 + (index % 3) * 16);
      const y = treePosition.y * TILE_SIZE - 54 + (index % 4) * 18;
      const sprite = this.scene.add.image(x, y, TEXTURE_KEYS.leaf)
        .setOrigin(0.5)
        .setDepth(baseDepth + 1)
        .setAlpha(0.82);
      this.leaves.push({ sprite, x, y, phase, depth: baseDepth + 1 });
    }
  }

  createFloatingPetals() {
    for (let index = 0; index < 10; index += 1) {
      const x = unitRandom(index, 4, 21) * this.worldWidth;
      const y = 120 + unitRandom(index, 7, 22) * (this.worldHeight - 240);
      const phase = unitRandom(index, 9, 23) * Math.PI * 2;
      const sprite = this.scene.add.image(x, y, TEXTURE_KEYS.petal)
        .setOrigin(0.5)
        .setDepth(y + 18)
        .setAlpha(0.72)
        .setRotation(phase * 0.25);
      this.petals.push({
        sprite,
        x,
        baseY: y,
        phase,
        speed: 10 + unitRandom(index, 12, 24) * 11,
        rotationSpeed: 0.25 + unitRandom(index, 16, 25) * 0.4,
      });
    }
  }

  update(time, deltaMs) {
    const delta = Math.max(0, Math.min(Number(deltaMs) || 0, 50));
    this.elapsed = Number.isFinite(time) ? time : this.elapsed + delta;

    for (const flower of this.flowers) {
      flower.sprite.setRotation(getSwayRotation(this.elapsed, flower.phase, flower.amplitude, flower.speed));
    }
    for (const wave of this.waves) {
      const drift = Math.sin(this.elapsed * 0.0007 + wave.phase) * wave.drift;
      wave.sprite.setPosition(wave.x + drift, wave.y);
      wave.sprite.setAlpha(getPulseAlpha(this.elapsed, wave.phase, 0.12, 0.48, 1.05));
    }
    for (const leaf of this.leaves) {
      leaf.sprite.setRotation(getSwayRotation(this.elapsed, leaf.phase, 0.09, 0.85));
      leaf.sprite.setPosition(leaf.x + Math.sin(this.elapsed * 0.00045 + leaf.phase) * 2, leaf.y);
    }
    for (const petal of this.petals) {
      petal.x = wrapDriftingX(petal.x + petal.speed * delta / 1000, this.worldWidth);
      petal.sprite.setPosition(petal.x, getPetalDriftY(petal.baseY, this.elapsed, petal.phase));
      petal.sprite.setRotation(this.elapsed * 0.00015 * petal.rotationSpeed + petal.phase * 0.2);
      petal.sprite.setDepth(petal.sprite.y + 18);
    }
  }

  destroy() {
    for (const group of [this.flowers, this.waves, this.leaves, this.petals]) {
      for (const item of group) item.sprite.destroy();
      group.length = 0;
    }
    this.scene = null;
  }
}
