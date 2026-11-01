import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-5');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 5: Lecciones y Estudiar en /estudiar/:subtema', () => {

  test('navegación con atajos de teclado (ArrowRight, ArrowLeft) y botones sin clic previo en la diapositiva (Gate 5)', async ({ page }) => {
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-slide-viewer');

    // Comprobar que arranca en la diapositiva 1
    const counter = page.locator('.slide-counter');
    await expect(counter).toContainText('1 / 19');

    // Probar avance con atajo global de teclado ArrowRight
    await page.keyboard.press('ArrowRight');
    await expect(counter).toContainText('2 / 19');

    // Probar retroceso con ArrowLeft
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toContainText('1 / 19');

    // Probar avance con el botón Siguiente
    const nextBtn = page.locator('button[aria-label="Siguiente diapositiva"]');
    await nextBtn.click();
    await expect(counter).toContainText('2 / 19');
  });

  test('pantalla completa con tecla "F" y salida con "Escape" (Gate 5)', async ({ page }) => {
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-slide-viewer');

    const container = page.locator('.slide-viewer-container');

    // Activar pantalla completa con F
    await page.keyboard.press('KeyF');
    await expect(container).toHaveClass(/fullscreen-active/);

    // Salir de pantalla completa con Escape
    await page.keyboard.press('Escape');
    await expect(container).not.toHaveClass(/fullscreen-active/);
  });

  test('deep link ?slide=5 abre directamente la diapositiva 5 (Gate 5)', async ({ page }) => {
    await page.goto('/estudiar/103.4?slide=5');
    await page.waitForSelector('app-slide-viewer');

    const counter = page.locator('.slide-counter');
    await expect(counter).toContainText('5 / 19');

    // Verificar que la URL conserva el parámetro
    expect(page.url()).toContain('slide=5');
  });

  test('marcar completado + escribir nota + reload -> ambos persisten en localStorage (Gate 5)', async ({ page }) => {
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-lesson-page');

    // 1. Limpiar almacenamiento previo para un estado limpio
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-lesson-page');

    // 2. Marcar como completado
    const completedBtn = page.locator('.completed-toggle-btn');
    await expect(completedBtn).toContainText('Marcar completado');
    await completedBtn.click();
    await expect(completedBtn).toContainText('Completado');
    await expect(completedBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Escribir una nota personal en el textarea
    const noteTextarea = page.locator('#subtopic-personal-note');
    await expect(noteTextarea).toBeVisible();
    await noteTextarea.fill('Apunte de prueba E2E: Dominar descriptores 0, 1 y 2 en Linux.');

    // 4. Esperar a que el debounce persista en localStorage
    await page.waitForTimeout(600);

    // 5. Recargar la página (reload)
    await page.reload();
    await page.waitForSelector('app-lesson-page');

    // 6. Verificar persistencia de ambos datos
    const reloadedCompletedBtn = page.locator('.completed-toggle-btn');
    await expect(reloadedCompletedBtn).toContainText('Completado');
    await expect(reloadedCompletedBtn).toHaveAttribute('aria-pressed', 'true');

    const reloadedNoteTextarea = page.locator('#subtopic-personal-note');
    await expect(reloadedNoteTextarea).toHaveValue('Apunte de prueba E2E: Dominar descriptores 0, 1 y 2 en Linux.');
  });

  test('cambiar a vista Web conserva la sección activa bidireccionalmente (Gate 5)', async ({ page }) => {
    // Entrar en diapositiva 2
    await page.goto('/estudiar/103.4?slide=2');
    await page.waitForSelector('app-slide-viewer');

    // Cambiar a vista Web mediante el selector de vistas
    const webViewBtn = page.locator('.view-btn', { hasText: 'Web' });
    await webViewBtn.click();

    await page.waitForSelector('app-lesson-web-view');
    expect(page.url()).toContain('vista=web');

    // Verificar que la sección 2 existe en el documento web
    const sec2 = page.locator('#section-2');
    await expect(sec2).toBeVisible();

    // En la sección 2, pulsar "Ver en diapositiva"
    const jumpBtn = sec2.locator('.jump-to-slide-btn');
    await jumpBtn.click();

    // Debe volver a la vista de diapositivas en la slide 2
    await page.waitForSelector('app-slide-viewer');
    const counter = page.locator('.slide-counter');
    await expect(counter).toContainText('2 / 19');
  });

  test('la vista PDF abre /estudiar/:subtema/imprimir e invoca window.print (Gate 5)', async ({ page }) => {
    // Interceptar window.print mediante init script
    await page.addInitScript(() => {
      (window as unknown as { __printCalled: boolean }).__printCalled = false;
      window.print = () => {
        (window as unknown as { __printCalled: boolean }).__printCalled = true;
      };
    });

    await page.goto('/estudiar/103.4/imprimir?autoPrint=1');
    await page.waitForSelector('app-lesson-print-page');

    // Verificar que la página de impresión cargó con el encabezado oficial y objetivos
    const headerTitle = page.locator('app-lesson-print-page header.document-header h1');
    await expect(headerTitle).toContainText('Uso de secuencias de texto, tuberías');

    // Pulsar el botón de impresión manual
    const printBtn = page.locator('app-lesson-print-page app-button button');
    await printBtn.click();

    // Comprobar que window.print fue llamado
    const printCalled = await page.evaluate(() => (window as unknown as { __printCalled: boolean }).__printCalled);
    expect(printCalled).toBe(true);
  });

  test('hay al menos 1 elemento svg[role=img] con <title> vectorial (Gate 5)', async ({ page }) => {
    // La diapositiva 2 de 103.4 tiene el diagrama oficial "streams"
    await page.goto('/estudiar/103.4?slide=2');
    await page.waitForSelector('app-diagram-view svg[role="img"]');

    const svgImg = page.locator('app-diagram-view svg[role="img"]').first();
    await expect(svgImg).toBeVisible();

    const titleEl = svgImg.locator('title');
    await expect(titleEl).toHaveCount(1);
    await expect(titleEl).toContainText('Flujos Estándar y Descriptores');
  });

  test('auditoria de accesibilidad Axe en /estudiar/103.4 sin violaciones serias o criticas (Gate 5)', async ({ page }) => {
    // 1. Modo claro
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-lesson-page');

    const lightResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    const lightViolations = lightResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(lightViolations).toHaveLength(0);

    // 2. Modo oscuro
    const themeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await themeBtn.click();
    await page.waitForSelector('html.dark');

    const darkResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    const darkViolations = darkResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(darkViolations).toHaveLength(0);
  });

  test('generacion de capturas visuales en escritorio y movil (claro y oscuro) (Gate 5)', async ({ browser }) => {
    // 1. Escritorio 1440x900 - Modo Claro (Diapositiva 2 con Diagrama SVG)
    const contextDeskLight = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskLight = await contextDeskLight.newPage();
    await pageDeskLight.goto('/estudiar/103.4?slide=2');
    await pageDeskLight.waitForSelector('app-slide-viewer');
    await pageDeskLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'study-desktop-light.png'),
      fullPage: false
    });
    await contextDeskLight.close();

    // 2. Escritorio 1440x900 - Modo Oscuro
    const contextDeskDark = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageDeskDark = await contextDeskDark.newPage();
    await pageDeskDark.goto('/estudiar/103.4?slide=2');
    await pageDeskDark.waitForSelector('app-slide-viewer');
    const themeToggle = pageDeskDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await themeToggle.click();
    await pageDeskDark.waitForSelector('html.dark');
    await pageDeskDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'study-desktop-dark.png'),
      fullPage: false
    });
    await contextDeskDark.close();

    // 3. Móvil 390x844 - Modo Claro
    const contextMobLight = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
    });
    const pageMobLight = await contextMobLight.newPage();
    await pageMobLight.goto('/estudiar/103.4?slide=2');
    await pageMobLight.waitForSelector('app-slide-viewer');
    await pageMobLight.screenshot({
      path: path.join(SCREENSHOT_DIR, 'study-mobile-light.png'),
      fullPage: false
    });
    await contextMobLight.close();

    // 4. Móvil 390x844 - Modo Oscuro
    const contextMobDark = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
    });
    const pageMobDark = await contextMobDark.newPage();
    await pageMobDark.goto('/estudiar/103.4?slide=2');
    await pageMobDark.waitForSelector('app-slide-viewer');
    const mobThemeBtn = pageMobDark.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await mobThemeBtn.click();
    await pageMobDark.waitForSelector('html.dark');
    await pageMobDark.screenshot({
      path: path.join(SCREENSHOT_DIR, 'study-mobile-dark.png'),
      fullPage: false
    });
    await contextMobDark.close();

    // 5. Página de impresión A4 - Escritorio
    const contextPrint = await browser.newContext({
      viewport: { width: 1440, height: 1100 }
    });
    const pagePrint = await contextPrint.newPage();
    await pagePrint.goto('/estudiar/103.4/imprimir');
    await pagePrint.waitForSelector('app-lesson-print-page');
    await pagePrint.screenshot({
      path: path.join(SCREENSHOT_DIR, 'study-print-desktop.png'),
      fullPage: false
    });
    await contextPrint.close();
  });
});

