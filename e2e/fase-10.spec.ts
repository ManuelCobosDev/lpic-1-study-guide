import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-10');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 10: Herramientas complementarias, Ajustes, Backup, Progreso, Mapa Mental, Erratas, Acerca de y 404', () => {

  test('Ciclo completo de Backup: exportar JSON, reset seguro con "BORRAR", importación con checksum y rollback (Gate 10)', async ({ page }) => {
    // 1. Sembrar progreso previo en localStorage con el prefijo oficial lpic1.v1.
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('lpic1.v1.progress', JSON.stringify({
        schemaVersion: 1,
        completedSubtopics: { '101.1': '2026-10-31T10:00:00.000Z' },
        viewedSlides: { '101.1': [1, 2, 3] },
        lastSlide: { '101.1': 3 },
        checkpoints: {},
        completedLabs: {}
      }));
    });

    // 2. Navegar a /ajustes y seleccionar pestaña Datos y Backup
    await page.goto('/ajustes');
    await page.waitForSelector('app-settings-page');

    const dataTab = page.locator('#tab-datos');
    await dataTab.click();
    await expect(page.locator('.box-title:has-text("Exportar copia de seguridad")')).toBeVisible();

    // 3. Exportar backup JSON y capturar la descarga
    const downloadPromise = page.waitForEvent('download');
    const exportBtn = page.locator('app-button:has-text("Exportar copia completa (.json)") button');
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^lpic1-backup-\d{4}-\d{2}-\d{2}\.json$/);

    const tempBackupPath = path.join(SCREENSHOT_DIR, 'test-exported-backup.json');
    await download.saveAs(tempBackupPath);
    const backupContent = fs.readFileSync(tempBackupPath, 'utf-8');
    const parsedBackup = JSON.parse(backupContent);

    expect(parsedBackup.schemaVersion).toBe(1);
    expect(parsedBackup.checksum).toBeTruthy();
    expect(parsedBackup.data.progress.completedSubtopics['101.1']).toBeTruthy();

    // 4. Diálogo de reinicio seguro: exige "BORRAR" en mayúsculas
    const openResetBtn = page.locator('app-button:has-text("Reiniciar datos...") button');
    await openResetBtn.click();

    const resetModal = page.locator('.modal-backdrop:has-text("Confirmar eliminación de datos")');
    await expect(resetModal).toBeVisible();

    const confirmInput = page.locator('#confirmation-input');
    const confirmResetBtn = page.locator('app-button:has-text("Eliminar datos definitivamente") button');

    // Comprobar que en minúsculas sigue deshabilitado
    await confirmInput.fill('borrar');
    await expect(confirmResetBtn).toBeDisabled();

    // Comprobar que en mayúsculas exactas se habilita
    await confirmInput.fill('BORRAR');
    await expect(confirmResetBtn).toBeEnabled();

    // Ejecutar reinicio
    await confirmResetBtn.click();
    await expect(resetModal).toBeHidden();

    // Verificar que el progreso quedó limpio en localStorage
    const clearedProgress = await page.evaluate(() => {
      const p = localStorage.getItem('lpic1.v1.progress');
      return p ? JSON.parse(p) : null;
    });
    expect(clearedProgress?.completedSubtopics['101.1']).toBeUndefined();

    // 5. Asistente de importación modal con archivo exportado
    const openImportBtn = page.locator('app-button:has-text("Restaurar archivo...") button');
    await openImportBtn.click();

    const importModal = page.locator('.modal-backdrop:has-text("Restaurar copia de seguridad")');
    await expect(importModal).toBeVisible();

    // Cargar archivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempBackupPath);

    // Debe pasar a la pantalla de previsualización (Paso 2)
    await expect(page.locator('.diff-preview')).toBeVisible();

    // Continuar a selección de modo
    const continueBtn = page.locator('app-button:has-text("Continuar") button');
    await continueBtn.click();

    // Confirmar restauración
    const applyImportBtn = page.locator('app-button:has-text("Confirmar restauración") button');
    await applyImportBtn.click();
    await expect(importModal).toBeHidden();

    // Verificar que el progreso se restauró
    const restoredProgress = await page.evaluate(() => {
      const p = localStorage.getItem('lpic1.v1.progress');
      return p ? JSON.parse(p) : null;
    });
    expect(restoredProgress?.completedSubtopics['101.1']).toBeTruthy();

    // 6. Probar botón de Rollback (deshacer última importación)
    const rollbackBtn = page.locator('app-button:has-text("Deshacer última importación") button');
    await expect(rollbackBtn).toBeVisible();
    await rollbackBtn.click();

    // Verificar que volvió al estado previo a la importación (limpio)
    const rolledBackProgress = await page.evaluate(() => {
      const p = localStorage.getItem('lpic1.v1.progress');
      return p ? JSON.parse(p) : null;
    });
    expect(rolledBackProgress?.completedSubtopics['101.1']).toBeUndefined();

    // 7. Probar rechazo de archivo con checksum adulterado
    const tamperedBackup = {
      ...parsedBackup,
      data: {
        ...parsedBackup.data,
        progress: {
          ...parsedBackup.data.progress,
          completedSubtopics: { '102.1': '2026-10-31T00:00:00Z' } // Modificado sin actualizar checksum
        }
      }
    };
    const tamperedPath = path.join(SCREENSHOT_DIR, 'tampered-backup.json');
    fs.writeFileSync(tamperedPath, JSON.stringify(tamperedBackup), 'utf-8');

    await openImportBtn.click();
    await fileInput.setInputFiles(tamperedPath);

    // Debe mostrar error de validación de checksum
    const errorAlert = page.locator('.import-error-banner');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/checksum/i);

    // Cerrar modal
    await page.locator('.modal-header .close-btn').click();

    // Limpieza de archivos temporales generados durante el test
    try {
      if (fs.existsSync(tempBackupPath)) fs.unlinkSync(tempBackupPath);
      if (fs.existsSync(tamperedPath)) fs.unlinkSync(tamperedPath);
    } catch {
      // Ignorar error de limpieza
    }
  });

  test('Pantalla de Progreso: StatCards, Heatmap interactivo, ScoreChart y desglose por tema (Gate 10)', async ({ page }) => {
    // Sembrar actividad previa con prefijo lpic1.v1.
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('lpic1.v1.progress', JSON.stringify({
        schemaVersion: 1,
        completedSubtopics: {
          '101.1': '2026-10-31T10:00:00.000Z',
          '103.4': '2026-10-30T10:00:00.000Z'
        },
        viewedSlides: {},
        lastSlide: {},
        checkpoints: {},
        completedLabs: {}
      }));

      localStorage.setItem('lpic1.v1.exam_history', JSON.stringify({
        schemaVersion: 1,
        attempts: [
          {
            id: 'att-test-1',
            mode: 'exam',
            startedAt: '2026-10-28T10:00:00.000Z',
            finishedAt: '2026-10-28T11:00:00.000Z',
            durationSeconds: 5400,
            timeRemainingSeconds: 1800,
            seed: 1234,
            questionIds: ['q1', 'q2'],
            answers: {},
            score: 540,
            passed: true
          }
        ]
      }));
    });

    await page.goto('/progreso');
    await page.waitForSelector('app-progress-page');

    // 1. Comprobar 4 StatCards
    const statLessons = page.locator('[data-testid="stat-lessons"]');
    const statExams = page.locator('[data-testid="stat-exams"]');
    const statFlashcards = page.locator('[data-testid="stat-flashcards"]');
    const statStreak = page.locator('[data-testid="stat-streak"]');

    await expect(statLessons).toBeVisible();
    await expect(statExams).toBeVisible();
    await expect(statFlashcards).toBeVisible();
    await expect(statStreak).toBeVisible();

    await expect(statLessons.locator('.stat-main-number')).toContainText('2');
    await expect(statExams.locator('.stat-main-number')).toContainText('1');

    // 2. Comprobar siguiente paso recomendado
    const nextStepBtn = page.locator('[data-testid="next-step-btn"]');
    await expect(nextStepBtn).toBeVisible();

    // 3. Comprobar Heatmap
    const heatmap = page.locator('app-activity-heatmap .heatmap-container');
    await expect(heatmap).toBeVisible();
    const cells = heatmap.locator('.day-cell');
    expect(await cells.count()).toBeGreaterThan(50);

    // 4. Comprobar ScoreChart SVG
    const scoreChart = page.locator('app-score-chart svg');
    await expect(scoreChart).toBeVisible();
    const passingLine = scoreChart.locator('.passing-line');
    await expect(passingLine).toBeAttached();
    await expect(scoreChart.locator('.passing-badge')).toBeVisible();
    const dots = scoreChart.locator('.chart-dot');
    await expect(dots).toHaveCount(1);

    // 5. Comprobar tabla de progreso por tema
    const tableRows = page.locator('.progress-table tbody tr');
    await expect(tableRows).toHaveCount(10);
  });

  test('Pantalla de Mapa Mental: lienzo SVG con D3, controles de zoom, filtro pendientes y panel lateral (Gate 10)', async ({ page }) => {
    // Sembrar subtema completado
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('lpic1.v1.progress', JSON.stringify({
        schemaVersion: 1,
        completedSubtopics: { '101.1': '2026-10-31T10:00:00.000Z' },
        viewedSlides: {},
        lastSlide: {},
        checkpoints: {},
        completedLabs: {}
      }));
    });

    await page.goto('/mapa-mental');
    await page.waitForSelector('app-mind-map-page');

    // 1. Lienzo SVG presente
    const svgCanvas = page.locator('.mind-map-svg');
    await expect(svgCanvas).toBeVisible();

    // 2. Comprobar nodos renderizados
    const nodes = page.locator('.tree-node');
    expect(await nodes.count()).toBeGreaterThan(20);

    // 3. Controles de Zoom
    const zoomInBtn = page.locator('[data-testid="zoom-in"]');
    const zoomOutBtn = page.locator('[data-testid="zoom-out"]');
    const zoomFitBtn = page.locator('[data-testid="zoom-fit"]');

    await zoomInBtn.click();
    await zoomOutBtn.click();
    await zoomFitBtn.click();

    // 4. Filtro solo pendientes
    const togglePendingBtn = page.locator('[data-testid="toggle-only-pending"]');
    await togglePendingBtn.click();
    await expect(togglePendingBtn).toHaveAttribute('aria-pressed', 'true');

    // El nodo 101.1 completado debe tener la clase .is-dimmed
    const completedNode = page.locator('.tree-node.completed');
    await expect(completedNode.first()).toHaveClass(/is-dimmed/);

    // Desactivar filtro
    await togglePendingBtn.click();

    // 5. Panel lateral (drawer) de detalle al hacer clic en un nodo
    const firstSubtopicNode = page.locator('.tree-node:has-text("101.1")');
    await firstSubtopicNode.click();

    const drawer = page.locator('[data-testid="node-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('.drawer-title')).toContainText('hardware');
    await expect(drawer.locator('[data-testid="drawer-action-btn"]')).toBeVisible();

    // Cerrar con botón X
    const closeDrawerBtn = page.locator('[data-testid="close-drawer-btn"]');
    await closeDrawerBtn.click();
    await expect(drawer).toBeHidden();
  });

  test('Pantallas complementarias: Erratas, Acerca de y gestión 404 (Gate 10)', async ({ page }) => {
    // 1. /erratas
    await page.goto('/erratas');
    await page.waitForSelector('app-errata-page');
    await expect(page.locator('.page-title')).toContainText('Fe de Erratas');
    await expect(page.locator('[data-testid="report-errata-btn"]')).toHaveAttribute('href', /github\.com/);
    const errataCards = page.locator('.errata-card');
    await expect(errataCards.first()).toBeVisible();
    expect(await errataCards.count()).toBeGreaterThan(0);

    // 2. /acerca-de
    await page.goto('/acerca-de');
    await page.waitForSelector('app-about-page');
    await expect(page.locator('.page-title')).toContainText('Acerca de LPIC-1 Aula');
    const disclaimer = page.locator('.disclaimer-banner');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('no está patrocinado, avalado ni afiliado oficialmente a Linux Professional Institute');

    // 3. 404 en ruta inexistente
    await page.goto('/ruta-completamente-inventada-404');
    await page.waitForSelector('app-not-found-page');
    await expect(page.locator('.error-code')).toContainText('404');
    await expect(page.locator('.error-title')).toContainText('Página no encontrada');
    await expect(page.locator('.terminal-box')).toContainText('HTTP/2 404 Not Found');

    // Botón de rescate hacia Home
    const homeBtn = page.locator('[data-testid="btn-404-home"]');
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('Auditoría de Accesibilidad Axe en Ajustes, Progreso y Mapa Mental (claro y oscuro)', async ({ page }) => {
    // 1. Ajustes en modo claro
    await page.goto('/ajustes');
    await page.waitForSelector('app-settings-page');
    let results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    let criticalViolations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations).toHaveLength(0);

    // 2. Progreso en modo claro
    await page.goto('/progreso');
    await page.waitForSelector('app-progress-page');
    results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    criticalViolations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations).toHaveLength(0);

    // 3. Mapa Mental en modo oscuro
    await page.goto('/mapa-mental');
    await page.waitForSelector('app-mind-map-page');

    const toggleThemeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleThemeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    criticalViolations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations).toHaveLength(0);
  });

  test('Generación de capturas visuales en escritorio y móvil (claro y oscuro)', async ({ browser }) => {
    // 1. Escritorio 1440x900 - Ajustes Claro
    const contextDesk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDesk = await contextDesk.newPage();

    await pageDesk.goto('/ajustes');
    await pageDesk.waitForSelector('app-settings-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-desktop-light.png') });

    // 2. Escritorio - Progreso Claro
    await pageDesk.goto('/progreso');
    await pageDesk.waitForSelector('app-progress-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'progress-desktop-light.png') });

    // 3. Escritorio - Mapa Mental Claro
    await pageDesk.goto('/mapa-mental');
    await pageDesk.waitForSelector('app-mind-map-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'mind-map-desktop-light.png') });

    // 4. Escritorio - Erratas Claro
    await pageDesk.goto('/erratas');
    await pageDesk.waitForSelector('app-errata-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'errata-desktop-light.png') });

    // 5. Escritorio - Acerca de Claro
    await pageDesk.goto('/acerca-de');
    await pageDesk.waitForSelector('app-about-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-desktop-light.png') });

    // 6. Escritorio - 404 Claro
    await pageDesk.goto('/ruta-404-ejemplo');
    await pageDesk.waitForSelector('app-not-found-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'not-found-desktop-light.png') });

    // 7. Escritorio - Ajustes Oscuro
    await pageDesk.goto('/ajustes');
    await pageDesk.waitForSelector('app-settings-page');
    const toggleBtn = pageDesk.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleBtn.click();
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-desktop-dark.png') });

    // 8. Escritorio - Progreso Oscuro
    await pageDesk.goto('/progreso');
    await pageDesk.waitForSelector('app-progress-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'progress-desktop-dark.png') });

    // 9. Escritorio - Mapa Mental Oscuro
    await pageDesk.goto('/mapa-mental');
    await pageDesk.waitForSelector('app-mind-map-page');
    await pageDesk.screenshot({ path: path.join(SCREENSHOT_DIR, 'mind-map-desktop-dark.png') });

    await contextDesk.close();

    // 10. Móvil 390x844 - Progreso Claro
    const contextMobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageMobile = await contextMobile.newPage();

    await pageMobile.goto('/progreso');
    await pageMobile.waitForSelector('app-progress-page');
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, 'progress-mobile-light.png') });

    // 11. Móvil 390x844 - Ajustes Claro
    await pageMobile.goto('/ajustes');
    await pageMobile.waitForSelector('app-settings-page');
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-mobile-light.png') });

    await contextMobile.close();
  });
});

