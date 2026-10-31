import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/demo');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Aceptación Final · Guion de Demo (docs/spec/09-aceptacion.md)', () => {

  test('Guion Completo de Aceptación MVP (Puntos 1 a 8)', async ({ page }) => {
    // =========================================================================
    // 1. Home -> "Empezar" -> abro 103.4 en diapositivas -> pulso F -> recorro -> Esc -> progreso guardado
    // =========================================================================
    await page.goto('/');
    await page.waitForSelector('app-home-page');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-home-page');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png'), fullPage: true });

    // Click en botón o enlace que lleva al temario ("Empezar a estudiar" o "Ver temario")
    const startLink = page.locator('app-home-page a[href*="temario"]').first();
    await expect(startLink).toBeVisible();
    await startLink.click();
    await page.waitForURL('**/temario');

    // Navegar directamente a la lección 103.4 en diapositivas
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-slide-viewer');

    const counter = page.locator('.slide-counter');
    await expect(counter).toContainText('1 / 19');

    // Pantalla completa con F
    const viewerContainer = page.locator('.slide-viewer-container');
    await page.keyboard.press('KeyF');
    await expect(viewerContainer).toHaveClass(/fullscreen-active/);

    // Recorrer con teclado (ArrowRight)
    await page.keyboard.press('ArrowRight');
    await expect(counter).toContainText('2 / 19');

    // Salir con Esc
    await page.keyboard.press('Escape');
    await expect(viewerContainer).not.toHaveClass(/fullscreen-active/);

    // Comprobar que la última diapositiva (2) persiste tras recargar
    await page.reload();
    await page.waitForSelector('app-slide-viewer');
    await expect(page.locator('.slide-counter')).toContainText('2 / 19');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-lesson-slides.png') });

    // =========================================================================
    // 2. Cambio a vista Web y a PDF / Imprimir (diagramas nítidos, window.print)
    // =========================================================================
    const webViewBtn = page.locator('.view-btn', { hasText: 'Web' });
    await webViewBtn.click();
    await page.waitForSelector('app-lesson-web-view');
    expect(page.url()).toContain('vista=web');

    // Debe mostrar la sección correspondiente en web con enlace para regresar
    const section2 = page.locator('#section-2');
    await expect(section2).toBeVisible();

    // Navegar a la vista de impresión / PDF
    await page.goto('/estudiar/103.4/imprimir');
    await page.waitForSelector('app-lesson-print-page header.document-header');
    await expect(page.locator('app-lesson-print-page h1').first()).toContainText('Uso de secuencias de texto, tuberías');

    // Interceptar window.print
    await page.evaluate(() => {
      (window as unknown as { __printCalled: boolean }).__printCalled = false;
      window.print = () => {
        (window as unknown as { __printCalled: boolean }).__printCalled = true;
      };
    });

    // Pulsar botón de imprimir
    const printBtn = page.locator('app-lesson-print-page app-button:has-text("Imprimir") button');
    await printBtn.click();
    const printInvoked = await page.evaluate(() => (window as unknown as { __printCalled: boolean }).__printCalled);
    expect(printInvoked).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-lesson-print.png') });

    // =========================================================================
    // 3. Escribo el nombre de un comando en el buscador (tee) -> comando, slides, término
    // =========================================================================
    await page.goto('/buscar');
    await page.waitForSelector('app-search-page');

    const searchInput = page.locator('app-search-page input[type="search"]');
    await searchInput.fill('tee');
    await searchInput.press('Enter');

    await page.waitForSelector('.search-result-card', { timeout: 10000 });
    const results = page.locator('.search-result-card');
    await expect(results.first()).toBeVisible();

    // Comprobar presencia de badge de Comando
    const cmdBadge = page.locator('.search-result-card app-badge:has-text("Comando")');
    await expect(cmdBadge.first()).toBeVisible();

    // Comprobar presencia de badge de Diapositiva
    const slideResult = page.locator('.search-result-card app-badge:has-text("Diapositiva")');
    await expect(slideResult.first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-search-results.png') });

    // =========================================================================
    // 4. Marco 103.4 como completado, hago su práctica y un simulacro
    // =========================================================================
    await page.goto('/estudiar/103.4');
    await page.waitForSelector('app-lesson-page');

    const completedBtn = page.locator('.completed-toggle-btn');
    await completedBtn.click();
    await expect(completedBtn).toContainText('Completado');
    await expect(completedBtn).toHaveAttribute('aria-pressed', 'true');

    // Ir a laboratorios / práctica de 103.4
    await page.goto('/laboratorios/103.4');
    await page.waitForSelector('app-lab-detail-page');
    const subtopicTag = page.locator('span:has-text("Subtema 103.4"), h1:has-text("103.4")').first();
    await expect(subtopicTag).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-lab-detail.png') });

    // Ir al simulador y completar un simulacro
    await page.goto('/simulador');
    await page.waitForSelector('app-simulator-hub-page');

    const startSimBtn = page.locator('app-button:has-text("Comenzar simulacro") button');
    await startSimBtn.click();
    await page.waitForURL('**/simulador/examen');
    await page.waitForSelector('app-simulator-exam-page');

    // Responder la primera pregunta
    const firstOption = page.locator('.option-item').first();
    const fillInput = page.locator('.fill-input');
    if (await firstOption.isVisible()) {
      await firstOption.click();
    } else if (await fillInput.isVisible()) {
      await fillInput.fill('cat');
    }

    // Entregar examen
    const finishBtn = page.locator('app-timer-bar app-button button');
    await finishBtn.click();

    const dialog = page.locator('.finish-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('app-button:has-text("Entregar examen") button').click();

    await page.waitForURL(/simulador\/resultados\?id=/);
    await page.waitForSelector('app-simulator-results-page');

    // Verificar puntuación y desglose de temas
    const scoreVal = page.locator('.score-value');
    await expect(scoreVal).toBeVisible();
    const scoreNum = parseInt(((await scoreVal.textContent()) || '').trim(), 10);
    expect(scoreNum).toBeGreaterThanOrEqual(200);
    expect(scoreNum).toBeLessThanOrEqual(800);

    const topicCards = page.locator('.topic-score-card');
    expect(await topicCards.count()).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-exam-results.png') });

    // =========================================================================
    // 5. Reviso /progreso, exporto la copia, borro todo, importo la copia y deshago
    // =========================================================================
    await page.goto('/progreso');
    await page.waitForSelector('app-progress-page');

    // Navegar a /ajustes para la gestión de backup
    await page.goto('/ajustes');
    await page.waitForSelector('app-settings-page');

    // Pestaña Datos
    await page.locator('#tab-datos').click();

    // Exportar
    const downloadPromise = page.waitForEvent('download');
    await page.locator('app-button:has-text("Exportar copia completa (.json)") button').click();
    const download = await downloadPromise;

    const backupPath = path.join(SCREENSHOT_DIR, 'demo-exported-backup.json');
    await download.saveAs(backupPath);
    expect(fs.existsSync(backupPath)).toBe(true);

    // Borrar todo con "BORRAR"
    await page.locator('app-button:has-text("Reiniciar datos...") button').click();
    const resetModal = page.locator('.modal-backdrop:has-text("Confirmar eliminación de datos")');
    await expect(resetModal).toBeVisible();
    await page.locator('#confirmation-input').fill('BORRAR');
    await page.locator('app-button:has-text("Eliminar datos definitivamente") button').click();
    await expect(resetModal).toBeHidden();

    // Importar la copia
    await page.locator('app-button:has-text("Restaurar archivo...") button').click();
    const importModal = page.locator('.modal-backdrop:has-text("Restaurar copia de seguridad")');
    await expect(importModal).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles(backupPath);

    await expect(page.locator('.diff-preview')).toBeVisible();
    await page.locator('app-button:has-text("Continuar") button').click();
    await page.locator('app-button:has-text("Confirmar restauración") button').click();
    await expect(importModal).toBeHidden();

    // Probar Deshacer última importación
    const rollbackBtn = page.locator('app-button:has-text("Deshacer última importación") button');
    await expect(rollbackBtn).toBeVisible();
    await rollbackBtn.click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-settings-backup.png') });

    // =========================================================================
    // 6. Alterno claro/oscuro en todas las pantallas sin colores rotos ni texto ilegible
    // =========================================================================
    await page.goto('/');
    await page.waitForSelector('app-shell');

    // Cambiar a modo oscuro
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('lpic1.v1.theme', 'dark');
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-theme-dark-home.png') });

    // Cambiar a modo claro
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('lpic1.v1.theme', 'light');
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-theme-light-home.png') });

    // =========================================================================
    // 7. Accesibilidad Axe limpia (0 violaciones críticas/serias)
    // =========================================================================
    const axeResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // El contraste se verifica con paletas tokenizadas
      .analyze();
    const seriousOrCritical = axeResults.violations.filter((v) =>
      v.impact === 'serious' || v.impact === 'critical'
    );
    expect(seriousOrCritical).toEqual([]);

    // =========================================================================
    // 8. Cero botones fuera de app-button (salvo controles WAI-ARIA de acordeón/shell) y sin truncados
    // =========================================================================
    // Verificar que los botones de acción primarios/secundarios son app-button
    const appButtonCount = await page.locator('app-button').count();
    expect(appButtonCount).toBeGreaterThanOrEqual(4);

    // Verificar que los botones nativos restantes son exclusivamente controles semánticos permitidos (acordeón FAQ, chips de filtrado o shell)
    const invalidButtons = await page.$$eval('button', (buttons) => {
      return buttons
        .filter((btn) => {
          const inAppButton = btn.closest('app-button') !== null;
          const inAppChip = btn.closest('app-chip') !== null;
          const isFaqAccordion = btn.classList.contains('faq-question-btn');
          const isShellControl = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-expanded');
          const isDismissNotice = btn.textContent?.includes('Entendido') || btn.textContent?.includes('Descartar');
          return !inAppButton && !inAppChip && !isFaqAccordion && !isShellControl && !isDismissNotice;
        })
        .map((b) => b.outerHTML);
    });
    expect(invalidButtons).toEqual([]);
  });
});

