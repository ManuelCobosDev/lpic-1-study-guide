import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { runImportLegacy } from './import-legacy/index';

function fileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

describe('Idempotencia del Importador Legacy (Gate 2)', () => {
  const rootDir = process.cwd();
  const filesToCheck = [
    path.resolve(rootDir, 'content-src/lessons/103.4.json'),
    path.resolve(rootDir, 'content-src/labs/103.4.json'),
    path.resolve(rootDir, 'content-src/questions/103.json'),
    path.resolve(rootDir, 'content-src/commands.yaml'),
    path.resolve(rootDir, 'content-src/glossary.yaml')
  ];

  it('ejecutar el importador dos veces consecutivas debe producir resultados 100% identicos', () => {
    // Primera ejecucion
    runImportLegacy();
    const hashesFirstRun = filesToCheck.map(f => ({ file: f, hash: fileHash(f) }));

    // Segunda ejecucion
    runImportLegacy();
    const hashesSecondRun = filesToCheck.map(f => ({ file: f, hash: fileHash(f) }));

    for (let i = 0; i < filesToCheck.length; i++) {
      expect(hashesSecondRun[i]?.hash).toBe(hashesFirstRun[i]?.hash);
    }
  });
});

