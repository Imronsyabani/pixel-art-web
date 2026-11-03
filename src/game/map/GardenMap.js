import {
  buildGardenLayout,
  GARDEN_TILE,
  TILE_SIZE,
} from './gardenLayout.js';

const ATLAS_COLUMNS = 8;
const ATLAS_ROWS = 3;
const ATLAS_KEY = 'cliff-garden-atlas';

function atlasPosition(tileId) {
  const index = tileId - 1;
  return {
    x: (index % ATLAS_COLUMNS) * TILE_SIZE,
    y: Math.floor(index / ATLAS_COLUMNS) * TILE_SIZE,
  };
}

function fillPixel(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawGrass(ctx, x, y, variant = 0) {
  const colors = ['#6da85d', '#79b96a', '#609b55'];
  fillPixel(ctx, x, y, TILE_SIZE, TILE_SIZE, colors[variant % colors.length]);
  fillPixel(ctx, x + 4, y + 6, 3, 2, '#8dca78');
  fillPixel(ctx, x + 22, y + 12, 2, 3, '#4e894b');
  fillPixel(ctx, x + 12, y + 25, 4, 2, '#84bc6c');
  fillPixel(ctx, x + 27, y + 28, 2, 2, '#4f8c4b');
}

function drawFlower(ctx, x, y, petals, center = '#f4eab0') {
  const points = [[10, 12], [14, 8], [18, 12], [14, 16], [22, 20], [26, 16], [30, 20], [26, 24]];
  for (const [px, py] of points.slice(0, 4)) fillPixel(ctx, x + px, y + py, 4, 4, petals);
  fillPixel(ctx, x + 13, y + 11, 3, 3, center);
  for (const [px, py] of points.slice(4)) fillPixel(ctx, x + px, y + py, 3, 3, petals);
  fillPixel(ctx, x + 25, y + 19, 2, 2, center);
  fillPixel(ctx, x + 12, y + 19, 2, 6, '#3f8550');
  fillPixel(ctx, x + 11, y + 22, 4, 2, '#80b86a');
}

function drawAtlas(ctx) {
  const tile = (id, callback) => {
    const { x, y } = atlasPosition(id);
    callback(x, y);
  };

  tile(GARDEN_TILE.water, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#236f9c');
    fillPixel(ctx, x + 4, y + 8, 10, 2, '#3b91b8');
    fillPixel(ctx, x + 21, y + 20, 7, 2, '#1b5e89');
    fillPixel(ctx, x + 16, y + 4, 4, 2, '#54a2c0');
  });
  tile(GARDEN_TILE.waterWave, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#287ca6');
    fillPixel(ctx, x + 2, y + 9, 12, 2, '#8bc7d6');
    fillPixel(ctx, x + 18, y + 21, 10, 2, '#6bb2ca');
    fillPixel(ctx, x + 22, y + 5, 5, 2, '#a6d8df');
  });
  tile(GARDEN_TILE.grass, (x, y) => drawGrass(ctx, x, y, 0));
  tile(GARDEN_TILE.grassLight, (x, y) => drawGrass(ctx, x, y, 1));
  tile(GARDEN_TILE.grassDark, (x, y) => drawGrass(ctx, x, y, 2));
  tile(GARDEN_TILE.sand, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#ddc28a');
    fillPixel(ctx, x + 5, y + 7, 3, 2, '#ead8a5');
    fillPixel(ctx, x + 21, y + 20, 4, 2, '#c6a975');
    fillPixel(ctx, x + 13, y + 27, 2, 2, '#eddaa9');
  });
  tile(GARDEN_TILE.wetSand, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#bda77a');
    fillPixel(ctx, x + 3, y + 9, 9, 2, '#d9c493');
    fillPixel(ctx, x + 19, y + 23, 8, 2, '#a9946e');
  });
  tile(GARDEN_TILE.path, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#a9a99b');
    fillPixel(ctx, x + 2, y + 2, 13, 12, '#c7c6b4');
    fillPixel(ctx, x + 17, y + 3, 13, 11, '#b8b7a8');
    fillPixel(ctx, x + 3, y + 17, 12, 12, '#bdbbab');
    fillPixel(ctx, x + 17, y + 17, 12, 12, '#d0cdb9');
    fillPixel(ctx, x + 14, y + 15, 3, 2, '#8d9188');
  });
  tile(GARDEN_TILE.pathAlt, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#989d94');
    fillPixel(ctx, x + 2, y + 2, 13, 12, '#bcbcad');
    fillPixel(ctx, x + 17, y + 3, 13, 11, '#aaa99a');
    fillPixel(ctx, x + 3, y + 17, 12, 12, '#b1b09f');
    fillPixel(ctx, x + 17, y + 17, 12, 12, '#c7c4b2');
    fillPixel(ctx, x + 10, y + 13, 5, 2, '#868b82');
  });
  tile(GARDEN_TILE.cliffTop, (x, y) => {
    fillPixel(ctx, x, y, 32, 32, '#726f68');
    fillPixel(ctx, x, y, 32, 6, '#608b55');
    fillPixel(ctx, x + 4, y + 9, 8, 5, '#8d877a');
    fillPixel(ctx, x + 19, y + 19, 9, 7, '#5d5b59');
    fillPixel(ctx, x + 9, y + 25, 5, 3, '#9a8b78');
  });
  tile(GARDEN_TILE.flowerBlue, (x, y) => drawFlower(ctx, x, y, '#63b2ed', '#fff1ba'));
  tile(GARDEN_TILE.flowerWhite, (x, y) => drawFlower(ctx, x, y, '#f3f2e4', '#efcf82'));
  tile(GARDEN_TILE.flowerPink, (x, y) => drawFlower(ctx, x, y, '#e9a4c3', '#fff0c1'));
  tile(GARDEN_TILE.flowerLilac, (x, y) => drawFlower(ctx, x, y, '#b8a5e7', '#f8edb7'));
  tile(GARDEN_TILE.shrub, (x, y) => {
    fillPixel(ctx, x + 4, y + 15, 24, 13, '#326c45');
    fillPixel(ctx, x + 7, y + 9, 18, 16, '#43894f');
    fillPixel(ctx, x + 11, y + 5, 10, 14, '#5b9e5a');
    fillPixel(ctx, x + 11, y + 12, 5, 3, '#85be6e');
  });
  tile(GARDEN_TILE.rock, (x, y) => {
    fillPixel(ctx, x + 5, y + 18, 22, 10, '#777f7d');
    fillPixel(ctx, x + 9, y + 11, 15, 12, '#929995');
    fillPixel(ctx, x + 13, y + 10, 6, 3, '#c0c4b9');
    fillPixel(ctx, x + 8, y + 25, 18, 3, '#5f6c6d');
  });
  tile(GARDEN_TILE.fenceHorizontal, (x, y) => {
    fillPixel(ctx, x, y + 8, 32, 4, '#805638');
    fillPixel(ctx, x, y + 19, 32, 4, '#9a6841');
    fillPixel(ctx, x + 4, y + 5, 4, 21, '#61452f');
    fillPixel(ctx, x + 24, y + 5, 4, 21, '#61452f');
  });
  tile(GARDEN_TILE.fenceVertical, (x, y) => {
    fillPixel(ctx, x + 8, y, 4, 32, '#805638');
    fillPixel(ctx, x + 19, y, 4, 32, '#9a6841');
    fillPixel(ctx, x + 5, y + 4, 21, 4, '#61452f');
    fillPixel(ctx, x + 5, y + 24, 21, 4, '#61452f');
  });
}

