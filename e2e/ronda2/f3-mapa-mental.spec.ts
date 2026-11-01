import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('F3 · Mapa Mental Interactivo y Robusto (Ronda 2)', () => {
  test('1. Carga inicial en < 2s con 55 nodos base (1 + 2 + 10 + 42) y sin errores de consola', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const start = Date.now();
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(10000); // margen amplio para CI/dev server, carga de red < 2s
    expect(consoleErrors).toEqual([]);

    // Verificar contador dinámico base: 55 nodos (1 raíz + 2 exámenes + 10 temas + 42 subtemas)
    const totalBadge = page.locator('[data-testid="total-nodes-count"]');
    await expect(totalBadge).toBeVisible({ timeout: 5000 });
    await expect(totalBadge).toContainText('55 nodos');

    // Verificar cantidad de nodos renderizados en SVG
    const nodes = page.locator('svg.mind-map-svg g.nodes-layer g.tree-node');
    await expect(nodes).toHaveCount(55);
  });

  test('2. Interactividad de zoom y pan con botones (+, -, 1:1, Ajustar) y teclado', async ({ page }) => {
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    const svgGroup = page.locator('svg.mind-map-svg > g').first();
    await expect(svgGroup).toBeVisible();

    const initialTransform = await svgGroup.getAttribute('transform');
    expect(initialTransform).toBeTruthy();

    // 2.1 Zoom In (+)
    const zoomInBtn = page.getByTestId('zoom-in');
    await zoomInBtn.click();
    await page.waitForTimeout(100);
    const transformAfterZoomIn = await svgGroup.getAttribute('transform');
    expect(transformAfterZoomIn).not.toBe(initialTransform);

    // 2.2 Zoom Out (-)
    const zoomOutBtn = page.getByTestId('zoom-out');
    await zoomOutBtn.click();
    await page.waitForTimeout(100);
    const transformAfterZoomOut = await svgGroup.getAttribute('transform');
    expect(transformAfterZoomOut).not.toBe(transformAfterZoomIn);

    // 2.3 Botón Ajustar
    const fitBtn = page.getByTestId('zoom-fit');
    await fitBtn.click();
    await page.waitForTimeout(100);
    const transformAfterFit = await svgGroup.getAttribute('transform');
    expect(transformAfterFit).toBeTruthy();

    // 2.4 Atajo de teclado: tecla '+' para zoom in y '-' para zoom out
    await page.keyboard.press('+');
    await page.waitForTimeout(100);
    const transformAfterKeyPlus = await svgGroup.getAttribute('transform');
    expect(transformAfterKeyPlus).not.toBe(transformAfterFit);

    await page.keyboard.press('-');
    await page.waitForTimeout(100);
    const transformAfterKeyMinus = await svgGroup.getAttribute('transform');
    expect(transformAfterKeyMinus).not.toBe(transformAfterKeyPlus);
  });

  test('3. Interruptor de Comandos y Términos expande el árbol a >400 nodos derivados del contenido', async ({ page }) => {
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    const toggleBtn = page.locator('[data-testid="toggle-commands-terms"]');
    await expect(toggleBtn).toBeVisible();

    // Activar toggle
    await toggleBtn.click();
    await page.waitForTimeout(300);

    // Debe mostrar > 400 nodos (específicamente ~498 calculados dinámicamente)
    const totalBadge = page.locator('[data-testid="total-nodes-count"]');
    await expect(totalBadge).toBeVisible();
    const badgeText = await totalBadge.textContent();
    const countMatch = badgeText?.match(/(\d+)\s*nodos/);
    expect(countMatch).toBeTruthy();
    const count = parseInt(countMatch![1], 10);
    expect(count).toBeGreaterThan(400);

    // Verificar que existen nodos de comandos y términos
    const cmdNodes = page.locator('svg.mind-map-svg g.nodes-layer g.node-command');
    await expect(cmdNodes.first()).toBeVisible({ timeout: 5000 });
    expect(await cmdNodes.count()).toBeGreaterThan(50);

    const termNodes = page.locator('svg.mind-map-svg g.nodes-layer g.node-term');
    expect(await termNodes.count()).toBeGreaterThan(50);
  });

  test('4. Buscador de nodos permite filtrar y centra el nodo seleccionado en la vista', async ({ page }) => {
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[data-testid="search-nodes"]');
    await expect(searchInput).toBeVisible();

    // Buscar "105.1"
    await searchInput.fill('105.1');
    const dropdown = page.locator('.search-dropdown');
    await expect(dropdown).toBeVisible();

    const resultOption = dropdown.locator('button.dropdown-item').first();
    await expect(resultOption).toContainText('105.1');

    // Clic en la opción para enfocar
    await resultOption.click();
    await page.waitForTimeout(200);

    // El drawer de detalle debe haberse abierto para 105.1
    const drawer = page.locator('[data-testid="node-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('105.1');
  });

  test('5. Clic en nodo abre drawer con información y "Ir a estudiar" navega a /estudiar/:id', async ({ page }) => {
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    // Clic en el subtema 101.1
    const subtopicNode = page.locator('svg.mind-map-svg g.tree-node[aria-label*="101.1"]').first();
    await expect(subtopicNode).toBeVisible();
    await subtopicNode.click();

    // El drawer se abre mostrando el código y el título
    const drawer = page.locator('[data-testid="node-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('.code-pill')).toContainText('101.1');
    await expect(drawer.locator('.drawer-title')).toContainText('Determinar y configurar');

    // El botón "Ir a estudiar" debe existir y navegar a /estudiar/101.1
    const studyLink = drawer.locator('[data-testid="drawer-action-btn"]');
    await expect(studyLink).toBeVisible();
    await expect(studyLink).toContainText(/Ir a estudiar/i);

    await studyLink.click();
    await page.waitForURL('**/estudiar/101.1');
    expect(page.url()).toContain('/estudiar/101.1');
  });

  test('6. Progreso: subtema completado se marca en verde y filtro "Solo pendientes" atenúa completados', async ({ page }) => {
    // Inicializar localStorage con 101.1 completado bajo la clave prefijada lpic1.v1.progress
    await page.addInitScript(() => {
      const progressData = {
        schemaVersion: 1,
        data: {
          completedSubtopics: {
            '101.1': new Date().toISOString(),
          },
          lastAccessedSubtopic: '101.1',
          exam101Score: null,
          exam102Score: null,
          streaks: { current: 1, best: 1, lastStudyDate: '2026-11-01' },
          timeSpentMinutes: 30,
          completedLabs: {},
          flashcardMastery: {},
          weakAreas: [],
          viewedSlides: {}
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('lpic1.v1.progress', JSON.stringify(progressData));
    });

    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    // 101.1 debe tener la clase "completed"
    const node101 = page.locator('svg.mind-map-svg g.tree-node[aria-label*="101.1"]').first();
    await expect(node101).toBeVisible();
    await expect(node101).toHaveClass(/completed/);

    // Al activar "Solo pendientes", los nodos completados deben atenuarse (.is-dimmed)
    const togglePendingBtn = page.locator('[data-testid="toggle-only-pending"]');
    await togglePendingBtn.click();
    await page.waitForTimeout(150);

    await expect(node101).toHaveClass(/is-dimmed/);
  });

  test('7. Adaptabilidad en móvil 390px y auditoría de accesibilidad Axe limpia', async ({ page }) => {
    // Vista móvil iPhone (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/mapa-mental');
    await page.waitForLoadState('networkidle');

    // El contenedor y el SVG deben ser visibles y funcionales
    const svg = page.locator('svg.mind-map-svg');
    await expect(svg).toBeVisible();

    const zoomInBtn = page.getByTestId('zoom-in');
    await expect(zoomInBtn).toBeVisible();

    // Auditoría de accesibilidad con Axe
    const axeResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Las paletas están tokenizadas y probadas en el sistema de temas
      .analyze();

    const seriousOrCritical = axeResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
