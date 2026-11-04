import '@fontsource-variable/pixelify-sans/wght.css';
import './styles.css';
import { parseGameMode } from './config/gameMode.js';

const app = document.querySelector('#app');
const loader = document.querySelector('#app-loading');
const status = document.querySelector('#app-loading-status');
const progress = document.querySelector('#app-loading-progress');
const startButton = document.querySelector('#app-start');
let gameInstance = null;
let started = false;

document.documentElement.dataset.gameState = 'landing';

function setStatus(message) {
  if (status) status.textContent = message;
}

function failStartup(message) {
  if (!loader) return;
  loader.classList.remove('is-loading');
  loader.classList.add('is-error');
  document.documentElement.dataset.gameState = 'error';
  setStatus('The garden could not be loaded.');
  const error = document.querySelector('#app-loading-error');
  if (error) error.textContent = message || 'Check your connection and reload the page.';
}

async function waitForLocalFont() {
  if (!document.fonts?.load) return;
  await document.fonts.load('500 16px "Pixelify Sans Variable"');
  await document.fonts.ready;
}

window.addEventListener('cliff-garden:progress', (event) => {
  const value = Math.max(0, Math.min(1, Number(event.detail?.value) || 0));
  if (progress) progress.style.width = `${Math.round(value * 100)}%`;
  setStatus('Loading character assets…');
});

window.addEventListener('cliff-garden:preparing', () => {
  if (progress) progress.style.width = '100%';
  setStatus('Preparing map, controls and animations…');
});

window.addEventListener('cliff-garden:error', (event) => {
  failStartup(event.detail?.message);
});

window.addEventListener('cliff-garden:ready', () => {
  performance.mark('cliff-garden:ready');
  const startMark = performance.getEntriesByName('cliff-garden:game-start').length > 0;
  if (startMark) {
    const measure = performance.measure(
      'cliff-garden:game-startup',
      'cliff-garden:game-start',
      'cliff-garden:ready',
    );
    document.documentElement.dataset.startupMs = String(Math.round(measure.duration));
  }
  document.documentElement.dataset.gameState = 'ready';
  app?.classList.add('game-ready');
  loader?.classList.add('is-hidden');
  window.setTimeout(() => loader?.remove(), 260);
});

async function start() {
  if (started) return;
  started = true;
  startButton.disabled = true;
  loader?.classList.add('is-loading');
  document.documentElement.dataset.gameState = 'loading';
  performance.mark('cliff-garden:game-start');

  const mode = parseGameMode();
  document.documentElement.dataset.gameMode = mode.mode;
  document.documentElement.dataset.player = mode.gender;

  try {
    setStatus('Loading game engine and local font…');
    const [{ createGame }] = await Promise.all([
      import('./config/gameConfig.js'),
      waitForLocalFont(),
    ]);
    setStatus('Loading selected character assets…');
    gameInstance = createGame();
  } catch (error) {
    console.error('Cliff Garden startup failed:', error);
    failStartup(error instanceof Error ? error.message : 'Unexpected startup error.');
  }
}

startButton?.addEventListener('click', start);
document.documentElement.dataset.entryReady = 'true';

window.addEventListener('beforeunload', () => gameInstance?.destroy(true));
