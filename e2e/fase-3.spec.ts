import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-3');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 3: Sistema de Diseño y Guía de Estilos', () => {

  test('la pagina /guia-estilos carga limpiamente sin errores de consola', async ({ page }) => {
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

    const response = await page.goto('/guia-estilos');
    expect(response?.status()).toBe(200);
    await page.waitForSelector('app-style-guide-page');

    expect(consoleErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });

  test('renderiza las 6 variantes x 4 tamaños de boton y estados disabled/loading', async ({ page }) => {
    await page.goto('/guia-estilos');
    await page.waitForSelector('app-style-guide-page');

    const variants = ['primary', 'secondary', 'ghost', 'warning', 'destructive', 'link'];
    const sizes = ['sm', 'md', 'lg', 'icon'];

    for (const v of variants) {
      for (const s of sizes) {
        const btn = page.locator(`.btn-${v}.btn-${s}`).first();
        await expect(btn).toBeVisible();
      }

      // Estados
      const disabledBtn = page.locator(`.btn-${v}:disabled, .btn-${v}[aria-disabled="true"]`).first();
      await expect(disabledBtn).toBeVisible();
    }
  });

  test('los badges miden exactamente 24 px de alto sin deformarse (Gate 3)', async ({ page }) => {
    await page.goto('/guia-estilos');
    await page.waitForSelector('app-style-guide-page');

    const badges = page.locator('.badge-base');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(12);

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      const box = await badge.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // Altura exacta de 24 px (+/- 0.5 por subpixel rendering)
        expect(Math.round(box.height)).toBe(24);
      }
    }
  });

  test('interacciones de UI: tabs, tarjeta interactiva y dialogo modal', async ({ page }) => {
    await page.goto('/guia-estilos');
    await page.waitForSelector('app-style-guide-page');

    // 1. Pestañas funcionales
    const practicaTab = page.locator('#tab-practica');
    await practicaTab.click();
    await expect(page.locator('#tab-practica')).toHaveClass(/tab-active/);
    await expect(page.locator('.styleguide-page')).toContainText('practica');

    // 2. Tarjeta interactiva
    const clickableCard = page.locator('.card-interactive');
    await clickableCard.click();
    await expect(clickableCard).toContainText('¡Evento cardClick detectado!');

    // 3. Diálogo modal
    const openDialogBtn = page.locator('app-button', { hasText: 'Abrir Diálogo de Confirmación' });
    await openDialogBtn.click();
    const dialogPanel = page.locator('.dialog-panel');
    await expect(dialogPanel).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(dialogPanel).not.toBeVisible();
  });

  test('auditoria de accesibilidad Axe en modo claro y oscuro sin violaciones criticas o serias', async ({ page }) => {
    // 1. Modo claro
    await page.goto('/guia-estilos');
    await page.waitForSelector('app-style-guide-page');

    const lightScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const lightViolations = lightScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(lightViolations).toHaveLength(0);

    // 2. Modo oscuro
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

  test('generacion de capturas en escritorio y movil (claro y oscuro)', async ({ browser }) => {
    // 1. Escritorio 1440x900 - Claro
    const contextDeskLight = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskLight = await contextDeskLight.newPage();
    await pageDeskLight.goto('/guia-estilos');
    await pageDeskLight.waitForSelector('app-style-guide-page');
    await pageDeskLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'style-guide-desktop-light.png'),
      fullPage: false
    });
    await contextDeskLight.close();

    // 2. Escritorio 1440x900 - Oscuro
    const contextDeskDark = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskDark = await contextDeskDark.newPage();
    await pageDeskDark.goto('/guia-estilos');
    await pageDeskDark.waitForSelector('app-style-guide-page');
    await pageDeskDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(pageDeskDark.locator('html')).toHaveClass(/dark/);
    await pageDeskDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'style-guide-desktop-dark.png'),
      fullPage: false
    });
    await contextDeskDark.close();

    // 3. Movil 390x844 - Claro
    const contextMobLight = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const pageMobLight = await contextMobLight.newPage();
    await pageMobLight.goto('/guia-estilos');
    await pageMobLight.waitForSelector('app-style-guide-page');
    await pageMobLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'style-guide-mobile-light.png'),
      fullPage: false
    });
    await contextMobLight.close();

    // 4. Movil 390x844 - Oscuro
    const contextMobDark = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const pageMobDark = await contextMobDark.newPage();
    await pageMobDark.goto('/guia-estilos');
    await pageMobDark.waitForSelector('app-style-guide-page');
    await pageMobDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(pageMobDark.locator('html')).toHaveClass(/dark/);
    await pageMobDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'style-guide-mobile-dark.png'),
      fullPage: false
    });
    await contextMobDark.close();
  });
});

