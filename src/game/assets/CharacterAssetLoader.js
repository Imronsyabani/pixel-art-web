import { CHARACTER_ASSETS } from './characterAssets.js';

/** Queue idle and walk sheets before a scene starts. */
export function preloadCharacterAssets(scene) {
  for (const asset of Object.values(CHARACTER_ASSETS)) {
    scene.load.spritesheet(`${asset.id}-idle`, asset.idleSrc, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
      endFrame: asset.idleFrameCount * asset.directions.length - 1,
    });
    scene.load.spritesheet(`${asset.id}-walk`, asset.walkSrc, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
      endFrame: asset.walkFrameCount * asset.directions.length - 1,
    });
  }
}
