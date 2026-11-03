import { CHARACTER_ASSETS, getCharacterFrame } from '../assets/characterAssets.js';
import { playCharacterAnimation } from './CharacterAnimationSystem.js';

/** Create a character sprite with an initial looping idle or walk animation. */
export function createCharacter(scene, characterId, x, y, options = {}) {
  const asset = CHARACTER_ASSETS[characterId];
  if (!asset) throw new Error(`Unknown character: ${characterId}`);

  const {
    direction = 'down',
    state = 'idle',
    scale = 2.8,
    depth = y,
  } = options;

  const sprite = scene.add.sprite(
    x,
    y,
    `${characterId}-idle`,
    getCharacterFrame(characterId, direction),
  );
  sprite
    .setOrigin(0.5, 0.9)
    .setScale(scale)
    .setDepth(depth);
  sprite.setData('characterId', characterId);
  sprite.setData('direction', direction);
  sprite.setData('animationState', 'idle');
  playCharacterAnimation(sprite, state, direction);

  return sprite;
}

export { playCharacterAnimation };
