import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface ViolationResult {
  id: string;
  impact: string | null | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodesCount: number;
  targets: string[];
}

interface PageAuditResult {
  route: string;
  viewport: 'desktop' | 'mobile';
  theme: 'light' | 'dark';
  url: string;
  title: string;
  lang: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  hasMainContent: boolean;
  violations: ViolationResult[];
  smallTargetsCount: number;
  smallTargetsSamples: { tag: string; text: string; width: number; height: number; selector: string }[];
}

const BASE_URL = 'http://localhost:4200';

const ROUTES_TO_AUDIT = [
  '/',
  '/temario',
  '/temario/101',
  '/temario/102',
  '/temario/101/101',
  '/estudiar/101.1',
  '/estudiar/105.1',
  '/laboratorios',
  '/laboratorios/101.1',
  '/simulador',
  '/simulador/practica',
  '/comandos',
  '/glosario',
  '/flashcards',
  '/mapa-mental',
  '/buscar',
  '/progreso',
  '/erratas',
  '/ajustes',
  '/acerca-de',
  '/guia-estilos',
  '/404-no-existe'
];

async function runAudit() {
  console.log('Iniciando auditoría A7 con Playwright + Axe-core...');
  const browser = await chromium.launch({ headless: true });

  const viewports: { name: 'desktop' | 'mobile'; width: number; height: number }[] = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  const themes: ('light' | 'dark')[] = ['light', 'dark'];

  const results: PageAuditResult[] = [];

  for (const vp of viewports) {
    for (const theme of themes) {
      console.log(`\n--- Configuración: Viewport ${vp.name} (${vp.width}x${vp.height}) | Tema ${theme} ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });

      const page = await context.newPage();

      for (const route of ROUTES_TO_AUDIT) {
        const fullUrl = `${BASE_URL}${route}`;
        try {
          await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
          // Ensure theme attribute is set
          await page.evaluate((t) => {
            document.documentElement.setAttribute('data-theme', t);
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);

          await page.waitForTimeout(300); // Allow DOM animations/renders to settle

          // Run Axe analysis
          const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
            .analyze();

          // SEO & Head tags check
          const headInfo = await page.evaluate(() => {
            return {
              title: document.title,
              lang: document.documentElement.getAttribute('lang'),
              metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
              ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
              ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
              ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
              hasMainContent: !!document.querySelector('#main-content')
            };
          });

          // Check interactive element target sizes (< 44x44)
          const targetSizeInfo = await page.evaluate(() => {
            const clickables = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="tab"]'));
            const smallList: { tag: string; text: string; width: number; height: number; selector: string }[] = [];
            for (const el of clickables) {
              const rect = el.getBoundingClientRect();
              // Ignore hidden elements or zero size
              if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden') {
                continue;
              }
              // If width < 44 or height < 44 (WCAG 2.5.5 / 2.5.8)
              // We consider elements strictly below 24px as severe, between 24 and 44 as moderate
              if (rect.width < 44 || rect.height < 44) {
                const text = (el.textContent || (el as HTMLInputElement).value || el.getAttribute('aria-label') || '').trim().slice(0, 30);
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${el.className.toString().split(' ').slice(0, 2).join('.')}` : '';
                smallList.push({
                  tag,
                  text,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  selector: `${tag}${cls}`
                });
              }
            }
            return {
              count: smallList.length,
              samples: smallList.slice(0, 10)
            };
          });

          const violationsSummary: ViolationResult[] = axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodesCount: v.nodes.length,
            targets: v.nodes.slice(0, 5).map((n) => n.target.join(' > '))
          }));

          results.push({
            route,
            viewport: vp.name,
            theme,
            url: fullUrl,
            title: headInfo.title,
            lang: headInfo.lang,
            metaDescription: headInfo.metaDescription,
            ogTitle: headInfo.ogTitle,
            ogDescription: headInfo.ogDescription,
            ogImage: headInfo.ogImage,
            hasMainContent: headInfo.hasMainContent,
            violations: violationsSummary,
            smallTargetsCount: targetSizeInfo.count,
            smallTargetsSamples: targetSizeInfo.samples
          });

          const criticals = violationsSummary.filter((v) => v.impact === 'critical' || v.impact === 'serious').length;
          console.log(`  ✓ ${route.padEnd(22)} | violaciones: ${violationsSummary.length} (críticas/serias: ${criticals}) | targets pequeños: ${targetSizeInfo.count}`);
        } catch (err: any) {
          console.error(`  ✗ Error en ${route}: ${err.message}`);
        }
      }

      await context.close();
    }
  }

  // Also test Search Palette focus trap and behavior specifically
  console.log('\n--- Probando Paleta de Búsqueda (Focus Trap & Teclado) ---');
  const palContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const palPage = await palContext.newPage();
  await palPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Open palette with Ctrl+K or button
  await palPage.keyboard.press('Control+k');
  await palPage.waitForTimeout(300);

  const paletteOpen = await palPage.evaluate(() => {
    return !!document.querySelector('.search-palette-backdrop');
  });

  const activeElementOnOpen = await palPage.evaluate(() => {
    return document.activeElement?.tagName + (document.activeElement?.className ? '.' + document.activeElement.className : '');
  });

  // Tab multiple times to see if focus escapes the modal
  let escapedModal = false;
  for (let i = 0; i < 15; i++) {
    await palPage.keyboard.press('Tab');
    const inPalette = await palPage.evaluate(() => {
      const active = document.activeElement;
      return !!active?.closest('.search-palette-card') || !!active?.closest('.search-palette-backdrop');
    });
    if (!inPalette) {
      escapedModal = true;
      break;
    }
  }

  const paletteReport = {
    openedWithShortcut: paletteOpen,
    activeElementOnOpen,
    focusEscapesModalOnTab: escapedModal
  };
  console.log('Resultado Paleta de Búsqueda:', paletteReport);
  await palContext.close();

  await browser.close();

  const outDir = path.resolve('docs/agent/auditorias/web-2026-11-03');
  const outFile = path.join(outDir, 'a7-axe-raw.json');
  fs.writeFileSync(outFile, JSON.stringify({ auditDate: new Date().toISOString(), paletteReport, results }, null, 2), 'utf-8');
  console.log(`\nAuditoría guardada en ${outFile}`);
}

runAudit().catch((err) => {
  console.error('Fallo en runAudit:', err);
  process.exit(1);
});
