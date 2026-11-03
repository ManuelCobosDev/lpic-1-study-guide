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

const files = walk('./src/app', ['.ts']);

const typoRules = [
  { word: 'practica', correct: 'práctica', regex: /\b(una|esta|la|tu|su|cada|de|en)\s+practica\b/i },
  { word: 'leccion', correct: 'lección', regex: /\bleccion\b/i },
  { word: 'modulo', correct: 'módulo', regex: /\bmodulo\b/i },
  { word: 'modulos', correct: 'módulos', regex: /\bmodulos\b/i },
  { word: 'numero', correct: 'número', regex: /\bnumero\b/i },
  { word: 'pagina', correct: 'página', regex: /\bpagina\b/i },
  { word: 'categoria', correct: 'categoría', regex: /\bcategoria\b/i },
  { word: 'categorias', correct: 'categorías', regex: /\bcategorias\b/i },
  { word: 'caracteristicas', correct: 'características', regex: /\bcaracteristicas\b/i },
  { word: 'parametros', correct: 'parámetros', regex: /\bparametros\b/i },
  { word: 'configuracion', correct: 'configuración', regex: /\bconfiguracion\b/i },
  { word: 'instalacion', correct: 'instalación', regex: /\binstalacion\b/i },
  { word: 'administracion', correct: 'administración', regex: /\badministracion\b/i },
  { word: 'sesion', correct: 'sesión', regex: /\bsesion\b/i },
  { word: 'definicion', correct: 'definición', regex: /\bdefinicion\b/i },
  { word: 'explicacion', correct: 'explicación', regex: /\bexplicacion\b/i },
  { word: 'terminos', correct: 'términos', regex: /\bterminos\b/i },
  { word: 'arbol', correct: 'árbol', regex: /\barbol\b/i },
  { word: 'linea', correct: 'línea', regex: /\blinea\b/i },
  { word: 'codigo', correct: 'código', regex: /\bcodigo\b/i },
  { word: 'informacion', correct: 'información', regex: /\binformacion\b/i }
];

const trueTypos = [];

for (const file of files) {
  if (file.endsWith('.spec.ts')) continue;
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');

  // Find template: `...`
  const tplMatch = text.match(/template:\s*`([^`]*)`/s);
  if (!tplMatch) continue;

  const tpl = tplMatch[1];
  const lines = tpl.split('\n');

  lines.forEach((line, idx) => {
    // Strip HTML tags and attributes to only inspect text nodes
    const textOnly = line.replace(/<[^>]*>/g, ' ').trim();
    if (!textOnly) return;
    // skip comments
    if (textOnly.startsWith('<!--') || textOnly.startsWith('//')) return;

    for (const rule of typoRules) {
      if (rule.regex.test(textOnly)) {
        // filter out css or attribute matches
        if (line.includes('class="') && line.includes(rule.word)) continue;
        trueTypos.push({
          file: rel,
          line: idx + 1,
          word: rule.word,
          correct: rule.correct,
          context: textOnly.substring(0, 100)
        });
      }
    }
  });
}

console.log('Real UI spelling issues in TS templates:', trueTypos.length);
console.log(JSON.stringify(trueTypos, null, 2));
