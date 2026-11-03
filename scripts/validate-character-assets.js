import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const checks = [
  { id: 'rintaro', path: 'public/assets/characters/rintaro/spritesheet.png' },
  { id: 'kaoruko', path: 'public/assets/characters/kaoruko/spritesheet.png' },
];
const expected = { width: 256, height: 64 };

for (const item of checks) {
  const fullPath = resolve(item.path);
  const buffer = await readFile(fullPath);
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature) {
    throw new Error(`${item.id}: file is not a valid PNG (${item.path})`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expected.width || height !== expected.height) {
    throw new Error(`${item.id}: expected ${expected.width}x${expected.height}, got ${width}x${height}`);
  }
  console.log(`✓ ${item.id}: ${width}x${height} PNG (${item.path})`);
}
