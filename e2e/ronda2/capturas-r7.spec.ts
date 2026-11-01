import { test } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

test.describe('Capturas visuales R7 · Mapa mental interactivo y robusto', () => {
  test('generar capturas de base, zoom, comandos/términos, drawer y móvil', async ({ page }) => {
    const dir = path.join(process.cwd(), 'e2e', 'screenshots', 'r2-R7');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Mapa mental base (55 nodos)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('svg.mind-map-svg g.nodes-layer g.tree-node');
    await page.screenshot({ path: path.join(dir, '01-mapa-base-desktop.png'), fullPage: true });

    // 2. Zoom In
    const zoomInBtn = page.getByTestId('zoom-in');
    await zoomInBtn.click();
    await zoomInBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, '02-mapa-zoom-in.png'), fullPage: true });

    // 3. Comandos y términos activados
    const fitBtn = page.getByTestId('zoom-fit');
    await fitBtn.click();
    const toggleBtn = page.locator('[data-testid="toggle-commands-terms"]');
    await toggleBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(dir, '03-mapa-comandos-terminos.png'), fullPage: true });

    // 4. Detalle de subtema en Drawer
    const searchInput = page.locator('[data-testid="search-nodes"]');
    await searchInput.fill('105.1');
    const firstOption = page.locator('.search-dropdown button.dropdown-item').first();
    await firstOption.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, '04-mapa-drawer-subtema.png'), fullPage: true });

    // 5. Móvil 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, '05-mapa-movil-390px.png'), fullPage: true });
  });
});
