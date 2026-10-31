import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';

const ManifestSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  stats: z.object({
    slides: z.number().nonnegative(),
    subtopics: z.number().nonnegative(),
    labs: z.number().nonnegative(),
    questions: z.number().nonnegative(),
    commands: z.number().nonnegative(),
    terms: z.number().nonnegative()
  }),
  exams: z.array(z.any()),
  topics: z.array(z.any()),
  subtopics: z.array(z.any())
});

export function buildContent(validateOnly = false): void {
  const contentDir = path.resolve(process.cwd(), 'public/content');
  const manifestPath = path.join(contentDir, 'manifest.json');

  if (validateOnly) {
    if (!fs.existsSync(manifestPath)) {
      console.error(`FAIL: No se encontro el manifiesto en ${manifestPath}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const result = ManifestSchema.safeParse(parsed);
    if (!result.success) {
      console.error('FAIL: El contenido de manifest.json no es valido segun el esquema Zod:', result.error);
      process.exit(1);
    }
    console.log('PASS: validate:content valido correctamente public/content/manifest.json.');
    return;
  }

  // Generacion base (Fase 0)
  fs.mkdirSync(contentDir, { recursive: true });
  const initialManifest = {
    version: '0.1.0',
    generatedAt: new Date().toISOString(),
    stats: {
      slides: 0,
      subtopics: 0,
      labs: 0,
      questions: 0,
      commands: 0,
      terms: 0
    },
    exams: [],
    topics: [],
    subtopics: []
  };

  fs.writeFileSync(manifestPath, JSON.stringify(initialManifest, null, 2), 'utf-8');
  console.log(`PASS: build:content genero el manifiesto inicial en ${manifestPath}`);
}

const isValidate = process.argv.includes('--validate');
buildContent(isValidate);

