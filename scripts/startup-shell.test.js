import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, entry] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
]);

test('static landing shell has a start action and does not show the game canvas early', () => {
  assert.match(html, /id="app-start"/);
  assert.match(html, /#game-root\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(html, /#app\.game-ready\s+#game-root\s*\{[^}]*visibility:\s*visible/s);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
});

test('game startup is user initiated and uses a dynamic engine import', () => {
  assert.match(entry, /import\('\.\/config\/gameConfig\.js'\)/);
  assert.match(entry, /addEventListener\('click',\s*start/);
  assert.doesNotMatch(entry, /\nstart\(\);/);
  assert.match(entry, /dataset\.gameState\s*=\s*'ready'/);
});
