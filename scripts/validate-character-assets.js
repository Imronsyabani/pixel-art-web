import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const checks = [
  { id: 'rintaro base', path: 'public/assets/characters/rintaro/spritesheet.png', width: 256, height: 64 },
  { id: 'kaoruko base', path: 'public/assets/characters/kaoruko/spritesheet.png', width: 256, height: 64 },
  { id: 'rintaro idle', path: 'public/assets/characters/rintaro/idle.png', width: 256, height: 256 },
  { id: 'rintaro walk', path: 'public/assets/characters/rintaro/walk.png', width: 384, height: 256 },
  { id: 'kaoruko idle', path: 'public/assets/characters/kaoruko/idle.png', width: 256, height: 256 },
  { id: 'kaoruko walk', path: 'public/assets/characters/kaoruko/walk.png', width: 384, height: 256 },
];

for (const item of checks) {
  const buffer = await readFile(resolve(item.path));
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`${item.id}: file is not a valid PNG (${item.path})`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== item.width || height !== item.height) {
    throw new Error(`${item.id}: expected ${item.width}x${item.height}, got ${width}x${height}`);
  }
  console.log(`✓ ${item.id}: ${width}x${height} PNG`);
}
