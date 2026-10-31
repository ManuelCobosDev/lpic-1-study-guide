import * as fs from 'node:fs';
import * as path from 'node:path';

export interface CheckBoundariesResult {
  valid: boolean;
  errors: string[];
}

const DOMAIN_SERVICES = [
  'ContentService',
  'ProgressService',
  'LabsService',
  'SimulatorService',
  'FlashcardsService',
  'ActivityService',
  'NotesService',
  'BackupService',
  'SearchService'
];

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllTsFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export function checkBoundaries(appDir = path.resolve(process.cwd(), 'src/app')): CheckBoundariesResult {
  const errors: string[] = [];
  const files = getAllTsFiles(appDir);
  const baseDir = path.resolve(process.cwd());

  for (const file of files) {
    const rel = path.relative(baseDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);

    // Regla 5: Solo storage.service.ts puede usar localStorage
    const isStorageService = rel.endsWith('core/services/storage.service.ts');
    if (!isStorageService && /\blocalStorage\b/.test(content)) {
      lines.forEach((line, idx) => {
        if (/\blocalStorage\b/.test(line)) {
          errors.push(`${rel}:${idx + 1} - Uso no autorizado de localStorage fuera de StorageService.`);
        }
      });
    }

    // Regla 1: core/engines y core/selectors no importan @angular/*
    if (rel.includes('core/engines/') || rel.includes('core/selectors/')) {
      lines.forEach((line, idx) => {
        if (/from\s+['"]@angular\//.test(line)) {
          errors.push(`${rel}:${idx + 1} - Motor o selector puro no debe importar @angular/*`);
        }
      });
    }

    // Regla 2: core/** no importa de shared ni de features
    if (rel.includes('/core/')) {
      lines.forEach((line, idx) => {
        if (/from\s+['"][^'"]*(shared|features)\b/.test(line)) {
          errors.push(`${rel}:${idx + 1} - core no debe importar de shared ni de features`);
        }
      });
    }

    // Regla 3: shared/** no importa de features
    if (rel.includes('/shared/')) {
      lines.forEach((line, idx) => {
        if (/from\s+['"][^'"]*features\b/.test(line)) {
          errors.push(`${rel}:${idx + 1} - shared no debe importar de features`);
        }
      });
    }

    // Regla 4: Una feature no importa de otra feature
    const featureMatch = rel.match(/\/features\/([^/]+)\//);
    if (featureMatch) {
      const currentFeature = featureMatch[1];
      lines.forEach((line, idx) => {
        const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
        if (importMatch && importMatch[1]) {
          const importPath = importMatch[1];
          if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath).replace(/\\/g, '/');
            const targetFeatureMatch = resolvedPath.match(/\/features\/([^/]+)/);
            if (targetFeatureMatch && targetFeatureMatch[1] && targetFeatureMatch[1] !== currentFeature) {
              errors.push(`${rel}:${idx + 1} - Feature "${currentFeature}" no debe importar de feature "${targetFeatureMatch[1]}"`);
            }
          } else {
            const targetFeatureMatch = importPath.match(/(?:^|\/)features\/([^/]+)/);
            if (targetFeatureMatch && targetFeatureMatch[1] && targetFeatureMatch[1] !== currentFeature) {
              errors.push(`${rel}:${idx + 1} - Feature "${currentFeature}" no debe importar de feature "${targetFeatureMatch[1]}"`);
            }
          }
        }
      });
    }

    // Regla 6: Componentes presentacionales no inyectan servicios de dominio
    const isPresentational = rel.includes('/shared/') || rel.includes('/components/');
    if (isPresentational) {
      DOMAIN_SERVICES.forEach((srv) => {
        const srvRegex = new RegExp(`\\b(inject\\s*\\(\\s*${srv}|${srv}\\b.*constructor)`);
        lines.forEach((line, idx) => {
          if (srvRegex.test(line)) {
            errors.push(`${rel}:${idx + 1} - Componente presentacional no debe inyectar servicio de dominio "${srv}"`);
          }
        });
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Ejecucion CLI
if (process.argv[1] && path.resolve(process.argv[1]).includes('check-boundaries')) {
  const result = checkBoundaries();
  if (!result.valid) {
    console.error('FAIL: Se detectaron violaciones de fronteras arquitectonicas:');
    result.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('PASS: check-boundaries valido todas las fronteras arquitectonicas.');
  }
}

