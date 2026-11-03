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

const findings = {
  proximamente: [],
  faseN: [],
  usted: [],
  hardcodedNumbers: [],
  branding: [],
  possibleTypos: []
};

for (const file of files) {
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Próximamente / Proximamente
    if (/pr[oó]ximamente/i.test(line)) {
      findings.proximamente.push({ file: rel, lineNum, text: line.trim() });
    }

    // Fase N (internal development phases leaked)
    if (/fase\s+\d+/i.test(line)) {
      findings.faseN.push({ file: rel, lineNum, text: line.trim() });
    }

    // Formal 'usted' / 'su' vs informal 'tu' / 'tú'
    // Look for phrases like "su progreso", "usted puede", "haga clic", "seleccione", "inicie" vs "tu progreso", "puedes", "haz clic"
    if (/\b(su\s+progreso|usted|haga\s+clic|seleccione|inicie)\b/i.test(line)) {
      findings.usted.push({ file: rel, lineNum, text: line.trim() });
    }

    // Branding variations: "LPIC-1 Aula", "Study Guide", "Aula Virtual", "LPIC-1 Guía"
    if (/LPIC-1\s+(Aula|Study Guide|Guía|Guia)/i.test(line)) {
      findings.branding.push({ file: rel, lineNum, text: line.trim() });
    }
  });
}

console.log('--- PROXIMAMENTE (' + findings.proximamente.length + ') ---');
console.log(JSON.stringify(findings.proximamente, null, 2));

console.log('\n--- FASE N (' + findings.faseN.length + ') ---');
console.log(JSON.stringify(findings.faseN, null, 2));

console.log('\n--- BRANDING (' + findings.branding.length + ') ---');
console.log(JSON.stringify(findings.branding, null, 2));

console.log('\n--- USTED (FORMAL) (' + findings.usted.length + ') ---');
console.log(JSON.stringify(findings.usted.slice(0, 20), null, 2));

fs.writeFileSync(
  './docs/agent/auditorias/web-2026-11-03/copy-audit.json',
  JSON.stringify(findings, null, 2)
);
