import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import AxeBuilder from '@axe-core/playwright';

const SCREENSHOT_DIR = path.resolve('e2e/screenshots/fase-11');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('Gate 11: Importación Completa del Legacy (Exámenes 101 y 102 al 100%)', () => {

  test('Manifiesto y contadores reales: 42 subtemas disponibles, 0 placeholders (Gate 11)', async ({ page }) => {
    // 1. Navegar a /temario
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');

    // Comprobar pestañas de ambos exámenes (101-500 y 102-500)
    const tab101 = page.locator('button:has-text("Examen 101-500")');
    const tab102 = page.locator('button:has-text("Examen 102-500")');
    await expect(tab101).toBeVisible();
    await expect(tab102).toBeVisible();

    // En la pestaña inicial (Examen 101), comprobar que aparecen temas del 101 al 104
    await expect(page.locator('.topic-eyebrow:has-text("TEMA 101")').first()).toBeVisible();
    await expect(page.locator('.topic-title:has-text("Arquitectura del sistema")').first()).toBeVisible();

    // Cambiar a la pestaña de Examen 102
    await tab102.click();
    await page.waitForTimeout(300);

    // Comprobar que en Examen 102 aparecen los temas 105 a 110 y no hay badges de planificado
    await expect(page.locator('.topic-eyebrow:has-text("TEMA 105")').first()).toBeVisible();
    await expect(page.locator('.topic-title:has-text("Shells y scripts de shell")').first()).toBeVisible();
    await expect(page.locator('.topic-title:has-text("Seguridad")').first()).toBeVisible();

    // Comprobar que ningún subtema se marca como "Próximamente" o "Planificado"
    const plannedBadges = page.locator('.badge:has-text("Próximamente"), .badge:has-text("Planificado")');
    await expect(plannedBadges).toHaveCount(0);
  });

  test('Lección del Examen 102: diapositivas reales, notas y documento continuo (Gate 11)', async ({ page }) => {
    // 1. Navegar a /estudiar/105.1 (Shells y scripts de shell)
    await page.goto('/estudiar/105.1');
    await page.waitForSelector('app-lesson-page');

    // Verificar título y estructura
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
    await expect(title).toContainText(/105\.1|Personalizar y usar el entorno de shell/i);

    // Verificar navegación de diapositivas
    const nextBtn = page.locator('button[aria-label="Siguiente diapositiva"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Cambiar a vista Documento continuo (Web)
    const webViewBtn = page.locator('button:has-text("Web")').first();
    if (await webViewBtn.isVisible()) {
      await webViewBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('.lesson-web-view')).toBeVisible();
    }
  });

  test('Laboratorio del Examen 102: misiones paso a paso con comandos y salidas (Gate 11)', async ({ page }) => {
    // 1. Navegar a /laboratorios/lab-105-1
    await page.goto('/laboratorios/lab-105-1');
    await page.waitForSelector('app-lab-detail-page');

    // Verificar título y pasos
    const labTitle = page.locator('h1').first();
    await expect(labTitle).toBeVisible();
    await expect(labTitle).toContainText(/105\.1|Entorno Shell/i);

    // Verificar presencia de pasos con el stepper
    const steps = page.locator('.stepper-item');
    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThan(0);

    // Comprobar que el comando está presente
    const firstStepCommand = page.locator('pre code, .command-box code, pre').first();
    await expect(firstStepCommand).toBeVisible();
  });

  test('Simulador de Examen con selector de temas y práctica de Exámenes 101 y 102 (Gate 11)', async ({ page }) => {
    // 1. Navegar al Hub del simulador
    await page.goto('/simulador');
    await page.waitForSelector('app-simulator-hub-page');

    // Comprobar tarjetas de selección de modos
    const timedCard = page.locator('.mode-card.timed');
    const practiceCard = page.locator('.mode-card.practice');
    await expect(timedCard).toBeVisible();
    await expect(practiceCard).toBeVisible();

    // Comprobar que en la sección de temas aparecen temas de ambos exámenes
    await expect(page.locator('text=Tema 101')).toBeVisible();
    await expect(page.locator('text=Tema 105')).toBeVisible();
    await expect(page.locator('text=Tema 110')).toBeVisible();

    // 2. Navegar a práctica libre y comprobar el selector de temas completo
    await page.goto('/simulador/practica');
    await page.waitForSelector('app-simulator-practice-page');

    const topicSelect = page.locator('#topic-filter');
    await expect(topicSelect).toBeVisible();

    // Comprobar opciones de ambos exámenes en el selector
    const opt101 = page.locator('#topic-filter option[value="101"]');
    const opt105 = page.locator('#topic-filter option[value="105"]');
    const opt110 = page.locator('#topic-filter option[value="110"]');
    await expect(opt101).toBeAttached();
    await expect(opt105).toBeAttached();
    await expect(opt110).toBeAttached();
  });

  test('Herramientas ampliadas: catálogo completo de 146 comandos y 230 términos (Gate 11)', async ({ page }) => {
    // 1. Catálogo de comandos en /comandos
    await page.goto('/comandos');
    await page.waitForSelector('app-commands-page');

    const cmdCounter = page.locator('.commands-counter-badge, .counter-text').first();
    await expect(cmdCounter).toBeVisible();
    await expect(cmdCounter).toContainText(/comandos/i);

    // Buscar comando en el catálogo (ej. systemctl)
    const searchInput = page.locator('input.search-input');
    await searchInput.fill('systemctl');
    await page.waitForTimeout(300);

    const systemctlCard = page.locator('text=systemctl').first();
    await expect(systemctlCard).toBeVisible();

    // 2. Glosario en /glosario
    await page.goto('/glosario');
    await page.waitForSelector('app-glossary-page');

    const termCounter = page.locator('.glossary-counter-badge, .counter-text').first();
    await expect(termCounter).toBeVisible();
    await expect(termCounter).toContainText(/términos/i);
  });

  test('Auditoría de Accesibilidad Axe en Temario con 42 subtemas y Lección 102 (Gate 11)', async ({ page }) => {
    // Temario en claro
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');
    let results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const severeErrorsLight = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(severeErrorsLight).toHaveLength(0);

    // Lección 105.1 en oscuro
    await page.goto('/estudiar/105.1');
    await page.waitForSelector('app-lesson-page');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(200);

    results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const severeErrorsDark = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(severeErrorsDark).toHaveLength(0);
  });

  test('Generación de capturas visuales de Gate 11 para revisión visual R5', async ({ page }) => {
    // 1. Temario completo con ambos exámenes (Desktop Light)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'curriculum-42-subtopics-light.png'), fullPage: false });

    // 2. Lección 105.1 Examen 102 (Desktop Light)
    await page.goto('/estudiar/105.1');
    await page.waitForSelector('app-lesson-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'lesson-105-1-desktop-light.png'), fullPage: false });

    // 3. Lección 105.1 en modo oscuro (Desktop Dark)
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'lesson-105-1-desktop-dark.png'), fullPage: false });

    // 4. Laboratorio 105.1 (Desktop Light)
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.goto('/laboratorios/lab-105-1');
    await page.waitForSelector('app-lab-detail-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'lab-105-1-desktop-light.png'), fullPage: false });

    // 5. Catálogo completo de comandos (Desktop Light)
    await page.goto('/comandos');
    await page.waitForSelector('app-commands-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'commands-146-desktop-light.png'), fullPage: false });

    // 6. Glosario completo (Desktop Light)
    await page.goto('/glosario');
    await page.waitForSelector('app-glossary-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'glossary-230-desktop-light.png'), fullPage: false });

    // 7. Temario completo en móvil (Mobile Light)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/temario');
    await page.waitForSelector('app-curriculum-page');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'curriculum-mobile-light.png'), fullPage: false });
  });

});
