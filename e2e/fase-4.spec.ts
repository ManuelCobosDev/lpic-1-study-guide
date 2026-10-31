import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-4');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 4: Home y Temario Oficial LPIC-1', () => {

  test('con progreso vacio ningún subtema muestra check y la Home dice "0 %" (Gate 4)', async ({ page }) => {
    // 1. Limpiar almacenamiento para simular usuario nuevo
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-home-page');

    // 2. Comprobar que en la Home el progreso del Examen 101 muestra 0%
    const progressRing = page.locator('app-home-page app-progress-ring');
    await expect(progressRing).toBeVisible();
    await expect(progressRing).toContainText('0%');

    const ctaBtn = page.locator('app-home-page .hero-cta-group app-button').first();
    await expect(ctaBtn).toContainText('Empezar por el Tema 101');

    // 3. Comprobar que en el temario general ningún subtema muestra check verde
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');
    const checkIcons = page.locator('.subtopics-list .check-icon');
    await expect(checkIcons).toHaveCount(0);

    // 4. Comprobar que en el detalle de un tema ningún subtema muestra check verde
    await page.goto('/temario/101/101');
    await page.waitForSelector('app-topic-detail-page');
    const topicChecks = page.locator('.completed-check');
    await expect(topicChecks).toHaveCount(0);
  });

  test('las 4 tarjetas del 101 en el temario tienen exactamente la misma altura (grid stretch) (Gate 4)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');

    // Seleccionar las 4 tarjetas del examen 101
    const cards = page.locator('.topics-grid-101 app-curriculum-card .curriculum-card');
    await expect(cards).toHaveCount(4);

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();
    const box3 = await cards.nth(3).boundingBox();

    expect(box0).not.toBeNull();
    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    expect(box3).not.toBeNull();

    if (box0 && box1 && box2 && box3) {
      // Comparar altura redondeada (margen de 2px por renderizado subpixel)
      const h0 = Math.round(box0.height);
      const h1 = Math.round(box1.height);
      const h2 = Math.round(box2.height);
      const h3 = Math.round(box3.height);

      expect(Math.abs(h0 - h1)).toBeLessThanOrEqual(2);
      expect(Math.abs(h1 - h2)).toBeLessThanOrEqual(2);
      expect(Math.abs(h2 - h3)).toBeLessThanOrEqual(2);
    }
  });

  test('ningún título de subtema truncado con puntos suspensivos en la UI (Gate 4)', async ({ page }) => {
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');

    const titles1 = await page.locator('.subtopic-title').allTextContents();
    for (const title of titles1) {
      expect(title).not.toMatch(/\.\.\.$/);
      expect(title).not.toContain('…');
    }

    await page.goto('/temario/101/101');
    await page.waitForSelector('app-topic-detail-page');

    const titles2 = await page.locator('.subtopic-card-title').allTextContents();
    for (const title of titles2) {
      expect(title).not.toMatch(/\.\.\.$/);
      expect(title).not.toContain('…');
    }
  });

  test('flujo interactivo Home -> Temario -> Tema -> Subtema funciona (Gate 4)', async ({ page }) => {
    // 1. Desde Home
    await page.goto('/');
    await page.waitForSelector('app-home-page');

    // Clic en ver temario del examen 101
    const exam101Btn = page.locator('.exam-card-inner a:has-text("Ver temario")');
    await exam101Btn.click();
    await expect(page).toHaveURL(/\/temario\/101/);
    await page.waitForSelector('app-exam-page');

    // 2. Desde Examen 101 al Tema 101
    const topic101Link = page.locator('.topic-title a').first();
    await topic101Link.click();
    await expect(page).toHaveURL(/\/temario\/101\/101/);
    await page.waitForSelector('app-topic-detail-page');

    // 3. Desde Detalle del Tema al primer subtema
    const subtopicLink = page.locator('.subtopic-card a.subtopic-title-link').first();
    await subtopicLink.click();
    await expect(page).toHaveURL(/\/estudiar\/101\.1/);
  });

  test('los 23 subtemas del 101 y los 19 del 102 existen y enlazan correctamente (Gate 4)', async ({ page }) => {
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');

    // Pestaña 101: 23 subtemas
    const subtopics101 = page.locator('.topics-grid-101 .subtopic-row');
    await expect(subtopics101).toHaveCount(23);

    // Cambiar a pestaña 102: 19 subtemas
    const tab102 = page.locator('app-tabs button:has-text("Examen 102")');
    await tab102.click();

    const subtopics102 = page.locator('.topics-grid-102 .subtopic-row');
    await expect(subtopics102).toHaveCount(19);
  });

  test('cifras de la Home = cálculo dinámico desde el manifiesto (R6: Gate 4)', async ({ page }) => {
    // Cargar manifiesto para contrastar cifras reales
    const manifestResponse = await page.request.get('/content/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();

    const expectedTotalSlides = manifest.stats.totalSlidesReal + manifest.stats.totalSlidesPlaceholder;
    const expectedSubtopics = manifest.stats.totalSubtopics;
    const expectedCommands = manifest.stats.totalCommands;
    const expectedTerms = manifest.stats.totalTerms;

    await page.goto('/');
    await page.waitForSelector('app-home-page');

    const metricNumbers = await page.locator('.metrics-section .metric-number').allInnerTexts();
    expect(metricNumbers).toContain(String(expectedTotalSlides));
    expect(metricNumbers).toContain(String(expectedSubtopics));
    expect(metricNumbers).toContain(String(expectedCommands));
    expect(metricNumbers).toContain(String(expectedTerms));
  });

  test('el árbol lateral marca el subtema actual (Gate 4)', async ({ page }) => {
    await page.goto('/temario/101/101');
    await page.waitForSelector('app-topic-detail-page');

    const tree = page.locator('.sidebar-tree-wrapper app-curriculum-tree-sidebar');
    await expect(tree).toBeVisible();

    const activeLink = tree.locator('.subtopic-link.subtopic-active');
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toContainText('101.1');
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  test('auditoria de accesibilidad Axe en Home y Temario (claro y oscuro)', async ({ page }) => {
    // 1. Home en modo claro
    await page.goto('/');
    await page.waitForSelector('app-home-page');
    let scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    let violations = scan.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(violations).toHaveLength(0);

    // 2. Home en modo oscuro
    await page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    violations = scan.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(violations).toHaveLength(0);

    // 3. Temario en modo claro
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');
    // Volver a modo claro
    await page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    violations = scan.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(violations).toHaveLength(0);

    // 4. Temario en modo oscuro
    await page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    violations = scan.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(violations).toHaveLength(0);
  });

  test('generacion de capturas de pantalla de la Fase 4 para revision visual (R5)', async ({ browser }) => {
    // 1. Home - Escritorio 1440 - Claro
    const deskLightCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskLightPage = await deskLightCtx.newPage();
    await deskLightPage.goto('/');
    await deskLightPage.waitForSelector('app-home-page');
    await deskLightPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-desktop-light.png'), fullPage: false });
    await deskLightCtx.close();

    // 2. Home - Escritorio 1440 - Oscuro
    const deskDarkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskDarkPage = await deskDarkCtx.newPage();
    await deskDarkPage.goto('/');
    await deskDarkPage.waitForSelector('app-home-page');
    await deskDarkPage.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(deskDarkPage.locator('html')).toHaveClass(/dark/);
    await deskDarkPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-desktop-dark.png'), fullPage: false });
    await deskDarkCtx.close();

    // 3. Home - Móvil 390 - Claro
    const mobLightCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const mobLightPage = await mobLightCtx.newPage();
    await mobLightPage.goto('/');
    await mobLightPage.waitForSelector('app-home-page');
    await mobLightPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-mobile-light.png'), fullPage: false });
    await mobLightCtx.close();

    // 4. Home - Móvil 390 - Oscuro
    const mobDarkCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const mobDarkPage = await mobDarkCtx.newPage();
    await mobDarkPage.goto('/');
    await mobDarkPage.waitForSelector('app-home-page');
    await mobDarkPage.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(mobDarkPage.locator('html')).toHaveClass(/dark/);
    await mobDarkPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-mobile-dark.png'), fullPage: false });
    await mobDarkCtx.close();

    // 5. Temario - Escritorio 1440 - Claro
    const currDeskLightCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const currDeskLightPage = await currDeskLightCtx.newPage();
    await currDeskLightPage.goto('/temario');
    await currDeskLightPage.waitForSelector('app-curriculum-page');
    await currDeskLightPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'curriculum-desktop-light.png'), fullPage: false });
    await currDeskLightCtx.close();

    // 6. Temario - Escritorio 1440 - Oscuro
    const currDeskDarkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const currDeskDarkPage = await currDeskDarkCtx.newPage();
    await currDeskDarkPage.goto('/temario');
    await currDeskDarkPage.waitForSelector('app-curriculum-page');
    await currDeskDarkPage.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(currDeskDarkPage.locator('html')).toHaveClass(/dark/);
    await currDeskDarkPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'curriculum-desktop-dark.png'), fullPage: false });
    await currDeskDarkCtx.close();

    // 7. Detalle Tema - Escritorio 1440 - Claro
    const topicDeskLightCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const topicDeskLightPage = await topicDeskLightCtx.newPage();
    await topicDeskLightPage.goto('/temario/101/101');
    await topicDeskLightPage.waitForSelector('app-topic-detail-page');
    await topicDeskLightPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'topic-detail-desktop-light.png'), fullPage: false });
    await topicDeskLightCtx.close();

    // 8. Detalle Tema - Escritorio 1440 - Oscuro
    const topicDeskDarkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const topicDeskDarkPage = await topicDeskDarkCtx.newPage();
    await topicDeskDarkPage.goto('/temario/101/101');
    await topicDeskDarkPage.waitForSelector('app-topic-detail-page');
    await topicDeskDarkPage.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]').click();
    await expect(topicDeskDarkPage.locator('html')).toHaveClass(/dark/);
    await topicDeskDarkPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'topic-detail-desktop-dark.png'), fullPage: false });
    await topicDeskDarkCtx.close();
  });
});

