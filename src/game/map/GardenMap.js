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
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.clip();
    callback(x, y);
    ctx.restore();
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
  createPixelTexture(scene, 'garden-banyan-tree', 384, 352, (ctx) => {
    const seed = (x, y, salt = 0) => {
      const value = Math.sin((x + salt * 13.7) * 127.1 + (y + salt * 7.1) * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };

    // Broad ground shadow and the thick trunk/root system.
    fillPixel(ctx, 42, 316, 300, 18, 'rgba(34,65,43,0.30)');
    fillPixel(ctx, 162, 160, 60, 166, '#563b2b');
    fillPixel(ctx, 171, 156, 40, 164, '#795039');
    fillPixel(ctx, 183, 158, 17, 156, '#a36b40');
    fillPixel(ctx, 205, 177, 10, 132, '#65442f');

    // Exposed roots radiate from the trunk like a mature banyan.
    const roots = [
      [170, 270, 28, 58], [186, 288, 16, 50], [205, 270, 27, 60],
      [145, 299, 54, 18], [218, 300, 57, 17], [105, 306, 72, 10],
      [246, 306, 70, 10], [156, 316, 38, 10], [203, 315, 42, 10],
    ];
    for (const [x, y, width, height] of roots) {
      fillPixel(ctx, x, y, width, height, '#62432e');
      fillPixel(ctx, x + 4, y + 2, Math.max(4, width - 10), Math.max(4, height - 5), '#91603a');
      fillPixel(ctx, x + 10, y + 3, Math.max(3, width - 22), 3, '#b17b4d');
    }

    // The canopy is built from stepped pixel clusters instead of a flat ellipse.
    const lobes = [
      [192, 116, 178, 102], [92, 125, 104, 82], [292, 122, 106, 84],
      [145, 70, 106, 76], [241, 72, 108, 78], [42, 160, 42, 55],
      [341, 158, 40, 54],
    ];
    const greens = ['#205a3b', '#2d7047', '#397f4e', '#4b9255', '#5da05e', '#77b36a'];
    for (let y = 16; y < 252; y += 8) {
      for (let x = 0; x < 384; x += 8) {
        let distance = Infinity;
        for (const [cx, cy, rx, ry] of lobes) {
          const d = ((x + 4 - cx) / rx) ** 2 + ((y + 4 - cy) / ry) ** 2;
          distance = Math.min(distance, d);
        }
        if (distance > 1.03) continue;
        const noise = seed(x, y, 1);
        const paletteIndex = noise > 0.91 ? 5 : noise > 0.73 ? 4 : noise > 0.49 ? 3 : noise > 0.22 ? 2 : 1;
        const baseColor = greens[paletteIndex];
        fillPixel(ctx, x, y, 8, 8, baseColor);
        if (noise > 0.68) fillPixel(ctx, x + 2, y + 1, 4, 3, '#8cbe70');
        if (noise < 0.16) fillPixel(ctx, x + 1, y + 5, 5, 2, '#174d36');
      }
    }

    // Hanging aerial roots and vines beneath the canopy.
    for (let index = 0; index < 18; index += 1) {
      const x = 64 + index * 15 + Math.round(seed(index, 2, 3) * 8);
      const startY = 144 + Math.round(seed(index, 4, 4) * 48);
      const length = 35 + Math.round(seed(index, 5, 5) * 65);
      fillPixel(ctx, x, startY, 3, length, index % 3 === 0 ? '#775039' : '#8c6341');
      fillPixel(ctx, x + 1, startY + 4, 1, Math.max(8, length - 10), '#b08050');
    }

    // A foreground trunk face and bark highlights keep the tree readable at game scale.
    fillPixel(ctx, 157, 190, 70, 134, '#65442f');
    fillPixel(ctx, 169, 190, 43, 126, '#98633b');
    fillPixel(ctx, 183, 193, 11, 117, '#b17a49');
    fillPixel(ctx, 210, 204, 8, 98, '#805237');
    fillPixel(ctx, 177, 238, 5, 48, '#5a3d2c');
    fillPixel(ctx, 195, 222, 5, 70, '#74492f');
    fillPixel(ctx, 154, 310, 74, 12, '#4f392b');

    // Scattered leaf highlights add depth without introducing another prop.
    for (let index = 0; index < 92; index += 1) {
      const x = 22 + Math.floor(seed(index, 10, 6) * 340);
      const y = 22 + Math.floor(seed(index, 18, 7) * 204);
      fillPixel(ctx, x, y, 5 + (index % 3) * 2, 4, index % 4 === 0 ? '#a0c976' : '#6cad62');
    }
  });

  const x = treePosition.x * TILE_SIZE + TILE_SIZE / 2;
  const y = treePosition.y * TILE_SIZE + TILE_SIZE * 1.15;
  scene.add.image(x, y, 'garden-banyan-tree')
    .setOrigin(0.5, 0.94)
    .setDepth(y + 2);
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
