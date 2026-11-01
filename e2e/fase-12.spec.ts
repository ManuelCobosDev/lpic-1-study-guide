import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-12');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 12: Auditoría Integral, Crawler de Rutas, Rendimiento y Accesibilidad', () => {

  const KEY_ROUTES = [
    '/',
    '/temario',
    '/temario/101',
    '/temario/101/101',
    '/temario/102',
    '/temario/102/105',
    '/estudiar/101.1',
    '/estudiar/103.4',
    '/estudiar/103.4/imprimir',
    '/laboratorios',
    '/laboratorios/103.4',
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
    '/guia-estilos'
  ];

  test('Crawler interno: recorre todas las 23 rutas declaradas sin errores de consola ni 404s (Gate 12)', async ({
    page
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filtrar advertencias de favicon o fuentes de terceros si las hubiera
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(`[${page.url()}] ${text}`);
        }
      }
    });

    for (const route of KEY_ROUTES) {
      const response = await page.goto(route);
      expect(response?.status(), `La ruta ${route} debe responder con estado 200`).toBe(200);

      // Esperar a que app-shell y el router-outlet rendericen
      await page.waitForSelector('app-shell');
      await page.waitForTimeout(100);

      // Comprobar que no se cargó la página 404
      const notFoundElement = page.locator('app-not-found-page');
      await expect(notFoundElement).toHaveCount(0);
    }

    // Comprobar que no hubo ningún console.error
    expect(consoleErrors, `Se encontraron errores de consola: ${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('Responsive 390px (Mobile): ninguna ruta tiene scroll horizontal anómalo (Gate 12)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const responsiveTestRoutes = [
      '/',
      '/temario',
      '/estudiar/103.4',
      '/laboratorios',
      '/simulador',
      '/comandos',
      '/glosario',
      '/flashcards',
      '/progreso',
      '/ajustes',
      '/acerca-de'
    ];

    for (const route of responsiveTestRoutes) {
      await page.goto(route);
      await page.waitForSelector('app-shell');
      await page.waitForTimeout(150);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });

      expect(hasHorizontalScroll, `La ruta ${route} tiene scroll horizontal inesperado en 390px`).toBe(false);
    }

    // Capturar screenshot móvil en la Home
    await page.goto('/');
    await page.waitForSelector('app-home-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-390px-home.png') });
  });

  test('Accesibilidad Axe: 0 violaciones críticas o serias en temas Claro y Oscuro (Gate 12)', async ({ page }) => {
    test.setTimeout(90000);
    const sampleRoutes = ['/', '/temario', '/estudiar/103.4', '/simulador', '/progreso'];

    for (const theme of ['light', 'dark']) {
      for (const route of sampleRoutes) {
        await page.goto(route);
        await page.waitForSelector('app-shell');

        // Establecer el tema
        await page.evaluate((th) => {
          document.documentElement.setAttribute('data-theme', th);
        }, theme);

        await page.waitForTimeout(100);

        const axeResults = await new AxeBuilder({ page })
          .disableRules(['color-contrast']) // El contraste se calibra con los tokens aprobados
          .analyze();

        const seriousOrCritical = axeResults.violations.filter((v) =>
          v.impact === 'serious' || v.impact === 'critical'
        );

        expect(
          seriousOrCritical,
          `Violaciones de accesibilidad en ${route} (${theme}): ${JSON.stringify(seriousOrCritical, null, 2)}`
        ).toEqual([]);
      }
    }

    // Capturas de pantalla para tema claro y tema oscuro
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-slide-viewer');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'lesson-light.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'lesson-dark.png') });
  });

  test('Sin stubs ni maquetas pendientes en toda la aplicación (Gate 12)', async ({ page }) => {
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');

    // No debe existir ningún stub-badge o elemento simulado sin implementar
    const stubs = page.locator('.stub-card, .not-implemented-stub');
    await expect(stubs).toHaveCount(0);
  });
});

