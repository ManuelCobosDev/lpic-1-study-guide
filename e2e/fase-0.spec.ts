import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-0');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 0: Shell, Persistencia, Accesibilidad y Rutas Stub', () => {

  test('la shell carga sin errores de consola ni de pagina', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForSelector('app-shell');

    expect(consoleErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });

  test('el tema oscuro persiste tras reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-shell');

    // Cambiar a tema oscuro con el boton toggle
    const toggleButton = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleButton.click();

    // Verificar que la etiqueta html tiene la clase dark y atributo data-theme="dark"
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Recargar la pagina
    await page.reload();
    await page.waitForSelector('app-shell');

    // Verificar que persiste tras reload
    await expect(html).toHaveClass(/dark/);
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('auditoria de accesibilidad con axe sin violaciones serias o criticas', async ({ page }) => {
    // Modo claro
    await page.goto('/');
    await page.waitForSelector('app-shell');
    const lightScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const lightViolations = lightScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(lightViolations).toHaveLength(0);

    // Modo oscuro
    const toggleButton = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const darkScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const darkViolations = darkScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(darkViolations).toHaveLength(0);
  });

  test('todas las rutas responden con su stub etiquetado o pagina real y ninguna da 404', async ({ page }) => {
    const testRoutes = [
      '/',
      '/temario',
      '/temario/101',
      '/temario/101/101',
      '/estudiar/101.1',
      '/estudiar/101.1/imprimir',
      '/laboratorios',
      '/laboratorios/101.1',
      '/simulador',
      '/simulador/examen',
      '/simulador/practica',
      '/simulador/resultados',
      '/comandos',
      '/glosario',
      '/flashcards',
      '/mapa-mental',
      '/buscar',
      '/progreso',
      '/erratas',
      '/ajustes',
      '/acerca-de'
    ];

    const implementedRoutes = [
      '/',
      '/temario',
      '/temario/101',
      '/temario/101/101',
      '/estudiar/101.1',
      '/estudiar/101.1/imprimir',
      '/buscar',
      '/laboratorios'
    ];

    for (const r of testRoutes) {
      const response = await page.goto(r);
      expect(response?.status()).toBe(200);

      if (!implementedRoutes.includes(r)) {
        const titleEl = page.locator('#page-title');
        await expect(titleEl).toBeVisible();

        const stubBadge = page.locator('app-not-implemented-page');
        await expect(stubBadge).toBeVisible();
      } else {
        await expect(page.locator('app-shell')).toBeVisible();
        await expect(page.locator('app-not-implemented-page')).toHaveCount(0);
      }
    }
  });

  test('generacion de capturas visuales en escritorio y movil (claro y oscuro)', async ({ browser }) => {
    // 1. Escritorio 1440x900 - Claro
    const contextDesktopLight = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskLight = await contextDesktopLight.newPage();
    await pageDeskLight.goto('/');
    await pageDeskLight.waitForSelector('app-shell');
    await pageDeskLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'shell-desktop-light.png'),
      fullPage: false
    });
    await contextDesktopLight.close();

    // 2. Escritorio 1440x900 - Oscuro
    const contextDesktopDark = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskDark = await contextDesktopDark.newPage();
    await pageDeskDark.goto('/');
    await pageDeskDark.waitForSelector('app-shell');
    await pageDeskDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(pageDeskDark.locator('html')).toHaveClass(/dark/);
    await pageDeskDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'shell-desktop-dark.png'),
      fullPage: false
    });
    await contextDesktopDark.close();

    // 3. Movil 390x844 - Claro
    const contextMobileLight = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const pageMobLight = await contextMobileLight.newPage();
    await pageMobLight.goto('/');
    await pageMobLight.waitForSelector('app-shell');
    await pageMobLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'shell-mobile-light.png'),
      fullPage: false
    });
    await contextMobileLight.close();

    // 4. Movil 390x844 - Oscuro
    const contextMobileDark = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const pageMobDark = await contextMobileDark.newPage();
    await pageMobDark.goto('/');
    await pageMobDark.waitForSelector('app-shell');
    await pageMobDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(pageMobDark.locator('html')).toHaveClass(/dark/);
    await pageMobDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'shell-mobile-dark.png'),
      fullPage: false
    });
    await contextMobileDark.close();
  });
});

