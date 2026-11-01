import { test, expect } from '@playwright/test';

test.describe('F6 · Sección Practica lo Aprendido en Lecciones (Ronda 2)', () => {
  test('debe contener la 4ª pestaña de práctica con test rápido, mini-flashcards y ejercicios oficiales', async ({ page }) => {
    // 1. Acceder al subtema 105.1
    await page.goto('/estudiar/105.1');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existe la pestaña "Practica lo aprendido"
    const practiceTab = page.getByRole('tab', { name: /practica lo aprendido|práctica/i })
      .or(page.locator('[data-testid="tab-practice"], button#tab-practice'));
    await expect(practiceTab).toBeVisible({ timeout: 5000 });

    // 3. Abrir la pestaña
    await practiceTab.click();

    // 4. Bloque A: Test Rápido
    const quizSection = page.locator('[data-testid="quick-quiz"], .quick-quiz-section');
    await expect(quizSection).toBeVisible({ timeout: 5000 });

    // 5. Bloque B: Mini-flashcards
    const miniFlashcards = page.locator('[data-testid="mini-flashcards"], .mini-flashcards-section');
    await expect(miniFlashcards).toBeVisible({ timeout: 5000 });

    // 6. Bloque C: Acordeón de ejercicios del manual
    const exercisesAccordion = page.locator('[data-testid="manual-exercises"], .manual-exercises-accordion');
    await expect(exercisesAccordion).toBeVisible({ timeout: 5000 });
  });
});

