import { chromium } from 'playwright';
import * as http from 'node:http';
import * as path from 'node:path';
import * as fs from 'node:fs';

const PORT = 4205;
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

async function captureO2() {
  const server = await createStaticServer();
  const outputDir = path.resolve(process.cwd(), 'docs/agent/auditorias/web-2026-11-03/capturas/o2-after');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Capturing O2 screenshots on http://localhost:' + PORT);

  try {
    // 1. Home (Examen 102 disponible, FAQ honesta, chips 101-110)
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '01-home.png'), fullPage: true });

    // 2. Erratas (enlaces a /estudiar/:id)
    await page.goto(`http://localhost:${PORT}/erratas`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '02-erratas.png'), fullPage: true });

    // 3. Detalle de tema 101 (Misión Integradora apuntando a lab guiado)
    await page.goto(`http://localhost:${PORT}/temario/101/101`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '03-tema-101.png'), fullPage: true });

    // 4. Breadcrumbs en estudio (/estudiar/105.1)
    await page.goto(`http://localhost:${PORT}/estudiar/105.1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '04-estudiar-105-1-breadcrumbs.png') });

    console.log('PASS: O2 screenshots captured in', outputDir);
  } finally {
    await browser.close();
    server.close();
  }
}

captureO2().catch((err) => {
  console.error(err);
  process.exit(1);
});
