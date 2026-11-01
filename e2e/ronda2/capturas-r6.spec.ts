import { test } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

test.describe('Capturas visuales R6 · Simulador Examen 102', () => {
  test('generar capturas de hub, examen y resultados del 102', async ({ page }) => {
    const dir = path.join(process.cwd(), 'e2e', 'screenshots', 'r2-R6');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Hub con selector de examen 102
    await page.goto('/simulador');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="select-exam-102"]').click();
    await page.screenshot({ path: path.join(dir, '01-simulador-hub-102.png'), fullPage: true });

    // 2. Examen activo del 102
    await page.goto('/simulador/examen?exam=102');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(dir, '02-simulador-examen-102.png'), fullPage: true });

    // 3. Resultados del 102
    const firstOption = page.locator('.option-item input').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
    const finishBtn = page.getByRole('button', { name: /finalizar examen/i });
    await finishBtn.click();
    const confirmBtn = page.getByRole('button', { name: /entregar examen/i });
    await confirmBtn.click();
    await page.waitForURL(/.*simulador\/resultados\?id=.*/);
    await page.screenshot({ path: path.join(dir, '03-simulador-resultados-102.png'), fullPage: true });
  });
});

