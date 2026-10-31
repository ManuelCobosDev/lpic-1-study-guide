import * as fs from 'node:fs';
import * as path from 'node:path';

export interface CheckTokensResult {
  valid: boolean;
  errors: string[];
}

const COLOR_PATTERNS = [
  /#(?:[0-9a-fA-F]{3,4}){1,2}\b/,
  /\b(?:rgb|rgba|hsl|hsla)\s*\(/,
  /\b(?:bg|text|border|fill|stroke)-\[#(?:[0-9a-fA-F]{3,4}){1,2}\]/
];

const ALLOWED_FILES = new Set([
  path.normalize('src/styles/tokens.css'),
  path.normalize('src/styles/themes.css'),
  path.normalize('styles/tokens.css'),
  path.normalize('styles/themes.css'),
  'tokens.css',
  'themes.css'
]);

function scanDirectory(dir: string, baseDir: string, errors: string[]): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, baseDir, errors);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!['.ts', '.html', '.css', '.scss'].includes(ext)) {
        continue;
      }

      if (ALLOWED_FILES.has(relPath) || ALLOWED_FILES.has(entry.name)) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        for (const pattern of COLOR_PATTERNS) {
          const match = line.match(pattern);
          if (match) {
            errors.push(`${relPath}:${i + 1} - Color literal prohibido encontrado: "${match[0]}"`);
          }
        }
      }
    }
  }
}

export function checkTokens(srcDir = path.resolve(process.cwd(), 'src')): CheckTokensResult {
  const errors: string[] = [];
  scanDirectory(srcDir, path.resolve(process.cwd()), errors);
  return {
    valid: errors.length === 0,
    errors
  };
}

// Ejecucion directa como CLI
if (process.argv[1] && path.resolve(process.argv[1]).includes('check-tokens')) {
  const result = checkTokens();
  if (!result.valid) {
    console.error('FAIL: Se encontraron colores literales fuera de tokens.css / themes.css:');
    result.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('PASS: check-tokens no detecto colores literales en src/.');
  }
}

