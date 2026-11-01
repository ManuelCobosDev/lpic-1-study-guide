import * as fs from 'node:fs';
import * as path from 'node:path';

function postbuild(): void {
  const browserDir = path.resolve(process.cwd(), 'dist/lpic1-study-guide/browser');
  const indexHtml = path.join(browserDir, 'index.html');
  const notFoundHtml = path.join(browserDir, '404.html');

  if (!fs.existsSync(indexHtml)) {
    console.warn(`WARN: postbuild no encontro ${indexHtml}. Asegurate de haber ejecutado build antes.`);
    return;
  }

  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log(`PASS: postbuild genero con exito 404.html en ${browserDir}`);
}

postbuild();

