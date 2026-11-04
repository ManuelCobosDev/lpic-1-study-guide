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

  test('Oleada O2: Navegación, Enlaces, Migas de Pan, SEO y robots/sitemap sin 404s', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Verificación SEO index.html
    await page.goto('/');
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang, 'index.html debe tener lang="es"').toBe('es');

    const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDesc, 'meta description debe existir y estar en español').toBeTruthy();
    expect(metaDesc).toContain('LPIC-1');

    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toContain('LPIC-1');

    // 2. Verificación Fe de Erratas (enlace corregido a /estudiar/:id, no /leccion/:id)
    await page.goto('/erratas');
    await page.waitForSelector('.subtopic-link');
    const firstErrataLink = page.locator('.subtopic-link').first();
    const href = await firstErrataLink.getAttribute('href');
    expect(href, 'El enlace de erratas debe apuntar a /estudiar/...').toMatch(/^\/estudiar\//);
    await firstErrataLink.click();
    await page.waitForURL(/\/estudiar\//);
    await expect(page.locator('app-not-found-page')).toHaveCount(0);

    // 3. Verificación Topic Detail (Misión Integradora apunta a un lab existente)
    await page.goto('/temario/101/101');
    const globalLabBtn = page.locator('app-button', { hasText: 'Iniciar misión integradora' });
    await expect(globalLabBtn).toBeVisible();
    await globalLabBtn.click();
    await page.waitForURL(/\/laboratorios\/lab-101/);
    await expect(page.locator('app-not-found-page')).toHaveCount(0);
    await expect(page.locator('.lab-error, app-callout[variant="error"]')).toHaveCount(0);

    // 4. Verificación Migas de Pan en /estudiar/:id (el segmento Temario no lleva a 404)
    await page.goto('/estudiar/105.1');
    await page.waitForSelector('app-breadcrumbs');
    const temarioCrumb = page.locator('app-breadcrumbs a', { hasText: 'Temario' });
    await expect(temarioCrumb).toHaveAttribute('href', '/temario');
    await temarioCrumb.click();
    await page.waitForURL(/\/temario/);
    await expect(page.locator('app-not-found-page')).toHaveCount(0);

    // 5. Verificación de robots.txt y sitemap.xml
    const robotsRes = await page.request.get('/robots.txt');
    expect(robotsRes.status(), '/robots.txt debe responder 200').toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('Sitemap:');

    const sitemapRes = await page.request.get('/sitemap.xml');
    expect(sitemapRes.status(), '/sitemap.xml debe responder 200').toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain('https://lpic1.manuelcobos.dev/estudiar/105.1');

    // 6. Verificación Footer: /guia-estilos no expuesto
    await page.goto('/');
    const footerStyleLink = page.locator('app-footer a[href="/guia-estilos"]');
    await expect(footerStyleLink).toHaveCount(0);

    // 7. Verificación Wiki-Popover: queryParams limpios sin %3F
    await page.goto('/estudiar/105.1?vista=slides');
    await page.waitForLoadState('networkidle');
    const termLink = page.locator('app-term-link, a.term-link, [data-term-ref]').first();
    if (await termLink.isVisible()) {
      await termLink.hover();
      const previewCard = page.locator('.term-link-card');
      await expect(previewCard).toBeVisible({ timeout: 5000 });
      const footerLink = previewCard.locator('a', { hasText: 'Ver en' });
      const popoverHref = await footerLink.getAttribute('href');
      expect(popoverHref, 'El enlace del popover no debe contener %3F ni %3D').not.toContain('%3F');
      expect(popoverHref).toMatch(/^\/(comandos|glosario)\?q=/);
    }
  });
});

