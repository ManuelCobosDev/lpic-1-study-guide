import { test, expect } from '@playwright/test';

test.describe('F2 · Flashcards Masivas y Explorador de Tarjetas (Ronda 2)', () => {
  test('debe ofrecer selector de mazos ampliados (por examen 101/102) y explorador de tarjetas', async ({ page }) => {
    // 1. Acceder a la página de flashcards
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existen opciones de mazo por examen o filtrado por subtema
    const deckExam102 = page.getByRole('button', { name: /examen 102|102/i })
      .or(page.locator('[data-testid="deck-exam-102"]'));
    await expect(deckExam102).toBeVisible({ timeout: 5000 });

    // 3. Comprobar que existe un explorador o biblioteca de tarjetas
    const explorerSection = page.locator('[data-testid="flashcards-explorer"], .flashcards-explorer')
      .or(page.getByRole('searchbox', { name: /buscar tarjetas|filtrar/i }));
    await expect(explorerSection).toBeVisible({ timeout: 5000 });

    // 4. Comprobar que el volumen de tarjetas supera el mínimo básico (cientos de tarjetas disponibles)
    const cardCounter = page.locator('[data-testid="total-flashcards-count"], .total-cards-badge');
    await expect(cardCounter).toBeVisible();
    const countText = await cardCounter.textContent();
    const totalCount = parseInt(countText?.replace(/\D/g, '') || '0', 10);
    expect(totalCount).toBeGreaterThanOrEqual(400);
  });
});

