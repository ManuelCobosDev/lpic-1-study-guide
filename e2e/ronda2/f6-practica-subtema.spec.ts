import { test, expect } from '@playwright/test';

test.describe('F6 · Sección Practica lo Aprendido en Lecciones (Ronda 2)', () => {
  test('debe contener la 4ª pestaña de práctica con test rápido, mini-flashcards y ejercicios oficiales', async ({ page }) => {
    // 1. Acceder al subtema 105.1
    await page.goto('/estudiar/105.1');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existe la pestaña "Practica lo aprendido" y es la 4ª
    const tabs = page.locator('nav.tabs-container button[role="tab"]');
    await expect(tabs).toHaveCount(4);
    const fourthTab = tabs.nth(3);
    await expect(fourthTab).toContainText(/practica lo aprendido/i);

    // 3. Abrir la pestaña
    await fourthTab.click();

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

  test('interacción completa: responder pregunta, ver respuesta oficial y verificar insignia en temario', async ({ page }) => {
    await page.goto('/estudiar/105.1');
    await page.waitForLoadState('networkidle');

    // Abrir pestaña de práctica
    await page.locator('[data-testid="tab-practice"]').click();

    // Bloque C: Ejercicios del manual - Ver respuesta oficial
    const firstExercise = page.locator('[data-testid="manual-exercises"] .exercise-item-card').first();
    await expect(firstExercise).toBeVisible();
    const verRespuestaBtn = firstExercise.getByRole('button', { name: /ver respuesta oficial/i });
    await verRespuestaBtn.click();
    await expect(firstExercise.locator('.official-answer-panel')).toBeVisible();

    // Marcar como hecho
    const marcarHechoBtn = firstExercise.getByRole('button', { name: /marcar como hecho/i });
    await marcarHechoBtn.click();
    await expect(firstExercise.getByRole('button', { name: /completado/i })).toBeVisible();

    // Bloque B: Mini-flashcards - Voltear tarjeta
    const flashcard = page.locator('[data-testid="mini-flashcards"] .flashcard-card');
    await expect(flashcard).toBeVisible();
    await flashcard.click();
    await expect(page.locator('[data-testid="mini-flashcards"] .rating-buttons-grid')).toBeVisible();

    // Calificar con botón "3. Bien"
    await page.getByRole('button', { name: /3\. bien/i }).click();

    // Bloque A: Responder primera pregunta del test rápido
    const firstOption = page.locator('[data-testid="quick-quiz"] .option-item-btn').first();
    await firstOption.click();
    const comprobarBtn = page.getByRole('button', { name: /comprobar respuesta/i });
    await comprobarBtn.click();
    await expect(page.locator('[data-testid="quick-quiz"] .feedback-panel')).toBeVisible();

    // Navegar al temario y verificar áreas de conocimiento clave
    await page.goto('/temario/102/105');
    await page.waitForLoadState('networkidle');

    // Desplegable de áreas clave
    const keyAreasDropdown = page.locator('[data-testid="key-areas-dropdown"]').first();
    await expect(keyAreasDropdown).toBeVisible();
    await keyAreasDropdown.click();
    await expect(keyAreasDropdown.locator('li').first()).toBeVisible();
  });

  test('panel de fin de diapositivas al llegar a la última slide con acceso directo a práctica', async ({ page }) => {
    await page.goto('/estudiar/105.1');
    await page.waitForLoadState('networkidle');

    // Ir a la última diapositiva (por miniaturas o teclado)
    // Abre miniaturas
    await page.getByRole('button', { name: /miniaturas/i }).click();
    const thumbs = page.locator('.thumbnails-drawer .thumb-btn');
    const lastThumb = thumbs.last();
    await lastThumb.click();

    // Comprobar panel de fin de diapositivas
    const completionPanel = page.locator('[data-testid="slides-completion-panel"]');
    await expect(completionPanel).toBeVisible({ timeout: 5000 });
    await expect(completionPanel).toContainText(/has terminado las diapositivas/i);

    // Clic en botón "Practica lo aprendido"
    const goToPracticeBtn = page.locator('[data-testid="go-to-practice-btn"]');
    await goToPracticeBtn.scrollIntoViewIfNeeded();
    await goToPracticeBtn.click({ force: true });

    // La pestaña de práctica debe activarse
    const practiceTab = page.locator('[data-testid="tab-practice"]');
    await expect(practiceTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="quick-quiz"]')).toBeVisible();
  });

  test('debe funcionar también en un subtema del Examen 101 (101.1)', async ({ page }) => {
    await page.goto('/estudiar/101.1');
    await page.waitForLoadState('networkidle');

    const practiceTab = page.locator('[data-testid="tab-practice"]');
    await expect(practiceTab).toBeVisible({ timeout: 5000 });
    await practiceTab.click();

    await expect(page.locator('[data-testid="quick-quiz"]')).toBeVisible();
    await expect(page.locator('[data-testid="mini-flashcards"]')).toBeVisible();
    await expect(page.locator('[data-testid="manual-exercises"]')).toBeVisible();
  });
});
