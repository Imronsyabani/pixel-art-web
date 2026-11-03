/**
 * Character spritesheet contract.
 * Each sheet is a single horizontal row of 64x64 frames in this order:
 * down, left, right, up.
 */
export const CHARACTER_DIRECTIONS = Object.freeze(['down', 'left', 'right', 'up']);

export const CHARACTER_ASSETS = Object.freeze({
  rintaro: Object.freeze({
    id: 'rintaro',
    displayName: 'Rintaro',
    src: '/assets/characters/rintaro/spritesheet.png',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    directions: CHARACTER_DIRECTIONS,
  }),
  kaoruko: Object.freeze({
    id: 'kaoruko',
    displayName: 'Kaoruko',
    src: '/assets/characters/kaoruko/spritesheet.png',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    directions: CHARACTER_DIRECTIONS,
  }),
});

export function getCharacterFrame(characterId, direction = 'down') {
  const asset = CHARACTER_ASSETS[characterId];
  if (!asset) throw new Error(`Unknown character asset: ${characterId}`);

  const frame = asset.directions.indexOf(direction);
  if (frame < 0) throw new Error(`Unknown direction "${direction}" for ${characterId}`);
  return frame;
}
