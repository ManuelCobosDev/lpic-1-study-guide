import { chromium, Browser, Page } from 'playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  evidence?: any;
}

const results: TestResult[] = [];

async function run() {
  const browser: Browser = await chromium.launch({ headless: true });
  const capturasDir = path.resolve(process.cwd(), 'docs', 'agent', 'auditorias', 'web-2026-11-03', 'capturas');
  if (!fs.existsSync(capturasDir)) {
    fs.mkdirSync(capturasDir, { recursive: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page: Page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('--- 1. PROBANDO PORTADA DUPLICADA (S-04) Y ESPACIO MUERTO EN /estudiar/105.1 ---');
    await page.goto('http://localhost:4200/estudiar/105.1');
    await page.waitForSelector('app-slide-viewer');
    await page.waitForTimeout(500);

    // Revisar títulos en slide 1
    const slide1HeaderH1 = await page.$eval('.slide-header h1', el => el.textContent?.trim()).catch(() => null);
    const slide1Eyebrow = await page.$eval('.cover-eyebrow', el => el.textContent?.trim()).catch(() => null);
    const slide1BlockH1 = await page.$eval('.slide-blocks-area app-heading-block h1, .slide-blocks-area h1', el => el.textContent?.trim()).catch(() => null);
    const slide1BlockH2 = await page.$eval('.slide-blocks-area app-heading-block h2, .slide-blocks-area h2', el => el.textContent?.trim()).catch(() => null);

    console.log('Portada 105.1:', { slide1Eyebrow, slide1HeaderH1, slide1BlockH1, slide1BlockH2 });

    const isCoverTitleDuplicated = slide1HeaderH1 && (slide1HeaderH1 === slide1BlockH1 || slide1HeaderH1 === slide1BlockH2);
    results.push({
      name: 'S-04 Portada con título duplicado en 105.1',
      passed: !isCoverTitleDuplicated, // If duplicated, test fails
      details: `Eyebrow: "${slide1Eyebrow}", Header H1: "${slide1HeaderH1}", Block H1/H2: "${slide1BlockH1 || slide1BlockH2}"`,
      evidence: { slide1Eyebrow, slide1HeaderH1, slide1BlockH1, slide1BlockH2 }
    });

    await page.screenshot({ path: path.join(capturasDir, 'a3-105-1-portada.png') });

    console.log('--- 2. PROBANDO ATAJOS DE TECLADO (Flechas, F, T, N, ?, Esc, 1..9) ---');
    // Atajo flecha derecha (ArrowRight)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    let currentSlideText = await page.$eval('.slide-counter', el => el.textContent?.trim());
    const rightArrowWorks = currentSlideText?.includes('2 /');

    // Atajo flecha izquierda (ArrowLeft)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    currentSlideText = await page.$eval('.slide-counter', el => el.textContent?.trim());
    const leftArrowWorks = currentSlideText?.includes('1 /');

    // Atajo T (Miniaturas)
    await page.keyboard.press('t');
    await page.waitForTimeout(300);
    const thumbnailsVisibleT = await page.isVisible('.thumbnails-drawer');

    // Atajo Esc (Cerrar miniaturas)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const thumbnailsClosedEsc = !(await page.isVisible('.thumbnails-drawer'));

    // Atajo N (Notas)
    await page.keyboard.press('n');
    await page.waitForTimeout(300);
    const notesVisibleN = await page.isVisible('.notes-panel');

    // Atajo Esc (Cerrar notas)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const notesClosedEsc = !(await page.isVisible('.notes-panel'));

    // Atajo ? (Ayuda)
    await page.keyboard.press('?');
    await page.waitForTimeout(300);
    const helpVisible = await page.isVisible('.help-dialog-card');

    // Atajo Esc (Cerrar ayuda)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const helpClosedEsc = !(await page.isVisible('.help-dialog-card'));

    // Atajo número 5 (Saltar a diapositiva 5)
    await page.keyboard.press('5');
    await page.waitForTimeout(300);
    currentSlideText = await page.$eval('.slide-counter', el => el.textContent?.trim());
    const jumpTo5Works = currentSlideText?.includes('5 /');

    // Atajo F (Pantalla completa CSS/fullscreen)
    await page.keyboard.press('f');
    await page.waitForTimeout(300);
    const fullscreenActive = await page.isVisible('.fullscreen-active');
    await page.keyboard.press('f');
    await page.waitForTimeout(300);
    const fullscreenExited = !(await page.isVisible('.fullscreen-active'));

    results.push({
      name: 'Atajos de teclado',
      passed: rightArrowWorks && leftArrowWorks && thumbnailsVisibleT && thumbnailsClosedEsc && notesVisibleN && notesClosedEsc && helpVisible && helpClosedEsc && jumpTo5Works && fullscreenActive && fullscreenExited,
      details: `ArrowRight: ${rightArrowWorks}, ArrowLeft: ${leftArrowWorks}, T: ${thumbnailsVisibleT}, EscThumb: ${thumbnailsClosedEsc}, N: ${notesVisibleN}, ?: ${helpVisible}, Jump5: ${jumpTo5Works}, F: ${fullscreenActive}`
    });

    console.log('--- 3. PROBANDO DEEP LINKS (?slide=N, ?vista=web, ?q=...) ---');
    await page.goto('http://localhost:4200/estudiar/105.1?slide=7&vista=slides');
    await page.waitForTimeout(500);
    currentSlideText = await page.$eval('.slide-counter', el => el.textContent?.trim());
    const deepLinkSlide7Works = currentSlideText?.includes('7 /');

    // Verificar si cambiar de slide actualiza la URL query param
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const urlAfterArrow = page.url();
    const urlUpdatedWithSlide8 = urlAfterArrow.includes('slide=8');

    // Deep link vista=web
    await page.goto('http://localhost:4200/estudiar/105.1?vista=web');
    await page.waitForTimeout(500);
    const webViewVisible = await page.isVisible('app-lesson-web-view');
    const readingSectionsCount = await page.$$eval('.web-slide-section', els => els.length);

    results.push({
      name: 'Deep links y sincronización de URL',
      passed: deepLinkSlide7Works && urlUpdatedWithSlide8 && webViewVisible && readingSectionsCount === 19,
      details: `DeepLink slide=7: ${deepLinkSlide7Works}, URL update slide=8: ${urlUpdatedWithSlide8}, Vista Web: ${webViewVisible}, Secciones Web: ${readingSectionsCount}`
    });

    console.log('--- 4. PROBANDO PESTAÑA PRÁCTICA (Test <= 10, Flashcards <= 10, Ejercicios) ---');
    await page.goto('http://localhost:4200/estudiar/105.1');
    await page.waitForTimeout(500);

    // Hacer clic en la pestaña "Practica lo aprendido"
    const tabPracticeBtn = await page.locator('button', { hasText: 'Practica lo aprendido' });
    await tabPracticeBtn.click();
    await page.waitForTimeout(500);

    const practiceTabVisible = await page.isVisible('app-practice-tab');
    const quizSectionVisible = await page.isVisible('[data-testid="quick-quiz"]');
    const flashcardsSectionVisible = await page.isVisible('[data-testid="mini-flashcards"]');
    const exercisesSectionVisible = await page.isVisible('[data-testid="manual-exercises"]');

    // Verificar si el test tiene <= 10 preguntas y muestra feedback
    // Simular responder una pregunta
    let questionAnswerFeedbackWorks = false;
    const singleOption = await page.locator('.option-item-card').first();
    if (await singleOption.isVisible()) {
      await singleOption.click();
      const checkBtn = await page.locator('button', { hasText: 'Comprobar respuesta' });
      if (await checkBtn.isVisible()) {
        await checkBtn.click();
        await page.waitForTimeout(300);
        questionAnswerFeedbackWorks = await page.isVisible('.feedback-panel');
      }
    }

    results.push({
      name: 'Pestaña Practica lo aprendido',
      passed: practiceTabVisible && quizSectionVisible && flashcardsSectionVisible && exercisesSectionVisible && questionAnswerFeedbackWorks,
      details: `PracticeTab: ${practiceTabVisible}, Quiz: ${quizSectionVisible}, Flashcards: ${flashcardsSectionVisible}, Exercises: ${exercisesSectionVisible}, QuizFeedback: ${questionAnswerFeedbackWorks}`
    });

    console.log('--- 5. PROBANDO PANEL DE COMPLETADO AL LLEGAR A LA ÚLTIMA DIAPOSITIVA (105.1 slide 19) ---');
    await page.goto('http://localhost:4200/estudiar/105.1?slide=19');
    await page.waitForTimeout(500);

    const completionPanelVisible = await page.isVisible('[data-testid="slides-completion-panel"]');
    const goToPracticeBtn = await page.locator('[data-testid="go-to-practice-btn"]');
    let jumpsToPracticeTab = false;
    if (await goToPracticeBtn.isVisible()) {
      await goToPracticeBtn.click();
      await page.waitForTimeout(500);
      jumpsToPracticeTab = await page.isVisible('app-practice-tab');
    }

    results.push({
      name: 'Panel de completado en última diapositiva',
      passed: completionPanelVisible && jumpsToPracticeTab,
      details: `CompletionPanel: ${completionPanelVisible}, JumpToPractice: ${jumpsToPracticeTab}`
    });

    console.log('--- 6. PROBANDO COMPORTAMIENTO CON LECCIÓN ESQUELETO Y DUPLICADOS DE ID (110.1) ---');
    consoleErrors.length = 0; // reset
    await page.goto('http://localhost:4200/estudiar/110.1');
    await page.waitForTimeout(500);

    // Abrir cajón de miniaturas en 110.1
    await page.keyboard.press('t');
    await page.waitForTimeout(500);

    const thumbButtons = await page.$$('.thumbnails-drawer .thumb-btn');
    console.log(`Miniaturas encontradas en 110.1: ${thumbButtons.length}`);

    // Probar hacer clic en la miniatura 3
    if (thumbButtons.length >= 3) {
      await thumbButtons[2].click();
      await page.waitForTimeout(300);
    }
    const currentSlideIn110 = await page.$eval('.slide-counter', el => el.textContent?.trim());
    console.log('Contador en 110.1 tras miniatura 3:', currentSlideIn110);
    console.log('Errores de consola en 110.1:', consoleErrors);

    results.push({
      name: 'Comportamiento en lección 110.1 con IDs repetidos',
      passed: consoleErrors.length === 0,
      details: `Thumbnails count: ${thumbButtons.length}, SlideCounter: ${currentSlideIn110}, ConsoleErrors: ${consoleErrors.join(' | ')}`
    });

    console.log('--- 7. PROBANDO ESCALADO Y RESPONSIVE EN VIEWPORT MÓVIL (390x844) ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4200/estudiar/105.1?slide=2');
    await page.waitForTimeout(500);

    const canvasTransform = await page.$eval('.logical-canvas', el => (el as HTMLElement).style.transform);
    console.log('Transform en 390px:', canvasTransform);

    await page.screenshot({ path: path.join(capturasDir, 'a3-105-1-mobile-390.png') });

    results.push({
      name: 'Escalado móvil 390px',
      passed: !!canvasTransform && canvasTransform.includes('scale('),
      details: `Canvas transform: ${canvasTransform}`
    });

    console.log('--- 8. PROBANDO VISTA DE IMPRESIÓN (/estudiar/105.1/imprimir) ---');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:4200/estudiar/105.1/imprimir');
    await page.waitForTimeout(500);

    const printHeaderVisible = await page.isVisible('.document-header');
    const printSlidesCount = await page.$$eval('.print-slide-item, .print-section', els => els.length);
    const formatSelectVal = await page.$eval('#format-select', el => (el as HTMLSelectElement).value);

    await page.screenshot({ path: path.join(capturasDir, 'a3-105-1-imprimir.png') });

    results.push({
      name: 'Vista de impresión / PDF',
      passed: printHeaderVisible,
      details: `HeaderVisible: ${printHeaderVisible}, SectionsCount: ${printSlidesCount}, DefaultFormat: ${formatSelectVal}`
    });

  } catch (err: any) {
    console.error('Error durante la inspección:', err);
    results.push({
      name: 'Ejecución general de inspección',
      passed: false,
      details: err.message
    });
  } finally {
    await browser.close();
  }

  const outReport = path.resolve(process.cwd(), 'docs', 'agent', 'auditorias', 'web-2026-11-03', 'a3-browser-results.json');
  fs.writeFileSync(outReport, JSON.stringify(results, null, 2), 'utf-8');
  console.log('Resultados de inspección guardados en:', outReport);
}

run();
