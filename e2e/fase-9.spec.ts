import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e/screenshots/fase-9');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe('Gate 9: Comandos, Glosario y Flashcards', () => {

  test('Filtros de comandos reflejados en URL y conservados tras recargar (Gate 9)', async ({ page }) => {
    // 1. Navegar a /comandos
    await page.goto('/comandos');
    await page.waitForSelector('app-commands-page');

    // 2. Aplicar filtro de búsqueda
    const searchInput = page.locator('.search-input');
    await searchInput.fill('tee');

    // 3. Seleccionar categoría y tema
    const categorySelect = page.locator('.category-filter');
    await categorySelect.selectOption({ label: 'Uso de secuencias de texto, tuberías y redireccionamientos' });

    const topicSelect = page.locator('.topic-filter');
    await topicSelect.selectOption({ value: '103' });

    // 4. Verificar que la URL refleja los parámetros de consulta
    await expect(page).toHaveURL(/q=tee/);
    await expect(page).toHaveURL(/tema=103/);

    // 5. Verificar que el contador se actualizó dinámicamente
    const counterBadge = page.locator('.counter-text');
    await expect(counterBadge).toContainText(/de.*comandos/);

    // 6. Recargar la página y verificar que los filtros se restauran
    await page.reload();
    await page.waitForSelector('app-commands-page');

    await expect(searchInput).toHaveValue('tee');
    await expect(categorySelect).toHaveValue('Uso de secuencias de texto, tuberías y redireccionamientos');
    await expect(topicSelect).toHaveValue('103');
    await expect(counterBadge).toContainText(/de.*comandos/);

    // 7. Alternar vista tabla y tarjetas
    const cardsToggle = page.locator('.view-mode-toggle button:has-text("Tarjetas")');
    await cardsToggle.click();
    await expect(page.locator('.cards-grid')).toBeVisible();

    const tableToggle = page.locator('.view-mode-toggle button:has-text("Tabla")');
    await tableToggle.click();
    await expect(page.locator('.commands-table')).toBeVisible();
  });

  test('Fila expandible y copiado al portapapeles en /comandos (Gate 9)', async ({ page, context }) => {
    // Conceder permisos de portapapeles al navegador
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/comandos?q=tee');
    await page.waitForSelector('app-commands-page');

    // 1. La fila principal debe contener el comando 'tee'
    const commandRow = page.locator('.command-row').first();
    await expect(commandRow).toBeVisible();
    await expect(commandRow).toContainText('tee');

    // 2. Hacer clic en la fila para expandir los detalles
    await commandRow.click();

    // 3. El panel expandido debe mostrar sinopsis, ejemplo y flags
    const expandedPanel = page.locator('.expanded-panel');
    await expect(expandedPanel).toBeVisible();
    await expect(expandedPanel).toContainText('Sinopsis de uso');
    await expect(expandedPanel).toContainText('Ejemplo práctico');

    // 4. Copiar sinopsis al portapapeles y verificar feedback visual
    const copyBtn = expandedPanel.locator('.copy-btn').first();
    await copyBtn.click();
    await expect(expandedPanel.locator('.copied-badge')).toBeVisible();

    // 5. Verificar que el enlace al subtema existe
    const subtopicLink = expandedPanel.locator('.lesson-deeplink').first();
    await expect(subtopicLink).toHaveAttribute('href', /estudiar\/103\.4/);
  });

  test('AlphaIndex en /glosario salta a letra y deshabilita letras vacías (Gate 9)', async ({ page }) => {
    await page.goto('/glosario');
    await page.waitForSelector('app-glossary-page');

    // 1. El índice A-Z debe estar presente
    const alphaNav = page.locator('.alpha-index-nav');
    await expect(alphaNav).toBeVisible();

    // 2. Letras con términos (ej. 'A', 'S') deben estar habilitadas en catálogo completo
    const letterA = page.locator('.alpha-letter-btn:has-text("A")').first();
    await expect(letterA).toBeEnabled();

    // 3. Filtrar para que una letra quede vacía y comprobar que se deshabilita dinámicamente
    const searchInput = page.locator('.search-input');
    await searchInput.fill('stdin');
    await expect(letterA).toBeDisabled();
    await expect(letterA).toHaveAttribute('aria-disabled', 'true');

    // 4. Limpiar búsqueda, pulsar en 'S' y verificar que la sección correspondiente existe
    await searchInput.fill('');
    const letterS = page.locator('.alpha-letter-btn:has-text("S")').first();
    await expect(letterS).toBeEnabled();
    await letterS.click();
    const sectionS = page.locator('#letter-S');
    await expect(sectionS).toBeVisible();
    await expect(sectionS.locator('.letter-title')).toHaveText('S');

    // 5. Búsqueda en tiempo real
    await searchInput.fill('tee');
    await expect(page).toHaveURL(/q=tee/);
    await expect(page.locator('.term-name:has-text("tee")')).toBeVisible();
  });

  test('Sesión de flashcards con valoraciones y persistencia Leitner tras recargar (Gate 9)', async ({ page }) => {
    // 1. Limpiar estado previo
    await page.goto('/flashcards');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('app-flashcards-page');

    // 2. Verificar que la tarjeta inicial está en anverso (no volteada)
    const cardTitle = page.locator('.card-main-title');
    await expect(cardTitle).toBeVisible();
    await expect(page.locator('.rating-bar')).toHaveCount(0);

    // 3. Voltear la tarjeta pulsando la barra espaciadora
    await page.keyboard.press('Space');
    await expect(page.locator('.flashcard-inner')).toHaveClass(/is-flipped/);

    // 4. Comprobar que la barra de calificación está visible
    const ratingBar = page.locator('.rating-bar');
    await expect(ratingBar).toBeVisible();

    // 5. Calificar con la tecla '3' (Bien)
    await page.keyboard.press('3');

    // 6. La siguiente tarjeta debe mostrarse en anverso
    await expect(page.locator('.flashcard-inner')).not.toHaveClass(/is-flipped/);
    await expect(page.locator('.rating-bar')).toHaveCount(0);

    // 7. Recargar la página y verificar que el progreso se ha persistido en localStorage
    await page.reload();
    await page.waitForSelector('app-flashcards-page');

    const storedProgress = await page.evaluate(() => {
      const data = localStorage.getItem('lpic1.v1.flashcards_progress');
      return data ? JSON.parse(data) : null;
    });

    expect(storedProgress).toBeTruthy();
    expect(storedProgress.data).toBeTruthy();
    expect(storedProgress.data.progress).toBeTruthy();
    // Al menos una tarjeta calificada con 'Bien' debe estar en Caja 2
    const entries = Object.values(storedProgress.data.progress) as { box: number }[];
    const hasBox2 = entries.some((e) => e.box === 2);
    expect(hasBox2).toBe(true);
  });

  test('Auditoría de accesibilidad Axe en modo claro y oscuro en las 3 vistas (Gate 9)', async ({ page }) => {
    test.slow();
    const urls = ['/comandos', '/glosario', '/flashcards'];

    for (const url of urls) {
      // Modo claro
      await page.goto(url);
      await page.waitForSelector('app-shell');

      const lightScan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const lightViolations = lightScan.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(lightViolations).toHaveLength(0);

      // Modo oscuro
      const toggleBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await page.waitForTimeout(350);
        await expect(page.locator('html')).toHaveClass(/dark/);

        const darkScan = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();
        const darkViolations = darkScan.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        expect(darkViolations).toHaveLength(0);

        // Volver a modo claro para el siguiente test
        await toggleBtn.click();
        await page.waitForTimeout(350);
      }
    }
  });

  test('Generación de capturas visuales en escritorio y móvil (Gate 9)', async ({ page }) => {
    // 1. Comandos escritorio (claro y oscuro)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/comandos');
    await page.waitForSelector('app-commands-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'commands-desktop-light.png') });

    const toggleBtn = page.locator('app-header button[aria-label="Cambiar tema claro u oscuro"]');
    await toggleBtn.click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'commands-desktop-dark.png') });
    await toggleBtn.click(); // revertir a claro

    // 2. Glosario escritorio (claro y oscuro)
    await page.goto('/glosario');
    await page.waitForSelector('app-glossary-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'glossary-desktop-light.png') });

    await toggleBtn.click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'glossary-desktop-dark.png') });
    await toggleBtn.click();

    // 3. Flashcards escritorio (claro y oscuro)
    await page.goto('/flashcards');
    await page.waitForSelector('app-flashcards-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'flashcards-desktop-light.png') });

    await toggleBtn.click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'flashcards-desktop-dark.png') });
    await toggleBtn.click();

    // 4. Móvil (390 px) en Comandos
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/comandos');
    await page.waitForSelector('app-commands-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'commands-mobile-light.png') });

    await toggleBtn.click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'commands-mobile-dark.png') });
  });
});

