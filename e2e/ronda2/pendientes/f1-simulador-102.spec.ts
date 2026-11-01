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

    // 3. Seleccionar Examen 102 y comenzar el simulacro
    await exam102Selector.click();
    const startBtn = page.getByRole('button', { name: /comenzar simulacro|iniciar simulacro/i });
    await startBtn.click();

    // 4. Debe navegar a la pantalla de examen con parámetro o contexto del 102
    await expect(page).toHaveURL(/.*simulador\/examen(\?.*exam=102)?/);

    // 5. La pregunta mostrada debe pertenecer a los temas 105 a 110 (no a 101-104)
    const topicBadge = page.locator('.question-topic, [data-testid="question-topic"]').first();
    await expect(topicBadge).toBeVisible();
    const topicText = await topicBadge.textContent();
    expect(topicText).toMatch(/10[5-9]|110/);
  });
});

