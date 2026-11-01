import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { checkTokens } from './check-tokens.js';

describe('checkTokens', () => {
  it('debe pasar limpiamente sobre el codigo base actual en src/', () => {
    const result = checkTokens();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debe fallar y reportar error al introducir un color literal #fff en un componente', () => {
    const tempDir = path.resolve(process.cwd(), 'src/_test_temp_tokens');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'sample.component.ts');

    try {
      fs.writeFileSync(tempFile, 'const badColor = "#fff";\n', 'utf-8');
      const result = checkTokens(tempDir);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('#fff'))).toBe(true);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    }
  });
});

