import { test, expect } from '@playwright/test';

test.describe('F1 · Simulador del Examen 102-500 (Ronda 2)', () => {
  test('debe permitir seleccionar el Examen 102 y ejecutar un simulacro exclusivo de temas 105-110', async ({ page }) => {
    // 1. Acceder al hub del simulador
    await page.goto('/simulador');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existe un selector para alternar entre Examen 101 y Examen 102
    const exam102Selector = page.getByRole('button', { name: /examen 102|102-500/i })
      .or(page.getByRole('radio', { name: /102/i }))
      .or(page.locator('[data-testid="select-exam-102"]'));

    await expect(exam102Selector).toBeVisible({ timeout: 5000 });

    // 3. Seleccionar Examen 102
    await exam102Selector.click();

    // Comprobar que la sección de entrenar por tema muestra temas 105 a 110 (y no 101-104)
    const chipsSection = page.locator('.topics-chips-container');
    await expect(chipsSection).toBeVisible();
    await expect(chipsSection).toContainText(/105/);
    await expect(chipsSection).not.toContainText(/Tema 101:/);

    // 4. Comenzar el simulacro cronometrado
    const startBtn = page.getByRole('button', { name: /comenzar simulacro|iniciar simulacro/i });
    await startBtn.click();

    // 5. Debe navegar a la pantalla de examen con parámetro o contexto del 102
    await expect(page).toHaveURL(/.*simulador\/examen(\?.*exam=102)?/);

    // 6. El temporizador debe estar activo y arrancar cerca de 90 minutos (89:xx o 90:00)
    const timerDigits = page.locator('.timer-digits').first();
    await expect(timerDigits).toBeVisible();
    const timerText = await timerDigits.textContent();
    expect(timerText).toMatch(/(89|90):[0-5][0-9]/);

    // 7. La pregunta mostrada debe pertenecer a los temas 105 a 110 (no a 101-104)
    const topicBadge = page.locator('.question-topic, [data-testid="question-topic"]').first();
    await expect(topicBadge).toBeVisible();
    const topicText = await topicBadge.textContent();
    expect(topicText).toMatch(/10[5-9]|110/);

    // 8. El progreso debe indicar un simulacro completo de 60 preguntas
    const progressText = page.locator('.progress-text').first();
    await expect(progressText).toBeVisible();
    await expect(progressText).toContainText('60');
  });

  test('el temporizador sincronizado persiste tras recargar la página', async ({ page }) => {
    await page.goto('/simulador/examen?exam=102');
    await page.waitForLoadState('networkidle');

    const timerDigits = page.locator('.timer-digits').first();
    await expect(timerDigits).toBeVisible({ timeout: 5000 });
    const timerBefore = await timerDigits.textContent();
    expect(timerBefore).toMatch(/(89|90):[0-5][0-9]/);

    // Recargar la página
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Debe seguir en el examen con tiempo válido sincronizado
    await expect(timerDigits).toBeVisible();
    const timerAfter = await timerDigits.textContent();
    expect(timerAfter).toMatch(/(89|90):[0-5][0-9]/);
  });

  test('acceso directo por URL ?exam=102 y ?exam=102&tema=105', async ({ page }) => {
    // 1. Visita directa al examen 102
    await page.goto('/simulador/examen?exam=102');
    await page.waitForLoadState('networkidle');

    const topicBadge = page.locator('.question-topic, [data-testid="question-topic"]').first();
    await expect(topicBadge).toBeVisible({ timeout: 5000 });
    const topicText = await topicBadge.textContent();
    expect(topicText).toMatch(/10[5-9]|110/);

    // 2. Visita directa a práctica del tema 105 del examen 102
    await page.goto('/simulador/practica?exam=102&tema=105');
    await page.waitForLoadState('networkidle');

    const practiceTopicBadge = page.locator('.question-topic, [data-testid="question-topic"]').first();
    await expect(practiceTopicBadge).toBeVisible({ timeout: 5000 });
    const practiceText = await practiceTopicBadge.textContent();
    expect(practiceText).toContain('105');
  });

  test('entrega del examen 102 y desglose de resultados por temas 105-110', async ({ page }) => {
    await page.goto('/simulador/examen?exam=102');
    await page.waitForLoadState('networkidle');

    // Responder una opción si es de tipo single/multiple
    const firstOption = page.locator('.option-item input').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }

    // Abrir diálogo de entrega
    const finishBtn = page.getByRole('button', { name: /finalizar examen/i });
    await finishBtn.click();

    // Confirmar entrega en el diálogo modal
    const confirmBtn = page.getByRole('button', { name: /entregar examen/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Debe navegar a resultados
    await expect(page).toHaveURL(/.*simulador\/resultados\?id=.*/);

    // Comprobar distintivo de Examen 102
    const examBadge = page.locator('.results-page-layout').first();
    await expect(examBadge).toContainText(/102/);

    // Comprobar desglose con temas 105 a 110
    const topicBreakdown = page.locator('.topic-breakdown-section');
    await expect(topicBreakdown).toBeVisible();
    await expect(topicBreakdown).toContainText(/Tema 105|Shells/i);
  });

  test('el Examen 101 sigue funcionando sin regresión', async ({ page }) => {
    await page.goto('/simulador');
    await page.waitForLoadState('networkidle');

    const exam101Selector = page.getByRole('button', { name: /examen 101|101-500/i })
      .or(page.locator('[data-testid="select-exam-101"]'));
    await expect(exam101Selector).toBeVisible({ timeout: 5000 });
    await exam101Selector.click();

    // Temas 101 a 104 visibles
    const chipsSection = page.locator('.topics-chips-container');
    await expect(chipsSection).toContainText(/101/);
    await expect(chipsSection).not.toContainText(/Tema 105:/);

    // Iniciar simulacro 101
    const startBtn = page.getByRole('button', { name: /comenzar simulacro|iniciar simulacro/i });
    await startBtn.click();
    await expect(page).toHaveURL(/.*simulador\/examen(\?.*exam=101)?/);

    const topicBadge = page.locator('.question-topic, [data-testid="question-topic"]').first();
    await expect(topicBadge).toBeVisible();
    const topicText = await topicBadge.textContent();
    expect(topicText).toMatch(/10[1-4]/);
  });
});
