import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Poner tema oscuro
  await page.goto('http://localhost:4200/estudiar/105.1/imprimir');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(500);

  // Emular media print
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);

  // Evaluar color de texto computado de un título en print
  const h1Color = await page.$eval('h1', el => window.getComputedStyle(el).color);
  const bodyBg = await page.$eval('body', el => window.getComputedStyle(el).backgroundColor);
  console.log('En modo oscuro con @media print:');
  console.log('h1 color:', h1Color);
  console.log('body background:', bodyBg);

  // Capturar PDF o screenshot emulando print
  await page.screenshot({ path: 'docs/agent/auditorias/web-2026-11-03/capturas/a3-print-dark-mode.png' });

  await browser.close();
}

main().catch(console.error);
