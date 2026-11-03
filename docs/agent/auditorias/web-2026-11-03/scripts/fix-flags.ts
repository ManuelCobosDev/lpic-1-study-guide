import * as fs from 'node:fs';
import * as yaml from 'js-yaml';
import { parseCommandsHtml } from '../../../../../scripts/import-legacy/import-commands-glossary';

const htmlPath = '_legacy/Recurso Final Definitivo/app/comandos.html';
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const legacyCmds = parseCommandsHtml(htmlContent);
const legacyMap = new Map<string, any>();
for (const cmd of legacyCmds) {
  legacyMap.set(cmd.name, cmd);
  legacyMap.set(cmd.id, cmd);
}

const yamlPath = 'content-src/commands.yaml';
const currentCmds = yaml.load(fs.readFileSync(yamlPath, 'utf8')) as any[];

let recoveredFlags = 0;
let discardedBadFlags = 0;

for (const cmd of currentCmds) {
  if (!cmd.flags || !Array.isArray(cmd.flags)) continue;

  const legacy = legacyMap.get(cmd.name) || legacyMap.get(cmd.id);
  const newFlags: { flag: string; description: string }[] = [];

  for (let i = 0; i < cmd.flags.length; i++) {
    const f = cmd.flags[i];
    if (f.flag === '-' || f.flag === '--' || !f.flag || f.flag.trim() === '') {
      // Buscar en legacy si tiene una bandera con esa descripción o en esa posición
      const match = legacy?.flags?.find((lf: any) =>
        lf.description === f.description ||
        (f.description && lf.description && (lf.description.includes(f.description) || f.description.includes(lf.description)))
      ) || legacy?.flags?.[i];

      if (match && match.flag && match.flag !== '-' && match.flag !== '--') {
        newFlags.push({
          flag: match.flag,
          description: f.description || match.description
        });
        recoveredFlags++;
      } else {
        discardedBadFlags++;
      }
    } else {
      newFlags.push(f);
    }
  }

  cmd.flags = newFlags;
}

fs.writeFileSync(yamlPath, yaml.dump(currentCmds), 'utf8');

console.log('Recovered flags with real syntax:', recoveredFlags);
console.log('Discarded unrecoverable empty flags:', discardedBadFlags);

// Verificación
let remainingBad = 0;
for (const cmd of currentCmds) {
  if (cmd.flags) {
    for (const f of cmd.flags) {
      if (f.flag === '-' || f.flag === '--' || !f.flag || f.flag.trim() === '') {
        remainingBad++;
      }
    }
  }
}
console.log('Remaining bad flags in commands.yaml:', remainingBad);
