import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { checkBoundaries } from './check-boundaries.js';

describe('checkBoundaries', () => {
  it('debe pasar limpiamente sobre la estructura actual de src/app', () => {
    const result = checkBoundaries();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debe fallar si core importa desde features', () => {
    const tempDir = path.resolve(process.cwd(), 'src/app/core/_test_temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'illegal.ts');

    try {
      fs.writeFileSync(tempFile, 'import { SomeFeature } from "../../features/home";\n', 'utf-8');
      const result = checkBoundaries();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('core no debe importar de shared ni de features'))).toBe(true);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    }
  });

  it('debe fallar si un archivo ajeno a storage.service.ts usa localStorage', () => {
    const tempDir = path.resolve(process.cwd(), 'src/app/shared/_test_temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'illegal-storage.ts');

    try {
      fs.writeFileSync(tempFile, 'const val = localStorage.getItem("test");\n', 'utf-8');
      const result = checkBoundaries();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('localStorage'))).toBe(true);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    }
  });

  it('debe fallar si core/engines importa de @angular/*', () => {
    const tempDir = path.resolve(process.cwd(), 'src/app/core/engines/_test_temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'illegal-engine.ts');

    try {
      fs.writeFileSync(tempFile, 'import { inject } from "@angular/core";\n', 'utf-8');
      const result = checkBoundaries();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('@angular/*'))).toBe(true);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    }
  });
});

