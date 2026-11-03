import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

const BASE_URL = 'http://localhost:4200';
const OUTPUT_DIR = path.resolve('docs', 'agent', 'auditorias', 'web-2026-11-03', 'capturas');

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1920x1080', width: 1920, height: 1080 }
];

const THEMES = ['claro', 'oscuro'] as const;

// Read demo backup to populate realistic localStorage
let demoBackupData: Record<string, unknown> = {};
try {
  const demoPath = path.resolve('e2e', 'screenshots', 'demo', 'demo-exported-backup.json');
  if (fs.existsSync(demoPath)) {
    const raw = JSON.parse(fs.readFileSync(demoPath, 'utf-8'));
    if (raw && raw.data) {
      demoBackupData = raw.data;
    }
  }
} catch (e) {
  console.warn('Could not load demo backup:', e);
}

interface Target {
  id: string;
  path: string;
  waitSelector?: string;
  delayMs?: number;
}

const TARGETS: Target[] = [
  // 1. Vistas base
  { id: 'home', path: '/' },
  { id: 'temario', path: '/temario' },
  { id: 'temario-101', path: '/temario/101' },
  { id: 'temario-102', path: '/temario/102' },
  { id: 'tema-101', path: '/temario/101/101' },
  { id: 'laboratorios', path: '/laboratorios' },
  { id: 'lab-101-1', path: '/laboratorios/101.1' },
  { id: 'simulador', path: '/simulador' },
  { id: 'simulador-examen', path: '/simulador/examen' },
  { id: 'simulador-practica', path: '/simulador/practica?exam=101' },
  { id: 'simulador-resultados', path: '/simulador/resultados' },
  { id: 'comandos', path: '/comandos' },
  { id: 'glosario', path: '/glosario' },
  { id: 'flashcards', path: '/flashcards' },
  { id: 'mapa-mental', path: '/mapa-mental', delayMs: 600 },
  { id: 'buscar', path: '/buscar' },
  { id: 'progreso', path: '/progreso' },
  { id: 'erratas', path: '/erratas' },
  { id: 'ajustes', path: '/ajustes' },
  { id: 'acerca-de', path: '/acerca-de' },
  { id: '404', path: '/pagina-que-no-existe-404' },

  // 2. Muestras de lecciones (completas)
  { id: 'estudiar-101-1-slides', path: '/estudiar/101.1?vista=slides', delayMs: 400 },
  { id: 'estudiar-101-1-web', path: '/estudiar/101.1?vista=web', delayMs: 400 },
  { id: 'estudiar-101-1-imprimir', path: '/estudiar/101.1/imprimir', delayMs: 500 },

  { id: 'estudiar-102-1-slides', path: '/estudiar/102.1?vista=slides', delayMs: 400 },
  { id: 'estudiar-102-1-web', path: '/estudiar/102.1?vista=web', delayMs: 400 },

  { id: 'estudiar-103-4-slides', path: '/estudiar/103.4?vista=slides', delayMs: 400 },
  { id: 'estudiar-103-4-web', path: '/estudiar/103.4?vista=web', delayMs: 400 },

  { id: 'estudiar-105-1-slides', path: '/estudiar/105.1?vista=slides', delayMs: 400 },
  { id: 'estudiar-105-1-web', path: '/estudiar/105.1?vista=web', delayMs: 400 },
  { id: 'estudiar-105-1-imprimir', path: '/estudiar/105.1/imprimir', delayMs: 500 },

  // Muestras de lecciones (medias)
  { id: 'estudiar-106-2-slides', path: '/estudiar/106.2?vista=slides', delayMs: 400 },
  { id: 'estudiar-106-2-web', path: '/estudiar/106.2?vista=web', delayMs: 400 },

  { id: 'estudiar-108-2-slides', path: '/estudiar/108.2?vista=slides', delayMs: 400 },
  { id: 'estudiar-108-2-web', path: '/estudiar/108.2?vista=web', delayMs: 400 },

  // Muestras de lecciones (esqueleto)
  { id: 'estudiar-108-3-slides', path: '/estudiar/108.3?vista=slides', delayMs: 400 },
  { id: 'estudiar-108-3-web', path: '/estudiar/108.3?vista=web', delayMs: 400 },

  { id: 'estudiar-109-1-slides', path: '/estudiar/109.1?vista=slides', delayMs: 400 },
  { id: 'estudiar-109-1-web', path: '/estudiar/109.1?vista=web', delayMs: 400 },

  { id: 'estudiar-110-1-slides', path: '/estudiar/110.1?vista=slides', delayMs: 400 },
  { id: 'estudiar-110-1-web', path: '/estudiar/110.1?vista=web', delayMs: 400 },

  // 3. Casos de revisión específica
  // S-05 / A6-001: 101.1 slide 2 (bloque HTML)
  { id: 's05-html-block-101-1-slide2', path: '/estudiar/101.1?vista=slides&slide=2', delayMs: 500 },
  // S-04: Portada duplicada 101.1 slide 1
  { id: 's04-cover-duplicate-101-1-slide1', path: '/estudiar/101.1?vista=slides&slide=1', delayMs: 500 },
  // S-04: Portada duplicada 105.1 slide 1
  { id: 's04-cover-duplicate-105-1-slide1', path: '/estudiar/105.1?vista=slides&slide=1', delayMs: 500 }
];

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  console.log(`Starting matrix capture: ${TARGETS.length} targets x ${VIEWPORTS.length} viewports x ${THEMES.length} themes = ${TARGETS.length * VIEWPORTS.length * THEMES.length} total captures.`);

  let count = 0;
  const total = TARGETS.length * VIEWPORTS.length * THEMES.length;
  const startTime = Date.now();

  for (const theme of THEMES) {
    const isDark = theme === 'oscuro';
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Capturing theme: ${theme}, viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: isDark ? 'dark' : 'light'
      });

      // Pre-seed storage before each page
      await context.addInitScript(({ isDark, demoData }) => {
        // Seed backup items
        for (const [key, val] of Object.entries(demoData)) {
          try {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          } catch {
            // ignore
          }
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }, { isDark, demoData: demoBackupData });

      const page = await context.newPage();

      for (const target of TARGETS) {
        count++;
        const filename = `${target.id}-${vp.name}-${theme}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        try {
          await page.goto(`${BASE_URL}${target.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          });

          if (target.waitSelector) {
            await page.waitForSelector(target.waitSelector, { timeout: 3000 }).catch(() => {});
          }

          if (target.delayMs) {
            await page.waitForTimeout(target.delayMs);
          } else {
            await page.waitForTimeout(150);
          }

          // Ensure dark/light class is applied
          await page.evaluate((dark) => {
            if (dark) {
              document.documentElement.classList.add('dark');
              document.documentElement.setAttribute('data-theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
            }
          }, isDark);

          await page.screenshot({ path: filepath, fullPage: true });

          if (count % 20 === 0 || count === total) {
            const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[${count}/${total}] Saved ${filename} (${elapsedSec}s elapsed)`);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Error capturing ${target.id} on ${vp.name} ${theme}: ${msg}`);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log(`\nFinished capturing all screenshots in ${((Date.now() - startTime) / 1000).toFixed(1)}s.`);
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
