import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runImportLegacy } from './import-legacy/index';

function fileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

describe('Idempotencia del Importador Legacy (Gate 2)', () => {
  const rootDir = process.cwd();
  const tempTestDir = path.resolve(os.tmpdir(), `lpic-test-import-idempotent-${Date.now()}`);
  const tempContentSrc = path.join(tempTestDir, 'content-src');
  const tempOutputDir = path.join(tempTestDir, 'public-content');

  beforeAll(() => {
    fs.mkdirSync(tempContentSrc, { recursive: true });
    fs.mkdirSync(tempOutputDir, { recursive: true });
    // buildContent necesita curriculum.yaml
    fs.copyFileSync(
      path.resolve(rootDir, 'content-src/curriculum.yaml'),
      path.join(tempContentSrc, 'curriculum.yaml')
    );
  });

  afterAll(() => {
    try {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    } catch {
      // Ignorar errores de borrado de directorio temporal
    }
  });

  const filesToCheck = [
    path.resolve(tempContentSrc, 'lessons/103.4.json'),
    path.resolve(tempContentSrc, 'labs/103.4.json'),
    path.resolve(tempContentSrc, 'questions/103.json'),
    path.resolve(tempContentSrc, 'commands.yaml'),
    path.resolve(tempContentSrc, 'glossary.yaml')
  ];

  it('ejecutar el importador dos veces consecutivas debe producir resultados 100% identicos', () => {
    // Primera ejecucion
    runImportLegacy({ contentSrcDir: tempContentSrc, outputDir: tempOutputDir });
    const hashesFirstRun = filesToCheck.map(f => ({ file: f, hash: fileHash(f) }));

    // Segunda ejecucion
    runImportLegacy({ contentSrcDir: tempContentSrc, outputDir: tempOutputDir });
    const hashesSecondRun = filesToCheck.map(f => ({ file: f, hash: fileHash(f) }));

    for (let i = 0; i < filesToCheck.length; i++) {
      expect(hashesSecondRun[i]?.hash).toBe(hashesFirstRun[i]?.hash);
    }
  });
});

