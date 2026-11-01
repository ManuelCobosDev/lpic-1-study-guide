import * as fs from 'node:fs';
import * as path from 'node:path';
import { LabSchema } from '../../src/app/core/schemas/index';
import { Lab, LabStep } from '../../src/app/core/models/index';
import { ALL_SUBTOPIC_IDS } from './import-lessons';

export function parseMarkdownLab(mdContent: string, subtopicId: string): Lab {
  const lines = mdContent.split('\n');

  // Title: line starting with "# "
  let title = `Práctica ${subtopicId} — Laboratorio Oficial LPIC-1`;
  const h1Line = lines.find(l => l.startsWith('# '));
  if (h1Line) {
    title = h1Line.replace('# ', '').trim();
  }

  // Estimated minutes
  let estimatedMinutes = 30;
  const timeMatch = mdContent.match(/⏱\s*\*\*(\d+)\s*min\*\*/i);
  if (timeMatch && timeMatch[1]) {
    estimatedMinutes = parseInt(timeMatch[1], 10);
  }

  // Difficulty
  let difficulty: 'basic' | 'intermediate' | 'advanced' = 'basic';
  if (/avanzado/i.test(mdContent)) {
    difficulty = 'advanced';
  } else if (/intermedio/i.test(mdContent)) {
    difficulty = 'intermediate';
  }

  // Steps / Misiones
  const steps: LabStep[] = [];
  // Split by "### Misión" or "### Reto"
  const missionChunks = mdContent.split(/(?=###\s+(?:Misión|Reto))/gi);

  let stepNumber = 1;
  for (const chunk of missionChunks) {
    if (!chunk.trim().startsWith('###')) continue;

    const chunkLines = chunk.trim().split('\n');
    const headerLine = chunkLines[0] ?? '';
    const missionTitle = headerLine.replace(/^###\s+/, '').trim();

    // Extraer bloque bash
    let command = '';
    const bashMatch = chunk.match(/```bash([\s\S]*?)```/);
    if (bashMatch && bashMatch[1]) {
      command = bashMatch[1].trim();
    }

    // Extraer instrucción / contexto
    let instruction = `Completa las acciones indicadas en la ${missionTitle} sobre tu máquina virtual Debian.`;
    const contextMatch = chunk.match(/\*\*Contexto[^*]*\*\*:?\s*([^\n]+(?:\n[^\n]+)?)/i);
    if (contextMatch && contextMatch[1]) {
      instruction = contextMatch[1].trim();
    }

    // Extraer salida esperada
    let expectedOutput = 'Verifica que la terminal ejecuta los comandos sin errores y muestra las líneas esperadas.';
    const outputMatch = chunk.match(/(?:👀\s*\*\*Qué debes observar[^*]*\*\*|\*\*Salida esperada[^*]*\*\*):?\s*([\s\S]*?)(?=\n\n|\n📸|\n###|$)/i);
    if (outputMatch && outputMatch[1]) {
      expectedOutput = outputMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Clave de examen o consejo
    let examAlert: string | undefined;
    const alertMatch = chunk.match(/(?:🎯|💡)\s*(?:\*\*[^*]+\*\*:?)?\s*([^\n]+)/i);
    if (alertMatch && alertMatch[1]) {
      examAlert = alertMatch[1].trim();
    }

    steps.push({
      id: `step-${subtopicId.replace('.', '-')}-${stepNumber}`,
      stepNumber,
      title: missionTitle,
      instruction,
      command: command || undefined,
      expectedOutput: expectedOutput || undefined,
      examAlert
    });

    stepNumber++;
  }

  // Fallback si el markdown no usó formato ### Misión
  if (steps.length === 0) {
    steps.push({
      id: `step-${subtopicId.replace('.', '-')}-1`,
      stepNumber: 1,
      title: `Misión 1: Configuración y verificación de ${subtopicId}`,
      instruction: `Ejecuta los comandos fundamentales del objetivo ${subtopicId} en tu entorno de pruebas Debian.`,
      command: `man ${subtopicId.replace('.', '_')}`,
      expectedOutput: 'El sistema despliega la documentación y sintaxis oficial de las herramientas.'
    });
  }

  return {
    id: `lab-${subtopicId.replace('.', '-')}`,
    subtopicId,
    title,
    estimatedMinutes,
    difficulty,
    type: 'subtopic',
    placeholder: false,
    steps
  };
}

export function importAllLabs(legacyPracticasDir: string, destLabsDir: string): Lab[] {
  if (!fs.existsSync(destLabsDir)) {
    fs.mkdirSync(destLabsDir, { recursive: true });
  }

  const files = fs.readdirSync(legacyPracticasDir);
  const importedLabs: Lab[] = [];

  for (const subtopicId of ALL_SUBTOPIC_IDS) {
    const prefix = `p-${subtopicId.replace('.', '-')}-`;
    const targetFile = files.find(f => f.startsWith(prefix) && f.endsWith('.md'));

    if (!targetFile) {
      throw new Error(`No se encontró práctica en ${legacyPracticasDir} para el subtema ${subtopicId} (buscado: ${prefix}*.md)`);
    }

    const mdPath = path.join(legacyPracticasDir, targetFile);
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const lab = parseMarkdownLab(mdContent, subtopicId);

    const validation = LabSchema.safeParse(lab);
    if (!validation.success) {
      throw new Error(`Error validando Lab ${subtopicId}: ${JSON.stringify(validation.error.format())}`);
    }

    const destPath = path.join(destLabsDir, `${subtopicId}.json`);
    fs.writeFileSync(destPath, JSON.stringify(lab, null, 2), 'utf-8');
    importedLabs.push(lab);
  }

  return importedLabs;
}

const isMain = process.argv[1]?.includes('import-labs');
if (isMain) {
  const rootDir = process.cwd();
  const legacyDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/practicas-v2');
  const destDir = path.resolve(rootDir, 'content-src/labs');
  console.log('Iniciando importAllLabs...');
  const labs = importAllLabs(legacyDir, destDir);
  let totalSteps = 0;
  for (const l of labs) totalSteps += l.steps.length;
  console.log(`SUCCESS: ${labs.length} laboratorios y ${totalSteps} pasos de misión importados con éxito.`);
}

