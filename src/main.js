
import '@fontsource-variable/pixelify-sans/wght.css';
import './styles.css';
import { parseGameMode } from './config/gameMode.js';

const loader = document.querySelector('#app-loading');
const status = document.querySelector('#app-loading-status');
const progress = document.querySelector('#app-loading-progress');
let gameInstance = null;

function setStatus(message) {
  if (status) status.textContent = message;
}

function failStartup(message) {
  if (!loader) return;
  loader.classList.add('is-error');
  setStatus('The garden could not be loaded.');
  const error = document.querySelector('#app-loading-error');
  if (error) error.textContent = message || 'Check your connection and reload the page.';
}

function waitForLocalFont() {
  if (!document.fonts?.load) return Promise.resolve();
  const fontLoad = document.fonts.load('500 16px "Pixelify Sans Variable"');
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 5000));
  return Promise.race([fontLoad.catch(() => []), timeout]);
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
  loader?.classList.add('is-hidden');
  window.setTimeout(() => loader?.remove(), 260);
});

async function start() {
  performance.mark('cliff-garden:startup');
  const mode = parseGameMode();
  document.documentElement.dataset.gameMode = mode.mode;
  document.documentElement.dataset.player = mode.gender;

  try {
    setStatus('Loading game engine and local font…');
    const [{ createGame }] = await Promise.all([
      import('./config/gameConfig.js'),
      waitForLocalFont(),
    ]);
    setStatus('Loading character assets…');
    gameInstance = createGame();
  } catch (error) {
    console.error('Cliff Garden startup failed:', error);
    failStartup(error instanceof Error ? error.message : 'Unexpected startup error.');
  }
}

start();

window.addEventListener('beforeunload', () => gameInstance?.destroy(true));
