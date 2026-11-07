import { chromium } from 'playwright';
import * as http from 'node:http';
import * as path from 'node:path';
import * as fs from 'node:fs';

const PORT = 4207;
const DIST_DIR = path.resolve(process.cwd(), 'dist/lpic1-study-guide/browser');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function createStaticServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url ? req.url.split('?')[0] || '/' : '/';
      let filePath = path.join(DIST_DIR, urlPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function captureO3() {
  const server = await createStaticServer();
  const outputDir = path.resolve(process.cwd(), 'docs/agent/auditorias/web-2026-11-03/capturas/o3-after');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    console.log('Capturing O3 visual proofs on http://localhost:' + PORT);

    // 1. Bloque HTML visible en 101.1 slide 2
    const pageDesktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await pageDesktop.goto(`http://localhost:${PORT}/estudiar/101.1?slide=2&vista=slides`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForSelector('app-html-block', { timeout: 10000 });
    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({ path: path.join(outputDir, '01-html-block-101-1-slide2.png') });

    // 2. Portada limpia sin títulos duplicados en 101.1 slide 1
    await pageDesktop.goto(`http://localhost:${PORT}/estudiar/101.1?slide=1&vista=slides`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForSelector('.slide-header h1', { timeout: 10000 });
    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({ path: path.join(outputDir, '02-portada-limpia-101-1.png') });

    // 3. Diapositiva con tabla densa controlada en 103.4 slide 12
    await pageDesktop.goto(`http://localhost:${PORT}/estudiar/103.4?slide=12&vista=slides`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForSelector('app-table-block', { timeout: 10000 });
    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({ path: path.join(outputDir, '03-tabla-densa-103-4-slide12.png') });

    // 4. Cabecera a 1280px (sin textos partidos)
    await pageDesktop.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForSelector('app-header', { timeout: 10000 });
    await pageDesktop.waitForTimeout(300);
    await pageDesktop.screenshot({ path: path.join(outputDir, '04-cabecera-1280px.png') });

    // 5. Cabecera en tablet 768px (ordenada, sin roturas de línea)
    const pageTablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await pageTablet.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await pageTablet.waitForSelector('app-header', { timeout: 10000 });
    await pageTablet.waitForTimeout(300);
    await pageTablet.screenshot({ path: path.join(outputDir, '05-cabecera-768px-tablet.png') });

    // 6. Mapa mental con zoom legible inicial
    await pageDesktop.goto(`http://localhost:${PORT}/mapa-mental`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForSelector('svg.mind-map-svg', { timeout: 10000 });
    await pageDesktop.waitForTimeout(600);
    await pageDesktop.screenshot({ path: path.join(outputDir, '06-mapa-mental-zoom-legible.png') });

    console.log('PASS: O3 screenshots successfully captured in', outputDir);
  } finally {
    await browser.close();
    server.close();
  }
}

captureO3().catch((err) => {
  console.error(err);
  process.exit(1);
});

