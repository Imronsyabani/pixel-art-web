import { CHARACTER_ASSETS, getCharacterFrame } from '../assets/characterAssets.js';

/** Create a display-only character sprite; movement and animation are Phase 3. */
export function createCharacter(scene, characterId, x, y, options = {}) {
  const asset = CHARACTER_ASSETS[characterId];
  if (!asset) throw new Error(`Unknown character: ${characterId}`);

  const { direction = 'down', scale = 2.5, depth = y } = options;
  const sprite = scene.add.sprite(x, y, asset.id, getCharacterFrame(characterId, direction));
  sprite
    .setOrigin(0.5, 0.9)
    .setScale(scale)
    .setDepth(depth);

  return sprite;
}
