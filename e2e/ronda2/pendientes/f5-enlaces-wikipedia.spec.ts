import { test, expect } from '@playwright/test';

test.describe('F5 · Enlaces Tipo Wikipedia y Referencias Contextuales (Ronda 2)', () => {
  test('debe autoenlazar comandos y términos en diapositivas con previsualización contextual y enlace "Se explica en"', async ({ page }) => {
    // 1. Acceder a un subtema de estudio
    await page.goto('/estudiar/105.1?vista=slides');
    await page.waitForLoadState('networkidle');

    // 2. Comprobar que existe al menos un elemento app-term-link o enlace de término
    const termLink = page.locator('app-term-link, a.term-link, [data-term-ref]').first();
    await expect(termLink).toBeVisible({ timeout: 5000 });

    // 3. Al interactuar con el enlace (hover / focus), debe abrirse la tarjeta de previsualización
    await termLink.hover();
    const previewCard = page.locator('.term-link-card, [role="dialog"][aria-label*="Término"], app-term-link .preview-card');
    await expect(previewCard).toBeVisible({ timeout: 5000 });

    // 4. La tarjeta debe contener botón o texto "Se explica en"
    const explainedInBtn = previewCard.locator('button, a').filter({ hasText: /se explica en/i });
    await expect(explainedInBtn).toBeVisible();

    // 5. En el catálogo de comandos o glosario debe existir el indicador de ubicación
    await page.goto('/comandos');
    await page.waitForLoadState('networkidle');
    const explainedInCol = page.locator('.explained-in-badge, [data-testid="explained-in"]').first();
    await expect(explainedInCol).toBeVisible({ timeout: 5000 });
  });
});

