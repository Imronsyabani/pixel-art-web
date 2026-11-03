/** Character sprite asset metadata shared by the loader and animation system. */
export const CHARACTER_DIRECTIONS = Object.freeze(['down', 'left', 'right', 'up']);

export const CHARACTER_ASSETS = Object.freeze({
  rintaro: Object.freeze({
    id: 'rintaro',
    displayName: 'Rintaro',
    baseSrc: '/assets/characters/rintaro/spritesheet.png',
    idleSrc: '/assets/characters/rintaro/idle.png',
    walkSrc: '/assets/characters/rintaro/walk.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrameCount: 4,
    walkFrameCount: 6,
    directions: CHARACTER_DIRECTIONS,
  }),
  kaoruko: Object.freeze({
    id: 'kaoruko',
    displayName: 'Kaoruko',
    baseSrc: '/assets/characters/kaoruko/spritesheet.png',
    idleSrc: '/assets/characters/kaoruko/idle.png',
    walkSrc: '/assets/characters/kaoruko/walk.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrameCount: 4,
    walkFrameCount: 6,
    directions: CHARACTER_DIRECTIONS,
  }),
});

export function getDirectionRow(characterId, direction = 'down') {
  const asset = CHARACTER_ASSETS[characterId];
  if (!asset) throw new Error(`Unknown character asset: ${characterId}`);
  const row = asset.directions.indexOf(direction);
  if (row < 0) throw new Error(`Unknown direction "${direction}" for ${characterId}`);
  return row;
}

export function getCharacterFrame(characterId, direction = 'down') {
  return getDirectionRow(characterId, direction) * CHARACTER_ASSETS[characterId].idleFrameCount;
}
