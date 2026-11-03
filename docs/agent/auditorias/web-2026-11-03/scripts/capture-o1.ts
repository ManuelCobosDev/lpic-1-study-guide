import { chromium } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

async function captureO1() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const outDir = path.resolve('docs/agent/auditorias/web-2026-11-03/capturas/o1-after');
  fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    { url: 'http://localhost:4200/', name: '01-home.png' },
    { url: 'http://localhost:4200/flashcards', name: '02-flashcards.png' },
    { url: 'http://localhost:4200/comandos', name: '03-comandos.png' },
    { url: 'http://localhost:4200/estudiar/110.1', name: '04-estudiar-110-1.png' }
  ];

  for (const t of targets) {
    try {
      await page.goto(t.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, t.name), fullPage: true });
      console.log(`Captured: ${t.name}`);
    } catch (err) {
      console.error(`Failed to capture ${t.url}:`, err);
    }
  }

  await browser.close();
}

captureO1();
