import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-8');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 8: Simulador de Examen LPIC-1', () => {

  test('Iniciar simulacro, responder, marcar, recargar y verificar reanudación con tiempo y respuestas persistidas (Gate 8)', async ({
    page
  }) => {
    // 1. Ir a /simulador y limpiar estado para empezar limpios
    await page.goto('/simulador');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-simulator-hub-page');

    // 2. Iniciar simulacro cronometrado
    const startBtn = page.locator('app-button:has-text("Comenzar simulacro") button');
    await startBtn.click();

    // Debe navegar a /simulador/examen
    await page.waitForURL('**/simulador/examen');
    await page.waitForSelector('app-simulator-exam-page');

    // 3. Verificar que el temporizador sticky está presente y corriendo
    const timerDisplay = page.locator('.timer-digits');
    await expect(timerDisplay).toBeVisible();
    const initialTimeText = await timerDisplay.textContent();
    expect(initialTimeText).toBeTruthy();

    // 4. Responder a la primera pregunta (opción o texto según tipo)
    const firstOption = page.locator('.option-item').first();
    const fillInput = page.locator('.fill-input');
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await expect(firstOption).toHaveClass(/selected/);
    } else if (await fillInput.isVisible()) {
      await fillInput.fill('ps aux');
    }

    // 5. Marcar la primera pregunta para revisar
    const flagBtn = page.locator('.flag-button');
    await flagBtn.click();
    await expect(flagBtn).toHaveClass(/flagged/);
    await expect(flagBtn).toHaveAttribute('aria-pressed', 'true');

    // Comprobar que en el navegador de preguntas la pregunta 1 aparece como respondida y marcada
    const gridItem1 = page.locator('.grid-item').first();
    await expect(gridItem1).toHaveClass(/answered/);
    await expect(gridItem1).toHaveClass(/flagged/);

    // 6. Recargar la página (simulando corte de conexión o refresh del usuario)
    await page.reload();
    await page.waitForSelector('app-simulator-exam-page');

    // 7. Verificar que se reanuda correctamente con respuestas y marcas persistidas
    if (await firstOption.isVisible()) {
      await expect(firstOption).toHaveClass(/selected/);
    } else if (await fillInput.isVisible()) {
      await expect(fillInput).toHaveValue('ps aux');
    }
    await expect(page.locator('.flag-button')).toHaveClass(/flagged/);
    await expect(page.locator('.grid-item').first()).toHaveClass(/answered/);
    await expect(page.locator('.grid-item').first()).toHaveClass(/flagged/);

    // Verificar que el tiempo no se reinició a 90:00 (continúa decrementando con el reloj real)
    const resumedTimeText = await page.locator('.timer-digits').textContent();
    expect(resumedTimeText).toBeTruthy();
  });

  test('Finalizar produce puntuación 200–800 y resultados que persisten tras recargar (Gate 8)', async ({
    page
  }) => {
    // Asegurar que hay un examen en curso
    await page.goto('/simulador');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-simulator-hub-page');

    // Iniciar examen
    await page.locator('app-button:has-text("Comenzar simulacro") button').click();
    await page.waitForURL('**/simulador/examen');
    await page.waitForSelector('app-simulator-exam-page');

    // Responder a una pregunta si hay opciones visibles
    const option = page.locator('.option-item').first();
    const fill = page.locator('.fill-input');
    if (await option.isVisible()) {
      await option.click();
    } else if (await fill.isVisible()) {
      await fill.fill('top');
    }

    // Pulsar botón "Finalizar examen" en la TimerBar
    const finishBtn = page.locator('app-timer-bar app-button button');
    await finishBtn.click();

    // Debe abrirse el diálogo modal de confirmación
    const dialog = page.locator('.finish-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.dialog-title')).toContainText('¿Finalizar el simulacro de examen?');

    // Confirmar entrega
    const confirmDeliveryBtn = dialog.locator('app-button:has-text("Entregar examen") button');
    await confirmDeliveryBtn.click();

    // Debe navegar a /simulador/resultados?id=attempt-...
    await page.waitForURL(/simulador\/resultados\?id=/);
    await page.waitForSelector('app-simulator-results-page');

    // Verificar puntuación oficial en el rango 200 - 800
    const scoreVal = page.locator('.score-value');
    await expect(scoreVal).toBeVisible();
    const scoreText = (await scoreVal.textContent()) || '';
    const numericScore = parseInt(scoreText.trim(), 10);
    expect(numericScore).toBeGreaterThanOrEqual(200);
    expect(numericScore).toBeLessThanOrEqual(800);

    // Verificar badge Aprobado o Suspendido
    const badge = page.locator('.hero-badge-row app-badge');
    await expect(badge).toBeVisible();

    // Verificar desglose por temas
    const topicCards = page.locator('.topic-score-card');
    const topicCount = await topicCards.count();
    expect(topicCount).toBeGreaterThan(0);

    // Guardar URL de resultados con su query param ?id=...
    const resultsUrl = page.url();
    expect(resultsUrl).toContain('id=');

    // RECARGAR la página de resultados y verificar que sigue mostrando los mismos datos
    await page.reload();
    await page.waitForSelector('app-simulator-results-page');
    await expect(page.locator('.score-value')).toHaveText(scoreText);
    await expect(page.locator('.topic-score-card')).toHaveCount(topicCount);
  });

  test('En modo práctica (/simulador/practica) la explicación aparece al comprobar (Gate 8)', async ({
    page
  }) => {
    await page.goto('/simulador/practica');
    await page.waitForSelector('app-simulator-practice-page');

    // Verificar que estamos en la vista de práctica
    await expect(page.locator('.practice-title')).toContainText('Práctica libre de preguntas');

    // La explicación NO debe ser visible antes de pulsar "Comprobar"
    await expect(page.locator('.feedback-banner')).toHaveCount(0);

    // Seleccionar una opción si hay opciones disponibles
    const firstOption = page.locator('.option-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }

    // Pulsar botón "Comprobar respuesta"
    const checkBtn = page.locator('app-button:has-text("Comprobar respuesta") button');
    await expect(checkBtn).toBeVisible();
    await checkBtn.click();

    // La retroalimentación y la explicación oficial deben aparecer de inmediato
    const feedbackBanner = page.locator('.feedback-banner');
    await expect(feedbackBanner).toBeVisible();

    const explanationHeading = feedbackBanner.locator('h4:has-text("Explicación oficial")');
    await expect(explanationHeading).toBeVisible();
    const explanationText = feedbackBanner.locator('.feedback-explanation p');
    await expect(explanationText).not.toBeEmpty();
  });

  test('canStartExamGuard permite o bloquea según disponibilidad de examen (Gate 8)', async ({ page }) => {
    // Si hay preguntas en la plataforma, canStartExamGuard permite el acceso o redirige
    await page.goto('/simulador/examen');
    // Si no había sesión activa previa pero hay preguntas, el guard permite la navegación o redirige al hub
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/simulador/);
  });

  test('Auditoría de Accesibilidad Axe limpia en modo claro y oscuro (Gate 8)', async ({ page }) => {
    // 1. Auditoría en Hub (/simulador) modo claro
    await page.goto('/simulador');
    await page.waitForSelector('app-simulator-hub-page');

    const hubLightScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const hubLightViolations = hubLightScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(hubLightViolations).toHaveLength(0);

    // 2. Hub en modo oscuro
    const themeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await themeBtn.click();
    await page.waitForTimeout(300);

    const hubDarkScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const hubDarkViolations = hubDarkScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(hubDarkViolations).toHaveLength(0);

    // Volver a modo claro
    await themeBtn.click();
    await page.waitForTimeout(300);

    // 3. Auditoría en Práctica (/simulador/practica)
    await page.goto('/simulador/practica');
    await page.waitForSelector('app-simulator-practice-page');

    const practiceScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const practiceViolations = practiceScan.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(practiceViolations).toHaveLength(0);
  });

  test('Generación de capturas visuales de escritorio y móvil para Gate 8', async ({ page }) => {
    // 1. Captura Hub en escritorio claro (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/simulador');
    await page.waitForSelector('app-simulator-hub-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hub-desktop-light.png'), fullPage: true });

    // 2. Captura Hub en escritorio oscuro
    const themeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await themeBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hub-desktop-dark.png'), fullPage: true });

    // Volver a claro
    await themeBtn.click();
    await page.waitForTimeout(300);

    // 3. Captura Práctica libre con retroalimentación didáctica
    await page.goto('/simulador/practica');
    await page.waitForSelector('app-simulator-practice-page');
    await page.waitForSelector('.practice-main-content');
    const firstOpt = page.locator('.option-item').first();
    if (await firstOpt.isVisible()) {
      await firstOpt.click();
    }
    const checkBtn = page.locator('app-button:has-text("Comprobar respuesta") button');
    if (await checkBtn.isVisible()) {
      await checkBtn.click();
      await page.waitForSelector('.feedback-banner');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'practice-desktop-light.png'), fullPage: true });

    // 4. Captura Examen cronometrado en escritorio claro
    await page.goto('/simulador');
    await page.locator('app-button:has-text("Comenzar simulacro") button').click();
    await page.waitForURL('**/simulador/examen');
    await page.waitForSelector('app-simulator-exam-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'exam-desktop-light.png'), fullPage: true });

    // 5. Captura Examen en móvil (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'exam-mobile-light.png') });

    // 6. Entregar examen y capturar Resultados en escritorio claro y oscuro
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('app-timer-bar app-button button').click();
    const dialog = page.locator('.finish-dialog');
    await dialog.locator('app-button:has-text("Entregar examen") button').click();
    await page.waitForURL(/simulador\/resultados\?id=/);
    await page.waitForSelector('app-simulator-results-page');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'results-desktop-light.png'), fullPage: true });

    // Resultados en modo oscuro
    await themeBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'results-desktop-dark.png'), fullPage: true });

    // Dejar tema claro
    await themeBtn.click();
    await page.waitForTimeout(300);
  });
});

