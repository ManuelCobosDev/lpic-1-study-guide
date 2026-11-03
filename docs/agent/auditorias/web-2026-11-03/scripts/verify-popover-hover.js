import { chromium } from 'playwright';

async function testPopoverHover() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing wiki popover hover on /estudiar/105.1...');
  await page.goto('http://localhost:4200/estudiar/105.1');
  await page.waitForLoadState('networkidle');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);

  const termLinks = page.locator('a.term-link, a.wiki-ref, [data-term-ref]');
  const count = await termLinks.count();
  console.log('Term links found in slide 2:', count);

  if (count > 0) {
    const text = await termLinks.first().innerText();
    console.log('Hovering term link:', text);
    await termLinks.first().hover();
    await page.waitForTimeout(600); // 300ms debounce

    const popover = page.locator('app-wiki-popover .term-link-card');
    const popoverVisible = await popover.isVisible();
    console.log('Popover visible after hover:', popoverVisible);

    if (popoverVisible) {
      const footerLink = popover.locator('a').last();
      const href = await footerLink.getAttribute('href');
      console.log('Popover footer link href in DOM:', href);
      await footerLink.click();
      await page.waitForTimeout(1000);
      console.log('URL after clicking popover footer link:', page.url());
      const is404 = await page.locator('text=404').count() > 0 || await page.locator('text=Página no encontrada').count() > 0;
      console.log('Is 404 page after popover click:', is404);
    }
  }

  await browser.close();
}

testPopoverHover().catch(console.error);
