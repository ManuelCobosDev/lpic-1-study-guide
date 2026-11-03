import { chromium } from 'playwright';

async function testPopover() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing wiki popover on /estudiar/105.1...');
  await page.goto('http://localhost:4200/estudiar/105.1');
  await page.waitForLoadState('networkidle');

  // Go forward 1 or 2 slides if slide 1 is title
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);

  const termLinks = page.locator('a.term-link, a.wiki-ref, [data-term-ref]');
  const count = await termLinks.count();
  console.log('Term links found in slide 2:', count);

  if (count > 0) {
    const text = await termLinks.first().innerText();
    console.log('Clicking term link:', text);
    await termLinks.first().click();
    await page.waitForTimeout(500);

    const popover = page.locator('app-wiki-popover');
    const popoverVisible = await popover.isVisible();
    console.log('Popover visible:', popoverVisible);

    if (popoverVisible) {
      const footerLink = popover.locator('.term-link-card a').last();
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

testPopover().catch(console.error);
