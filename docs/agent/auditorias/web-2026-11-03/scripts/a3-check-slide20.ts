import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:4200/estudiar/105.1?slide=20');
  await page.waitForTimeout(500);

  const counter = await page.$eval('.slide-counter', el => el.textContent?.trim());
  const completion = await page.isVisible('[data-testid="slides-completion-panel"]');
  console.log('Slide counter on slide 20:', counter);
  console.log('Completion panel visible on slide 20:', completion);

  // Click completion button
  const practiceBtn = page.locator('[data-testid="go-to-practice-btn"]');
  await practiceBtn.click();
  await page.waitForTimeout(500);

  const practiceActive = await page.isVisible('app-practice-tab');
  console.log('Jumps to practice tab successfully:', practiceActive);

  // Take screenshot of completion panel
  await page.screenshot({ path: 'docs/agent/auditorias/web-2026-11-03/capturas/a3-105-1-slide20-completion.png' });

  await browser.close();
}

main().catch(console.error);
