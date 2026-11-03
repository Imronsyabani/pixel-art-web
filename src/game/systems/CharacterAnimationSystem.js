import { CHARACTER_ASSETS, getDirectionRow } from '../assets/characterAssets.js';

export const CHARACTER_ANIMATION_STATES = Object.freeze({
  idle: Object.freeze({ frameRate: 3, repeat: -1 }),
  walk: Object.freeze({ frameRate: 9, repeat: -1 }),
});

export function getCharacterAnimationKey(characterId, state = 'idle', direction = 'down') {
  if (!CHARACTER_ASSETS[characterId]) throw new Error(`Unknown character: ${characterId}`);
  if (!CHARACTER_ANIMATION_STATES[state]) throw new Error(`Unknown animation state: ${state}`);
  getDirectionRow(characterId, direction);
  return `${characterId}-${state}-${direction}`;
}

export function getCharacterAnimationFrames(characterId, state = 'idle', direction = 'down') {
  const asset = CHARACTER_ASSETS[characterId];
  if (!asset) throw new Error(`Unknown character: ${characterId}`);
  if (!CHARACTER_ANIMATION_STATES[state]) throw new Error(`Unknown animation state: ${state}`);

  const row = getDirectionRow(characterId, direction);
  const frameCount = state === 'idle' ? asset.idleFrameCount : asset.walkFrameCount;
  const first = row * frameCount;
  return Array.from({ length: frameCount }, (_, index) => first + index);
}

/** Register looping idle and walk animations for every character and direction. */
export function registerCharacterAnimations(scene) {
  for (const asset of Object.values(CHARACTER_ASSETS)) {
    for (const direction of asset.directions) {
      for (const state of Object.keys(CHARACTER_ANIMATION_STATES)) {
        const key = getCharacterAnimationKey(asset.id, state, direction);
        if (scene.anims.exists(key)) continue;

        const animation = CHARACTER_ANIMATION_STATES[state];
        const texture = `${asset.id}-${state}`;
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(texture, {
            frames: getCharacterAnimationFrames(asset.id, state, direction),
          }),
          frameRate: animation.frameRate,
          repeat: animation.repeat,
        });
      }
    }
  }
}

/** Switch a sprite between idle/walk while preserving its selected direction. */
export function playCharacterAnimation(sprite, state, direction) {
  const characterId = sprite.getData('characterId');
  const nextDirection = direction ?? sprite.getData('direction') ?? 'down';
  const key = getCharacterAnimationKey(characterId, state, nextDirection);
  sprite.setData('direction', nextDirection);
  sprite.setData('animationState', state);
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
  return key;
}
