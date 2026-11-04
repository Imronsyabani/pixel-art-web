import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const LIMITS = {
  initialJavaScriptGzip: 100 * 1024,
  totalJavaScriptGzip: 700 * 1024,
  totalCssGzip: 70 * 1024,
  imageBytes: 1024 * 1024,
  fontBytes: 100 * 1024,
};

async function listFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path));
    else result.push(path);
  }
  return result;
}

const sum = (values) => values.reduce((total, value) => total + value, 0);
const files = await listFiles(DIST);
const records = await Promise.all(files.map(async (path) => {
  const [content, info] = await Promise.all([readFile(path), stat(path)]);
  return {
    path,
    bytes: info.size,
    gzipBytes: gzipSync(content).length,
    extension: extname(path).toLowerCase(),
  };
}));

const html = await readFile(join(DIST, 'index.html'), 'utf8');
const entryScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)]
  .map((match) => match[1]);
const initialJavaScriptGzip = sum(records
  .filter((file) => entryScripts.some((src) => file.path.endsWith(src.replace(/^\//, ''))))
  .map((file) => file.gzipBytes));
const totalJavaScriptGzip = sum(records.filter((file) => file.extension === '.js').map((file) => file.gzipBytes));
const totalCssGzip = sum(records.filter((file) => file.extension === '.css').map((file) => file.gzipBytes));
const imageBytes = sum(records.filter((file) => ['.png', '.webp', '.jpg', '.jpeg'].includes(file.extension)).map((file) => file.bytes));
const fontBytes = sum(records.filter((file) => ['.woff', '.woff2', '.ttf', '.otf'].includes(file.extension)).map((file) => file.bytes));

const metrics = { initialJavaScriptGzip, totalJavaScriptGzip, totalCssGzip, imageBytes, fontBytes };
console.log('Production asset budget (gzip for JS/CSS):');
for (const [name, value] of Object.entries(metrics)) {
  console.log(`- ${name}: ${(value / 1024).toFixed(1)} KiB`);
}

const failures = Object.entries(LIMITS)
  .filter(([name, limit]) => metrics[name] > limit)
  .map(([name, limit]) => `${name}: ${(metrics[name] / 1024).toFixed(1)} KiB exceeds ${(limit / 1024).toFixed(1)} KiB`);

if (failures.length) {
  console.error('Performance budget failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('✓ Production asset budgets passed.');
}