function createAtlas(scene) {
  if (scene.textures.exists(ATLAS_KEY)) return;
  const texture = scene.textures.createCanvas(ATLAS_KEY, TILE_SIZE * ATLAS_COLUMNS, TILE_SIZE * ATLAS_ROWS);
  drawAtlas(texture.getContext());
  texture.refresh();
}

function createPixelTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.clearRect(0, 0, width, height);
  draw(context);
  texture.refresh();
}

function createLargeProps(scene, treePosition) {
  createPixelTexture(scene, 'garden-tree', 160, 176, (ctx) => {
    fillPixel(ctx, 18, 146, 124, 18, 'rgba(43,74,51,0.22)');
    fillPixel(ctx, 70, 94, 26, 68, '#65452f');
    fillPixel(ctx, 75, 97, 15, 58, '#98643b');
    fillPixel(ctx, 82, 102, 5, 48, '#b17b49');
    const canopy = [
      [22, 59, 52, 40, '#2e744e'], [50, 29, 62, 55, '#3f8d58'],
      [89, 43, 49, 48, '#347b50'], [18, 88, 62, 42, '#438f58'],
      [76, 83, 68, 45, '#2b704a'], [49, 9, 49, 42, '#4c9a5e'],
      [103, 66, 34, 35, '#4b9658'],
    ];
    for (const [x, y, w, h, color] of canopy) fillPixel(ctx, x, y, w, h, color);
    for (let i = 0; i < 38; i += 1) {
      const x = 20 + ((i * 37) % 122);
      const y = 16 + ((i * 23) % 106);
      const color = i % 5 === 0 ? '#86bb70' : i % 3 === 0 ? '#5aa364' : '#347c50';
      fillPixel(ctx, x, y, 8, 7, color);
    }
    fillPixel(ctx, 46, 42, 17, 8, '#9cc77c');
    fillPixel(ctx, 98, 57, 14, 7, '#8dbf73');
    fillPixel(ctx, 70, 73, 18, 8, '#65a96b');
    fillPixel(ctx, 73, 151, 20, 5, '#553d2d');
  });
  createPixelTexture(scene, 'garden-bench', 112, 54, (ctx) => {
    fillPixel(ctx, 8, 12, 96, 8, '#8c5938');
    fillPixel(ctx, 8, 24, 96, 8, '#a66c43');
    fillPixel(ctx, 12, 7, 88, 7, '#b17a4d');
    fillPixel(ctx, 17, 31, 6, 18, '#594331');
    fillPixel(ctx, 89, 31, 6, 18, '#594331');
    fillPixel(ctx, 5, 44, 14, 4, '#65452f');
    fillPixel(ctx, 87, 44, 14, 4, '#65452f');
    fillPixel(ctx, 15, 14, 82, 2, '#d1975b');
  });
  createPixelTexture(scene, 'garden-lookout-rock', 80, 52, (ctx) => {
    fillPixel(ctx, 7, 30, 66, 17, '#606b6c');
    fillPixel(ctx, 17, 17, 49, 23, '#838e8b');
    fillPixel(ctx, 29, 11, 29, 14, '#a5aaa0');
    fillPixel(ctx, 27, 14, 14, 4, '#c3c5b7');
    fillPixel(ctx, 13, 41, 56, 5, '#4d5c60');
  });

  const x = treePosition.x * TILE_SIZE + TILE_SIZE / 2;
  const y = treePosition.y * TILE_SIZE + TILE_SIZE * 1.15;
  scene.add.image(x, y, 'garden-tree').setOrigin(0.5, 0.9).setDepth(y + 2);

  scene.add.image(13 * TILE_SIZE, 13 * TILE_SIZE, 'garden-bench')
    .setOrigin(0.5, 0.9).setDepth(13 * TILE_SIZE + 18);
  scene.add.image(56 * TILE_SIZE, 30 * TILE_SIZE, 'garden-lookout-rock')
    .setOrigin(0.5, 0.9).setDepth(30 * TILE_SIZE + 12);
  scene.add.image(18 * TILE_SIZE, 35 * TILE_SIZE, 'garden-lookout-rock')
    .setOrigin(0.5, 0.9).setDepth(35 * TILE_SIZE + 12);
}

export function createGardenMap(scene) {
  createAtlas(scene);
  const layout = buildGardenLayout();
  const groundMap = scene.make.tilemap({ data: layout.ground, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const groundTileset = groundMap.addTilesetImage(ATLAS_KEY, ATLAS_KEY, TILE_SIZE, TILE_SIZE, 0, 0, 1);
  const groundLayer = groundMap.createLayer(0, groundTileset, 0, 0).setDepth(0);

  const decorMap = scene.make.tilemap({ data: layout.decor, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const decorTileset = decorMap.addTilesetImage(ATLAS_KEY, ATLAS_KEY, TILE_SIZE, TILE_SIZE, 0, 0, 1);
  const decorLayer = decorMap.createLayer(0, decorTileset, 0, 0).setDepth(1);

  createLargeProps(scene, layout.tree);

  return {
    ...layout,
    groundMap,
    decorMap,
    groundLayer,
    decorLayer,
    worldWidth: layout.columns * TILE_SIZE,
    worldHeight: layout.rows * TILE_SIZE,
    playerSpawn: {
      x: layout.spawn.x * TILE_SIZE + TILE_SIZE / 2,
      y: layout.spawn.y * TILE_SIZE + TILE_SIZE / 2,
    },
  };
}
