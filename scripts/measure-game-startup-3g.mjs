import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import puppeteer from 'puppeteer-core';

const baseUrl = process.env.PERFORMANCE_TEST_URL ?? 'http://127.0.0.1:4174/';
const chromePath = process.env.CHROME_PATH;
const outputDirectory = fileURLToPath(new URL('../artifacts/', import.meta.url));
const outputPath = fileURLToPath(new URL('../artifacts/game-startup-3g.json', import.meta.url));
const MAX_STARTUP_MS = 50_000;

if (!chromePath) {
  throw new Error('CHROME_PATH must point to the Chrome binary installed by the CI workflow.');
}

const server = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js',
  'preview',
  '--host', '127.0.0.1',
  '--port', '4174',
  '--strictPort',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Preview server exited early:\n${serverOutput}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch { /* server is still starting */ }
    await delay(200);
  }
  throw new Error(`Preview server did not become ready:\n${serverOutput}`);
}

async function measureMode(browser, query, modeName) {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  const pageErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true });
  await page.setCacheEnabled(false);

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 400,
    downloadThroughput: 50 * 1024,
    uploadThroughput: 50 * 1024,
    connectionType: 'cellular3g',
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });

  try {
    await page.goto(new URL(query, baseUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await page.waitForFunction(
      () => document.documentElement.dataset.entryReady === 'true',
      { timeout: 30_000 },
    );
    await page.waitForSelector('#app-start', { visible: true, timeout: 30_000 });

    const clickedAt = Date.now();
    await page.click('#app-start');
    await page.waitForFunction(
      () => document.documentElement.dataset.gameState === 'ready',
      { timeout: 180_000 },
    );

    const measurement = await page.evaluate(() => {
      const entry = performance.getEntriesByName('cliff-garden:game-startup').at(-1);
      return {
        startupMs: entry ? Math.round(entry.duration) : null,
        startupMark: performance.getEntriesByName('cliff-garden:game-start')[0]?.startTime ?? null,
        readyMark: performance.getEntriesByName('cliff-garden:ready').at(-1)?.startTime ?? null,
      };
    });

    if (measurement.startupMs === null) {
      throw new Error('Game reached ready state without recording the startup performance measure.');
    }
    if (pageErrors.length) {
      throw new Error(`Browser page errors while starting ${modeName}: ${pageErrors.join(' | ')}`);
    }

    return {
      mode: modeName,
      url: query,
      startupMs: measurement.startupMs,
      wallClockMs: Date.now() - clickedAt,
      passed: measurement.startupMs <= MAX_STARTUP_MS,
      network: { downloadKbps: 400, uploadKbps: 400, latencyMs: 400, cpuSlowdown: 4 },
      pageErrors,
    };
  } finally {
    await page.close();
  }
}

let browser;
try {
  await waitForServer();
  browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];
  results.push(await measureMode(browser, '/?G=boy', 'solo'));
  results.push(await measureMode(browser, '/?G=boy&C=true', 'couple'));

  await mkdir(outputDirectory, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    profile: 'mobile 3G simulated (400 Kbps, 400 ms RTT, CPU 4x)',
    maximumStartupMs: MAX_STARTUP_MS,
    results,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  for (const result of results) {
    console.log(`${result.mode}: ${(result.startupMs / 1000).toFixed(2)}s`);
  }
  console.log(`Startup report written to ${outputPath}`);

  if (results.some((result) => !result.passed)) {
    throw new Error(`Game startup exceeded the ${MAX_STARTUP_MS / 1000}s budget on simulated 3G.`);
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
