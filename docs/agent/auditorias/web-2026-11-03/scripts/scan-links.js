import fs from 'node:fs';
import path from 'node:path';

function walk(dir, ext) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath, ext));
      } else {
        if (ext.some(e => fullPath.endsWith(e))) results.push(fullPath);
      }
    }
  } catch (err) {
    console.error('Error walking ' + dir, err);
  }
  return results;
}

const validRoutePatterns = [
  /^\/$/,
  /^\/temario$/,
  /^\/temario\/(101|102)$/,
  /^\/temario\/(101|102)\/(10[1-9]|110)$/,
  /^\/estudiar\/(10[1-9]|110)\.[1-9]$/,
  /^\/estudiar\/(10[1-9]|110)\.[1-9]\/imprimir$/,
  /^\/laboratorios$/,
  /^\/laboratorios\/lab-(10[1-9]|110)-[1-9]$/,
  /^\/simulador$/,
  /^\/simulador\/examen$/,
  /^\/simulador\/practica$/,
  /^\/simulador\/resultados$/,
  /^\/comandos$/,
  /^\/glosario$/,
  /^\/flashcards$/,
  /^\/mapa-mental$/,
  /^\/buscar$/,
  /^\/progreso$/,
  /^\/erratas$/,
  /^\/ajustes$/,
  /^\/acerca-de$/,
  /^\/guia-estilos$/
];

function isValidAppRoute(url) {
  if (!url) return false;
  const clean = url.split('?')[0].split('#')[0];
  return validRoutePatterns.some(pattern => pattern.test(clean));
}

// 1. Scan src
const srcFiles = walk('./src', ['.ts', '.html']);
const foundRouterLinks = [];
const foundHrefs = [];

const rlRegex = /routerLink=["']([^"']+)["']/g;
const rlBindingRegex = /\[routerLink\]="([^"]+)"/g;
const hrefRegex = /href=["']([^"']+)["']/g;

for (const file of srcFiles) {
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');

  let match;
  while ((match = rlRegex.exec(text)) !== null) {
    foundRouterLinks.push({ link: match[1], file: rel, line: text.substring(0, match.index).split('\n').length });
  }
  while ((match = rlBindingRegex.exec(text)) !== null) {
    foundRouterLinks.push({ binding: match[1], file: rel, line: text.substring(0, match.index).split('\n').length });
  }
  while ((match = hrefRegex.exec(text)) !== null) {
    foundHrefs.push({ href: match[1], file: rel, line: text.substring(0, match.index).split('\n').length });
  }
}

console.log('Total routerLink matches in src:', foundRouterLinks.length);
console.log('Total href matches in src:', foundHrefs.length);

const invalidRouterLinks = [];
for (const r of foundRouterLinks) {
  if (r.link) {
    if (!r.link.startsWith('/')) {
      // relative link or expression
    } else if (!isValidAppRoute(r.link)) {
      invalidRouterLinks.push(r);
    }
  }
}

console.log('\n--- POTENTIALLY INVALID STATIC ROUTERLINKS IN SRC ---');
console.log(JSON.stringify(invalidRouterLinks, null, 2));

console.log('\n--- UNIQUE STATIC ROUTERLINKS ---');
const uniqueRL = Array.from(new Set(foundRouterLinks.map(r => r.link).filter(Boolean))).sort();
console.log(uniqueRL);

console.log('\n--- UNIQUE HREFS IN SRC ---');
const uniqueHrefs = Array.from(new Set(foundHrefs.map(h => h.href))).sort();
console.log(uniqueHrefs);

fs.writeFileSync(
  './docs/agent/auditorias/web-2026-11-03/scan-links-report.json',
  JSON.stringify({ foundRouterLinks, foundHrefs, invalidRouterLinks, uniqueRL, uniqueHrefs }, null, 2)
);
console.log('Report written to scan-links-report.json');
