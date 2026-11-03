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

const files = walk('./src/app', ['.ts', '.html']);

// Patterns to look for in Spanish text (ignoring code, imports, variable names)
const spellingChecks = [
  { word: 'practica', correct: 'práctica', regex: /\b(una|esta|la|tu|su|cada|nuestra)\s+practica\b|\bpracticas\b/i },
  { word: 'leccion', correct: 'lección', regex: /\bleccion\b/i },
  { word: 'lecciones', correct: 'lecciones', regex: /\blecciónes\b/i },
  { word: 'modulo', correct: 'módulo', regex: /\bmodulo\b/i },
  { word: 'modulos', correct: 'módulos', regex: /\bmodulos\b/i },
  { word: 'numero', correct: 'número', regex: /\bnumero\b|\bnumeros\b/i },
  { word: 'pagina', correct: 'página', regex: /\bpagina\b|\bpaginas\b/i },
  { word: 'categoria', correct: 'categoría', regex: /\bcategoria\b|\bcategorias\b/i },
  { word: 'guia', correct: 'guía', regex: /\bguia\b|\bguias\b/i },
  { word: 'caracteristicas', correct: 'características', regex: /\bcaracteristicas\b/i },
  { word: 'parametros', correct: 'parámetros', regex: /\bparametros\b/i },
  { word: 'configuracion', correct: 'configuración', regex: /\bconfiguracion\b/i },
  { word: 'instalacion', correct: 'instalación', regex: /\binstalacion\b/i },
  { word: 'administracion', correct: 'administración', regex: /\badministracion\b/i },
  { word: 'sesion', correct: 'sesión', regex: /\bsesion\b/i },
  { word: 'definicion', correct: 'definición', regex: /\bdefinicion\b/i },
  { word: 'explicacion', correct: 'explicación', regex: /\bexplicacion\b/i },
  { word: 'termino', correct: 'término', regex: /\bun|este|el|cada\s+termino\b|\bterminos\b/i },
  { word: 'arbol', correct: 'árbol', regex: /\barbol\b/i },
  { word: 'linea', correct: 'línea', regex: /\blinea\b|\blineas\b/i },
  { word: 'codigo', correct: 'código', regex: /\bcodigo\b/i },
  { word: 'informacion', correct: 'información', regex: /\binformacion\b/i },
  { word: 'mas', correct: 'más', regex: /\bmas\s+(de|que|facil|dificil|rapido|lento|tarde|adelante)\b/i }
];

const results = [];

for (const file of files) {
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');

  lines.forEach((line, idx) => {
    // skip imports, css classes, variables
    if (line.trim().startsWith('import ') || line.trim().startsWith('export interface') || line.trim().startsWith('class ')) return;
    
    // Check only string literals or HTML template content
    for (const check of spellingChecks) {
      if (check.regex.test(line)) {
        // filter out matches in tag names or URLs
        if (/https?:\/\//.test(line) && line.indexOf(check.word) > line.indexOf('http')) continue;
        results.push({
          file: rel,
          line: idx + 1,
          word: check.word,
          correct: check.correct,
          context: line.trim().substring(0, 120)
        });
      }
    }
  });
}

console.log('Spelling issues found:', results.length);
console.log(JSON.stringify(results.slice(0, 30), null, 2));

fs.writeFileSync(
  './docs/agent/auditorias/web-2026-11-03/spelling-issues.json',
  JSON.stringify(results, null, 2)
);
