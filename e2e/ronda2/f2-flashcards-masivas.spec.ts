import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

test.describe('F2 · Flashcards Masivas y Explorador de Tarjetas (Ronda 2)', () => {
  test('debe ofrecer selector de mazos ampliados (por examen 101/102) y explorador de tarjetas', async ({ page }) => {
    // 1. Acceder a la página de flashcards
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existen opciones de mazo por examen o filtrado por subtema
    const deckExam102 = page.locator('[data-testid="deck-exam-102"]')
      .or(page.getByRole('button', { name: /examen 102|102/i })).first();
    await expect(deckExam102).toBeVisible({ timeout: 5000 });

    // 3. Comprobar que existe un explorador o biblioteca de tarjetas
    const explorerSection = page.locator('[data-testid="flashcards-explorer"], .flashcards-explorer').first();
    await expect(explorerSection).toBeVisible({ timeout: 5000 });

    // 4. Comprobar que el volumen de tarjetas supera el mínimo básico (cientos de tarjetas disponibles)
    const cardCounter = page.locator('[data-testid="total-flashcards-count"], .total-cards-badge').first();
    await expect(cardCounter).toBeVisible();
    const countText = await cardCounter.textContent();
    const totalCount = parseInt(countText?.replace(/\D/g, '') || '0', 10);
    expect(totalCount).toBeGreaterThanOrEqual(400);
  });

  test('el explorador debe filtrar y buscar entre más de 1 000 tarjetas en tiempo real', async ({ page }) => {
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');

    // Comprobar buscador del explorador
    const searchInput = page.locator('[data-testid="explorer-search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Medir tiempo de respuesta de búsqueda (< 1 s)
    const startTime = Date.now();
    await searchInput.fill('chmod');
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(1000);

    // Debe mostrar tarjetas filtradas que contienen 'chmod'
    const resultsCount = page.locator('.explorer-results-count');
    await expect(resultsCount).toBeVisible();
    const firstCardTitle = page.locator('.explorer-card .card-front-title').first();
    await expect(firstCardTitle).toBeVisible();
    await expect(firstCardTitle).toContainText(/chmod/i);

    // Desplegar el reverso de la primera tarjeta
    const toggleRevealBtn = page.locator('.explorer-card .toggle-reveal-btn').first();
    await toggleRevealBtn.click();
    const cardBack = page.locator('.explorer-card .card-back-content').first();
    await expect(cardBack).toBeVisible();

    // Ocultar reverso
    await toggleRevealBtn.click();
    await expect(cardBack).not.toBeVisible();
  });

  test('una sesión de estudio debe calificar tarjetas y persistir las cajas Leitner tras recargar', async ({ page }) => {
    await page.goto('/flashcards?mazo=commands');
    await page.waitForLoadState('networkidle');

    // Debe haber una tarjeta activa en la sesión
    const flashcardEl = page.locator('app-flashcard-card, [data-testid="flashcard-container"]').first();
    await expect(flashcardEl).toBeVisible({ timeout: 5000 });

    // Voltear la tarjeta pulsando la barra espaciadora o haciendo clic
    const flashcardFace = page.locator('.flashcard-scene').first();
    await flashcardFace.click();
    const backVisible = page.locator('.card-back, [data-testid="card-back"]').first();
    await expect(backVisible).toBeVisible({ timeout: 5000 });

    // Calificar con botón 4 (Fácil)
    const rateEasyBtn = page.locator('[data-testid="rate-btn-easy"]').first();
    await rateEasyBtn.waitFor({ state: 'visible', timeout: 5000 });
    await rateEasyBtn.click();

    // Comprobar que en localStorage se ha registrado progreso
    const progressSaved = await page.evaluate(() => {
      const stored = localStorage.getItem('lpic1.v1.flashcards_progress') || localStorage.getItem('flashcards_progress');
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      const progress = parsed.data?.progress || parsed.progress || {};
      return Object.keys(progress).length > 0;
    });
    expect(progressSaved).toBe(true);

    // Recargar página y verificar que el progreso persiste
    await page.reload();
    await page.waitForLoadState('networkidle');

    const progressAfterReload = await page.evaluate(() => {
      const stored = localStorage.getItem('lpic1.v1.flashcards_progress') || localStorage.getItem('flashcards_progress');
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      const progress = parsed.data?.progress || parsed.progress || {};
      return Object.keys(progress).length > 0;
    });
    expect(progressAfterReload).toBe(true);
  });

  test('los contadores de flashcards en Home y /flashcards deben coincidir exactamente con el manifiesto', async ({ page }) => {
    // 1. Leer cifras del manifiesto oficial
    const manifestPath = path.resolve(process.cwd(), 'public/content/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const expectedTotal = manifest.stats.totalFlashcards;

    expect(expectedTotal).toBeGreaterThanOrEqual(manifest.stats.totalCommands + manifest.stats.totalTerms);

    // 2. Comprobar Home (/)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeCard = page.locator('app-card[routerlink="/flashcards"]');
    await expect(homeCard).toBeVisible({ timeout: 5000 });
    const homeBadge = homeCard.locator('app-badge');
    await expect(homeBadge).toContainText(new RegExp(`${expectedTotal}`));

    // 3. Comprobar /flashcards
    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');

    const flashcardsCountBadge = page.locator('[data-testid="total-flashcards-count"], .total-cards-badge').first();
    await expect(flashcardsCountBadge).toBeVisible();
    await expect(flashcardsCountBadge).toContainText(new RegExp(`${expectedTotal}`));
  });
});
