import { test } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

test('Generación de capturas de evidencia de los 6 fallos para R0', async ({ page }) => {
  const outDir = path.resolve(process.cwd(), 'e2e/screenshots/r2-R0');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // F1: Simulador sin selector 102
  await page.goto('/simulador');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, 'f1-simulador-hub.png') });

  // F2: Flashcards con solo 3 mazos básicos y sin explorador
  await page.goto('/flashcards');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, 'f2-flashcards-deck.png') });

  // F3: Mapa mental con zoom inactivo y sin detalle de comandos/términos
  await page.goto('/mapa-mental');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, 'f3-mapa-mental.png') });

  // F4 y F5: Lección sin autoenlaces interactivos estilo Wikipedia ni cobertura PDF
  await page.goto('/estudiar/105.1?vista=slides');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, 'f4-subtema-105-1-slides.png') });
  await page.screenshot({ path: path.join(outDir, 'f5-enlaces-ausentes.png') });

  // F6: Solo 3 pestañas bajo la lección (falta "Practica lo aprendido")
  await page.goto('/estudiar/105.1');
  await page.waitForLoadState('networkidle');
  const tabs = page.locator('.lesson-secondary-tabs-section');
  if (await tabs.isVisible()) {
    await tabs.scrollIntoViewIfNeeded();
  }
  await page.screenshot({ path: path.join(outDir, 'f6-pestana-faltante.png') });
});
