import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Testing /temario/101/101 lab mission integradora link...');
  await page.goto('http://localhost:4200/temario/101/101');
  await page.waitForLoadState('networkidle');

  // Look for "Iniciar misión integradora →" button
  const missionBtn = page.locator('text=Iniciar misión integradora');
  const missionExists = await missionBtn.count() > 0;
  console.log('Mission button found:', missionExists);
  if (missionExists) {
    const href = await missionBtn.getAttribute('href');
    console.log('Mission button href:', href);
    await missionBtn.click();
    await page.waitForTimeout(1000);
    console.log('URL after clicking mission button:', page.url());
    const errorText = await page.locator('text=Error').allTextContents();
    console.log('Page error text:', errorText);
  }

  console.log('\n2. Testing /erratas subtopic link...');
  await page.goto('http://localhost:4200/erratas');
  await page.waitForLoadState('networkidle');
  const errataSubtopicLink = page.locator('.subtopic-link').first();
  const errataCount = await errataSubtopicLink.count();
  console.log('Errata subtopic links count:', errataCount);
  if (errataCount > 0) {
    const href = await errataSubtopicLink.getAttribute('href');
    console.log('Errata subtopic link href:', href);
    await errataSubtopicLink.click();
    await page.waitForTimeout(1000);
    console.log('URL after clicking errata link:', page.url());
    const is404 = await page.locator('text=404').count() > 0 || await page.locator('text=Página no encontrada').count() > 0;
    console.log('Is 404 page displayed:', is404);
  }

  console.log('\n3. Testing Breadcrumbs on /mapa-mental...');
  await page.goto('http://localhost:4200/mapa-mental');
  await page.waitForLoadState('networkidle');
  const breadcrumbItems = await page.locator('app-breadcrumbs ol li').allTextContents();
  console.log('Breadcrumbs on /mapa-mental:', breadcrumbItems.map(s => s.trim()));

  console.log('\n4. Testing Breadcrumbs on /estudiar/105.1...');
  await page.goto('http://localhost:4200/estudiar/105.1');
  await page.waitForLoadState('networkidle');
  const studyCrumbs = await page.locator('app-breadcrumbs ol li').allTextContents();
  console.log('Breadcrumbs on /estudiar/105.1:', studyCrumbs.map(s => s.trim()));

  // Click on the intermediate 'Estudiar' crumb
  const estudiarCrumb = page.locator('app-breadcrumbs a:has-text("Estudiar")');
  if (await estudiarCrumb.count() > 0) {
    const estudiarHref = await estudiarCrumb.getAttribute('href');
    console.log('Estudiar crumb href:', estudiarHref);
    await estudiarCrumb.click();
    await page.waitForTimeout(1000);
    console.log('URL after clicking Estudiar crumb:', page.url());
    const is404 = await page.locator('text=404').count() > 0 || await page.locator('text=Página no encontrada').count() > 0;
    console.log('Did clicking Estudiar crumb go to 404:', is404);
  }

  console.log('\n5. Testing Mobile Menu toggle at 390x844...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4200/');
  await page.waitForLoadState('networkidle');
  const searchBtnText = await page.locator('app-header app-button[routerlink="/buscar"]').innerText();
  console.log('Mobile search button visible text:', JSON.stringify(searchBtnText.trim()));
  const menuToggle = page.locator('button[aria-label="Abrir menú de navegación"]');
  console.log('Menu toggle exists:', await menuToggle.count() > 0);
  await menuToggle.click();
  await page.waitForTimeout(500);
  const mobileLinks = await page.locator('app-header .md\\:hidden a').allTextContents();
  console.log('Mobile menu links:', mobileLinks.map(s => s.trim()).filter(Boolean));

  await browser.close();
}

run().catch(console.error);
