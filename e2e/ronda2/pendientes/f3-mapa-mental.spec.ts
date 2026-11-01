import { test, expect } from '@playwright/test';

test.describe('F3 · Mapa Mental Interactivo y Robusto (Ronda 2)', () => {
  test('debe permitir zoom funcional, responder a controles y ofrecer toggle de comandos y términos', async ({ page }) => {
    // 1. Acceder al mapa mental
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    // 2. Obtener la transformación inicial del grupo SVG
    const svgGroup = page.locator('svg.mind-map-svg > g').first();
    await expect(svgGroup).toBeVisible({ timeout: 5000 });
    const initialTransform = await svgGroup.getAttribute('transform');

    // 3. Pulsar botón Zoom In (+)
    const zoomInBtn = page.getByTestId('zoom-in');
    await expect(zoomInBtn).toBeVisible();
    await zoomInBtn.click();
    await page.waitForTimeout(300);

    // 4. Comprobar que la transformación de zoom varió efectivamente (zoom Behavior activo)
    const newTransform = await svgGroup.getAttribute('transform');
    expect(newTransform).not.toBe(initialTransform);

    // 5. Comprobar existencia del interruptor "Mostrar comandos y términos"
    const toggleDetails = page.getByRole('checkbox', { name: /mostrar comandos|términos y comandos/i })
      .or(page.getByRole('button', { name: /comandos y términos/i }))
      .or(page.locator('[data-testid="toggle-commands-terms"]'));

    await expect(toggleDetails).toBeVisible({ timeout: 5000 });
  });
});

