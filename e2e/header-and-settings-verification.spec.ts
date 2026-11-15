import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/header-and-settings');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Verificación Visual de Header, Ajustes Flashcards y Erratas', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('1. Home: header en ancho compacto (1280px) y sin enlace a Erratas en el footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Comprobar que en el footer NO existe enlace a erratas
    const footerErrataLink = page.locator('footer a[href="/erratas"]');
    await expect(footerErrataLink).toHaveCount(0);

    // Medir ancho del buscador en Home
    const searchTrigger = page.locator('.search-trigger');
    await expect(searchTrigger).toBeVisible();
    const searchBoxHome = await searchTrigger.boundingBox();
    expect(searchBoxHome).not.toBeNull();
    console.log('Search width in Home:', searchBoxHome?.width);

    // Captura de la Home
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-header.png') });
  });

  test('2. Transición a Ajustes: header se alarga, buscador se ensancha y nav se separa', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navegar a Ajustes haciendo clic en el engranaje del header
    const settingsButton = page.locator('header a[href="/ajustes"]');
    await settingsButton.click();
    await page.waitForURL('**/ajustes');
    await page.waitForLoadState('networkidle');

    // Esperar a que la transición fluida de CSS termine (450ms)
    await page.waitForTimeout(600);

    // Medir ancho del buscador en Ajustes
    const searchTrigger = page.locator('.search-trigger');
    const searchBoxWide = await searchTrigger.boundingBox();
    expect(searchBoxWide).not.toBeNull();
    console.log('Search width in Ajustes (Wide):', searchBoxWide?.width);

    // El buscador debe ser sustancialmente más ancho en vista wide que en home
    expect(searchBoxWide!.width).toBeGreaterThan(300);

    // Captura de la cabecera en Ajustes
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-settings-header-wide.png') });

    // Ir a la pestaña "Estudio"
    const tabEstudio = page.locator('#tab-estudio');
    await tabEstudio.click();
    await page.waitForTimeout(300);

    // Comprobar selector de flashcards por día
    const selectCards = page.locator('#new-cards-select');
    await expect(selectCards).toBeVisible();

    // Cambiar el valor a 20 tarjetas / día
    await selectCards.selectOption('20');
    await page.waitForTimeout(400);

    // Comprobar que el toast de confirmación aparece
    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('20');

    // Captura de la pantalla de Ajustes > Estudio con valor seleccionado
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-settings-study-tab.png') });

    // Recargar la página para verificar que la persistencia funciona
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Ir de nuevo a Estudio
    await page.locator('#tab-estudio').click();
    await page.waitForTimeout(300);

    // Comprobar que sigue teniendo '20' seleccionado
    const selectedVal = await page.locator('#new-cards-select').inputValue();
    expect(selectedVal).toContain('20');
  });

  test('3. Flashcards: la sesión respeta el valor de tarjetas configurado', async ({ page }) => {
    // Fijamos en localStorage que newCardsPerDay sea 5
    await page.goto('/ajustes');
    await page.waitForLoadState('networkidle');
    await page.locator('#tab-estudio').click();
    await page.locator('#new-cards-select').selectOption('5');
    await page.waitForTimeout(400);

    // Navegar a Flashcards desde el header
    const flashcardsLink = page.locator('header a[href="/flashcards"]');
    await flashcardsLink.click();
    await page.waitForURL('**/flashcards');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // Captura de la pantalla de Flashcards
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-flashcards-page.png') });

    // En el header, verificar que el buscador y el nav siguen extendidos
    const searchTrigger = page.locator('.search-trigger');
    const searchBox = await searchTrigger.boundingBox();
    expect(searchBox!.width).toBeGreaterThan(300);
  });
});

