import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-7');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 7: Laboratorios y Prácticas Guiadas LPIC-1', () => {

  test('Filtros reactivos y búsqueda en el catálogo /laboratorios (Gate 7)', async ({ page }) => {
    await page.goto('/laboratorios');
    await page.waitForSelector('app-labs-page');

    // Verificar que renderiza las 42 tarjetas de laboratorio inicialmente
    const allCards = page.locator('.lab-card');
    await expect(allCards).toHaveCount(42);

    // 1. Filtrar por búsqueda de texto: "103.4"
    const searchInput = page.locator('#labSearch');
    await searchInput.fill('103.4');
    await expect(page).toHaveURL(/q=103\.4/);
    await expect(allCards).toHaveCount(1);
    await expect(page.locator('.lab-card').first()).toContainText('103.4');

    // Limpiar búsqueda
    const clearBtn = page.locator('button[aria-label="Limpiar búsqueda"]');
    await clearBtn.click();
    await expect(allCards).toHaveCount(42);

    // 2. Filtrar por Tema: Tema 103 (Comandos GNU y Unix)
    const topicSelect = page.locator('#topicFilter');
    await topicSelect.selectOption('103');
    await expect(page).toHaveURL(/tema=103/);
    // En el Tema 103 hay 8 subtemas (103.1 a 103.8)
    await expect(allCards).toHaveCount(8);

    // 3. Filtrar por Dificultad: Avanzada
    const diffSelect = page.locator('#difficultyFilter');
    await diffSelect.selectOption('advanced');
    await expect(page).toHaveURL(/dificultad=advanced/);
    const countAdvanced = await allCards.count();
    expect(countAdvanced).toBeGreaterThan(0);
    for (let i = 0; i < countAdvanced; i++) {
      await expect(allCards.nth(i)).toContainText('Avanzada');
    }

    // 4. Restablecer filtros
    const resetBtn = page.locator('button:has-text("Restablecer filtros")');
    await resetBtn.click();
    await expect(allCards).toHaveCount(42);
  });

  test('Aviso de VM Debian 12 con guía modal y descarte persistente (Gate 7)', async ({ page }) => {
    // Abrir con estado limpio de localStorage para este test
    await page.goto('/laboratorios/103.4');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-lab-detail-page');

    // El banner de aviso debe estar presente
    const banner = page.locator('.vm-notice-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Necesitas una máquina virtual Debian 12');

    // Abrir guía modal
    const guideBtn = banner.locator('button:has-text("Guía de preparación")');
    await guideBtn.click();

    const guideModal = page.locator('#vmGuideTitle');
    await expect(guideModal).toBeVisible();

    // Cerrar guía modal
    const closeBtn = page.locator('app-button:has-text("Entendido, continuar práctica")');
    await closeBtn.click();
    await expect(guideModal).toHaveCount(0);

    // Descartar el aviso
    const dismissBtn = banner.locator('button:has-text("Descartar aviso")');
    await dismissBtn.click();
    await expect(banner).toHaveCount(0);

    // Recargar página y verificar que el aviso NO reaparece
    await page.reload();
    await page.waitForSelector('app-lab-detail-page');
    await expect(page.locator('.vm-notice-banner')).toHaveCount(0);
  });

  test('Marcar 3 pasos persiste tras recarga y copiar comando escribe al portapapeles (Gate 7)', async ({
    page,
    context
  }) => {
    // Otorgar permisos de portapapeles
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/laboratorios/103.4');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-lab-detail-page');

    const detailHeader = page.locator('app-lab-detail-page header');

    // Verificar progreso inicial 0%
    await expect(detailHeader).toContainText('0%');

    // Copiar comando del paso 1 al portapapeles
    const copyBtn = page.locator('button:has-text("Copiar comando")').first();
    await copyBtn.click();

    // Verificar feedback visual de copiado
    await expect(page.locator('text=¡Copiado!')).toBeVisible();

    // Comprobar contenido del portapapeles
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('mkdir -p /tmp/redir-lab');

    // Marcar paso 1 como hecho
    const toggleBtn = page.locator('app-button:has-text("Marcar paso como hecho")');
    await toggleBtn.click();
    await expect(page.locator('text=✓ Paso completado').first()).toBeVisible();

    // Navegar al paso 2 y marcarlo
    const nextBtn = page.locator('app-button:has-text("Siguiente paso →")');
    await nextBtn.click();
    await expect(page.locator('h2')).toContainText('Misión 2');
    await toggleBtn.click();

    // Navegar al paso 3 y marcarlo
    await nextBtn.click();
    await expect(page.locator('h2')).toContainText('Misión 3');
    await toggleBtn.click();

    // Comprobar que el indicador muestra 50% (3 de 6 misiones)
    await expect(detailHeader).toContainText('50%');

    // Recargar la página
    await page.reload();
    await page.waitForSelector('app-lab-detail-page');

    // CRITERIO CLAVE DE GATE 7: los 3 pasos siguen marcados tras reload
    await expect(detailHeader).toContainText('50%');
    await expect(detailHeader).toContainText('Paso 4 de 6');

    // Comprobar en el stepper que los 3 primeros pasos tienen el check verde
    const stepperCheckmarks = page.locator('.stepper-item button[aria-label*="Desmarcar paso"]');
    await expect(stepperCheckmarks).toHaveCount(3);
  });

  test('Completar todos los pasos abre diálogo de felicitación y actualiza catálogo (Gate 7)', async ({
    page
  }) => {
    await page.goto('/laboratorios/103.4');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-lab-detail-page');

    // Marcar los 6 pasos mediante el botón de toggle rápido en el stepper
    for (let i = 1; i <= 6; i++) {
      const checkbox = page.locator(`.stepper-item:has-text("Misión ${i}") button.step-checkbox-btn`);
      await checkbox.click();
      await page.waitForTimeout(100);
    }

    // CRITERIO DE GATE 7: Al completar todos los pasos se abre el modal de felicitación
    const successModal = page.locator('#successModalTitle');
    await expect(successModal).toBeVisible();
    await expect(successModal).toContainText('¡Enhorabuena! Práctica completada');

    // Navegar al catálogo mediante el botón del modal
    const toCatalogBtn = page.locator('app-button:has-text("Volver al catálogo de laboratorios")');
    await toCatalogBtn.click();

    await page.waitForSelector('app-labs-page');

    // CRITERIO DE GATE 7: La tarjeta 103.4 muestra badge de Completada y 100%
    const card1034 = page.locator('.lab-card:has-text("103.4")');
    await expect(card1034).toContainText('Completada');
    await expect(card1034).toContainText('100%');
  });

  test('Auditoría de Accesibilidad Axe en catálogo y detalle en modo claro y oscuro (Gate 7)', async ({
    page
  }) => {
    // 1. Auditoría Axe en /laboratorios (modo claro)
    await page.goto('/laboratorios');
    await page.waitForSelector('app-labs-page');

    const scanCatalogLight = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const catalogViolationsLight = scanCatalogLight.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(catalogViolationsLight).toHaveLength(0);

    // 2. Auditoría Axe en /laboratorios (modo oscuro)
    const toggleThemeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleThemeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.waitForTimeout(300);

    const scanCatalogDark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const catalogViolationsDark = scanCatalogDark.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(catalogViolationsDark).toHaveLength(0);

    // 3. Auditoría Axe en /laboratorios/103.4 (modo oscuro)
    await page.goto('/laboratorios/103.4');
    await page.waitForSelector('app-lab-detail-page');
    await page.waitForTimeout(300);

    const scanDetailDark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const detailViolationsDark = scanDetailDark.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(detailViolationsDark).toHaveLength(0);

    // 4. Auditoría Axe en /laboratorios/103.4 (modo claro)
    await toggleThemeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.waitForTimeout(300);

    const scanDetailLight = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const detailViolationsLight = scanDetailLight.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(detailViolationsLight).toHaveLength(0);
  });

  test('Capturas visuales del catálogo y detalle de laboratorios (Gate 7)', async ({ page }) => {
    // 1. Catálogo Escritorio Claro (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/laboratorios');
    await page.waitForSelector('app-labs-page');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'labs-catalog-desktop-light.png'),
      fullPage: true
    });

    // 2. Catálogo Escritorio Oscuro (1440x900)
    const toggleThemeBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleThemeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'labs-catalog-desktop-dark.png'),
      fullPage: true
    });

    // 3. Detalle Escritorio Claro (1440x900)
    await toggleThemeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.goto('/laboratorios/103.4');
    await page.waitForSelector('app-lab-detail-page');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'lab-detail-desktop-light.png'),
      fullPage: true
    });

    // 4. Detalle Móvil Claro (390x844 - iPhone 12/13/14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/laboratorios/103.4');
    await page.waitForSelector('app-lab-detail-page');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'lab-mobile-light.png'),
      fullPage: false
    });
  });

});
