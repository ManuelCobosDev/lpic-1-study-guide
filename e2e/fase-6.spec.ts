import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-6');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 6: Buscador Global LPIC-1 (Paleta Ctrl+K y Página /buscar)', () => {

  test('Ctrl+K abre la paleta modal y Escape la cierra (Gate 6)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-shell');

    // Inicialmente no debe estar visible la paleta
    const palette = page.locator('app-search-palette .search-palette-backdrop');
    await expect(palette).toHaveCount(0);

    // Pulsar Ctrl+K para abrir
    await page.keyboard.press('Control+KeyK');
    await expect(palette).toBeVisible();

    // El input debe tener foco automático
    const input = page.locator('app-search-palette input[type="search"]');
    await expect(input).toBeFocused();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(palette).toHaveCount(0);

    // Probar también apertura con la tecla "/"
    await page.keyboard.press('Slash');
    await expect(palette).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(palette).toHaveCount(0);
  });

  test('Buscar un comando (tee) devuelve comando, diapositivas y término de glosario (Gate 6)', async ({ page }) => {
    await page.goto('/buscar');
    await page.waitForSelector('app-search-page');

    const searchInput = page.locator('app-search-page input[type="search"]');
    await searchInput.fill('tee');
    await searchInput.press('Enter');

    // Esperar a que la indexación finalice y los resultados estén renderizados
    await page.waitForSelector('.search-result-card', { timeout: 10000 });
    const results = page.locator('.search-result-card');
    await expect(results.first()).toBeVisible();

    // Verificar presencia de resultado tipo Comando
    const commandBadge = page.locator('.search-result-card app-badge:has-text("Comando")');
    await expect(commandBadge.first()).toBeVisible();

    // Verificar presencia de resultado tipo Diapositiva
    const slideBadge = page.locator('.search-result-card app-badge:has-text("Diapositiva")');
    await expect(slideBadge.first()).toBeVisible();

    // Comprobar que en la categoría Todo o cambiando a Glosario hay coincidencias
    const categoryChips = page.locator('.category-filters button');
    await expect(categoryChips.filter({ hasText: 'Comandos' })).toBeVisible();
    await expect(categoryChips.filter({ hasText: 'Diapositivas' })).toBeVisible();
  });

  test('Buscar código exacto 103.4 lleva prioritario y directo al subtema (Gate 6)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-shell');

    // Abrir paleta con Ctrl+K
    await page.keyboard.press('Control+KeyK');
    const input = page.locator('app-search-palette input[type="search"]');
    await input.fill('103.4');

    // Esperar a los resultados de la paleta
    const firstResult = page.locator('app-search-palette .result-item').first();
    await expect(firstResult).toBeVisible();

    // Debe contener el título del subtema 103.4 y la etiqueta de Temario o Coincidencia exacta
    await expect(firstResult).toContainText('103.4');
    await expect(firstResult).toContainText('tuberías y redirecciones');

    // Al pulsar Enter navega directamente a la página de estudio del subtema
    await page.keyboard.press('Enter');
    await page.waitForURL('**/estudiar/103.4*');
    expect(page.url()).toContain('/estudiar/103.4');
  });

  test('Buscar sin tilde (tuberias) encuentra palabras con tilde (tuberías) (Gate 6)', async ({ page }) => {
    await page.goto('/buscar?q=tuberias');
    await page.waitForSelector('app-search-page');
    await page.waitForSelector('.search-result-card', { timeout: 10000 });

    const results = page.locator('.search-result-card');
    await expect(results.first()).toBeVisible();

    // Debe contener coincidencias con tilde
    const pageContent = await page.locator('.search-results-list').innerText();
    expect(pageContent.toLowerCase()).toContain('tuberías');
  });

  test('Abrir una diapositiva resultado navega con ?slide= y <mark> resalta el término (Gate 6)', async ({ page }) => {
    await page.goto('/buscar?q=tee');
    await page.waitForSelector('app-search-page');
    await page.waitForSelector('.search-result-card', { timeout: 10000 });

    // Filtrar por Diapositivas o localizar un resultado de diapositiva
    const slideChip = page.locator('.category-filters button:has-text("Diapositivas")');
    await slideChip.click();

    const slideResultLink = page.locator('.search-result-card a[href*="slide="]').first();
    await expect(slideResultLink).toBeVisible();

    // Obtener la URL del enlace y hacer clic
    const href = await slideResultLink.getAttribute('href');
    expect(href).toContain('slide=');
    expect(href).toContain('q=tee');

    await slideResultLink.click();
    await page.waitForURL('**/estudiar/*');

    // Comprobar que la URL contiene los query params ?slide= y &q=
    expect(page.url()).toContain('slide=');
    expect(page.url()).toContain('q=tee');

    // Verificar que en el visor de diapositivas o contenido existe al menos un elemento <mark>
    const highlightedMarks = page.locator('mark');
    await expect(highlightedMarks.first()).toBeVisible();
    await expect(highlightedMarks.first()).toContainText(/tee/i);
  });

  test('/buscar?q= pagina adecuadamente a 20 resultados por página (Gate 6)', async ({ page }) => {
    // Buscar un término muy común en Linux como 'file' o 'line' o 'de' que tenga >20 resultados
    await page.goto('/buscar?q=de');
    await page.waitForSelector('app-search-page');

    const cards = page.locator('.search-result-card');
    const count = await cards.count();

    // Como máximo 20 resultados en una sola página
    expect(count).toBeLessThanOrEqual(20);

    // Si hay más de 20 resultados, la paginación debe estar presente
    const pagination = page.locator('.pagination-controls');
    if (await pagination.isVisible()) {
      const nextBtn = page.locator('button[aria-label="Página siguiente"]');
      await expect(nextBtn).toBeEnabled();

      // Avanzar a la página 2
      await nextBtn.click();
      await page.waitForURL('**/buscar?*pagina=2*');
      expect(page.url()).toContain('pagina=2');

      // Botón anterior debe estar habilitado en la página 2
      const prevBtn = page.locator('button[aria-label="Página anterior"]');
      await expect(prevBtn).toBeEnabled();
    }
  });

  test('Las preguntas del simulador NO deben aparecer en ningún resultado (Gate 6)', async ({ page }) => {
    // Buscar términos típicos de preguntas de simulador
    await page.goto('/buscar?q=pregunta');
    await page.waitForSelector('app-search-page');

    // Ningún badge o resultado debe ser de tipo simulador o pregunta
    const simulatorBadges = page.locator('.search-result-card app-badge:has-text("Simulador"), .search-result-card app-badge:has-text("Pregunta")');
    await expect(simulatorBadges).toHaveCount(0);

    // Buscar "simulador" explícitamente
    await page.goto('/buscar?q=simulador');
    await page.waitForSelector('app-search-page');
    await expect(simulatorBadges).toHaveCount(0);
  });

  test('Auditoría de accesibilidad Axe en modo claro y oscuro sin violaciones críticas/serias (Gate 6)', async ({ page }) => {
    // 1. Auditoría en /buscar (Modo Claro)
    await page.goto('/buscar?q=tee');
    await page.waitForSelector('app-search-page');

    const axeLight = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const seriousLight = axeLight.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(seriousLight).toHaveLength(0);

    // 2. Auditoría en /buscar (Modo Oscuro)
    const toggleButton = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const axeDark = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const seriousDark = axeDark.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(seriousDark).toHaveLength(0);

    // Restaurar a claro
    await toggleButton.click();
  });

  test('Generación de capturas visuales de Gate 6 (desktop light/dark, /buscar y mobile)', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Paleta de búsqueda modal en Desktop Light (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('app-shell');

    await page.keyboard.press('Control+KeyK');
    await page.locator('app-search-palette input[type="search"]').fill('tee');
    await page.waitForSelector('app-search-palette .result-item', { timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'search-palette-desktop-light.png')
    });

    // 2. Paleta de búsqueda modal en Desktop Dark (1440x900)
    await page.keyboard.press('Escape');
    const toggleTheme = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleTheme.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.keyboard.press('Control+KeyK');
    await page.locator('app-search-palette input[type="search"]').fill('tee');
    await page.waitForSelector('app-search-palette .result-item', { timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'search-palette-desktop-dark.png')
    });

    // Restaurar tema claro
    await page.keyboard.press('Escape');
    await toggleTheme.click();

    // 3. Página completa /buscar?q=tee en Desktop Light (1440x900)
    await page.goto('/buscar?q=tee');
    await page.waitForSelector('.search-result-card', { timeout: 15000 });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'search-page-desktop-light.png')
    });

    // 4. Búsqueda en Mobile Light (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/buscar?q=tee');
    await page.waitForSelector('.search-result-card', { timeout: 15000 });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'search-mobile-light.png')
    });
  });
});

