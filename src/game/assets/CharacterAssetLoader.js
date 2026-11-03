import { CHARACTER_ASSETS } from './characterAssets.js';

/** Queue the character sheets before a scene starts. */
export function preloadCharacterAssets(scene) {
  for (const asset of Object.values(CHARACTER_ASSETS)) {
    scene.load.spritesheet(asset.id, asset.src, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
      endFrame: asset.frameCount - 1,
    });
  }
}
