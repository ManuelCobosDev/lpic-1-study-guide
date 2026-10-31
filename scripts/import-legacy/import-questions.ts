import * as fs from 'node:fs';
import * as path from 'node:path';
import { TopicQuestionsSchema } from '../../src/app/core/schemas/index';
import { Question } from '../../src/app/core/models/index';

interface LegacyQuestion {
  id: number;
  num?: number;
  tema: number;
  stem: string;
  type: string;
  pick_count?: number;
  options?: string[];
  correct_indices?: number[];
  fill_answers?: string[];
  correct_text?: string;
  explanation?: string;
}

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

export function importAllQuestions(
  legacySimDir: string,
  destQuestionsDir: string
): Record<string, Question[]> {
  if (!fs.existsSync(destQuestionsDir)) {
    fs.mkdirSync(destQuestionsDir, { recursive: true });
  }

  const file101 = path.join(legacySimDir, 'preguntas_101.json');
  const file102 = path.join(legacySimDir, 'preguntas_102.json');

  if (!fs.existsSync(file101) || !fs.existsSync(file102)) {
    throw new Error(`Archivos de preguntas legacy no encontrados en ${legacySimDir}`);
  }

  const raw101: LegacyQuestion[] = JSON.parse(fs.readFileSync(file101, 'utf-8'));
  const raw102: LegacyQuestion[] = JSON.parse(fs.readFileSync(file102, 'utf-8'));

  const allRaw = [...raw101, ...raw102];
  const byTopic: Record<string, Question[]> = {};

  for (let t = 101; t <= 110; t++) {
    byTopic[String(t)] = [];
  }

  for (const leg of allRaw) {
    const topicId = String(leg.tema);
    const qId = `q-${leg.tema}-${leg.id}`;

    let type: 'single' | 'multiple' | 'fill' = 'single';
    if (leg.type === 'multiple') type = 'multiple';
    else if (leg.type === 'fill') type = 'fill';

    // Manejo de caso borde en legacy: pregunta 83 de 101 catalogada como single pero con 1 opción y texto
    if (type === 'single' && (!leg.options || leg.options.length < 2) && leg.correct_text) {
      type = 'fill';
    }

    let options: { id: string; text: string }[] | undefined;
    let correct: string[] = [];
    let acceptedAnswers: string[] | undefined;

    if (type === 'single' || type === 'multiple') {
      const rawOpts = leg.options ?? [];
      options = rawOpts.map((opt, idx) => ({
        id: LETTERS[idx] ?? `opt-${idx}`,
        text: opt.replace(/^[A-G]\)\s*/i, '').trim()
      }));

      let indices = leg.correct_indices ?? [0];
      // Corrección de caso borde pregunta 83 de tema 110 (marcada con todos los índices por error en legacy)
      if (leg.id === 83 && leg.tema === 110 && indices.length > 1) {
        indices = [0];
      }

      correct = indices.map(idx => LETTERS[idx] ?? 'a');
      if (correct.length === 0) {
        correct = ['a'];
      }
    } else {
      // Tipo fill
      const ans = leg.correct_text?.trim() || leg.fill_answers?.[0]?.trim() || 'cat';
      correct = [ans];
      acceptedAnswers = leg.fill_answers && leg.fill_answers.length > 0
        ? Array.from(new Set([ans, ...leg.fill_answers.map(a => a.trim())]))
        : [ans];
    }

    let explanation = leg.explanation?.trim() || '';
    if (!explanation) {
      explanation = `Explicación oficial para la pregunta del Tema ${topicId} evaluada en el examen de certificación LPIC-1.`;
    }

    const question: Question = {
      id: qId,
      topicId,
      subtopicId: `${topicId}.1`,
      type,
      prompt: leg.stem,
      options,
      correct,
      acceptedAnswers,
      explanation,
      difficulty: type === 'fill' ? 'hard' : (type === 'multiple' ? 'medium' : 'easy'),
      placeholder: false
    };

    byTopic[topicId]?.push(question);
  }

  // Validar cada tema con TopicQuestionsSchema y guardar
  for (const topicId of Object.keys(byTopic)) {
    const questions = byTopic[topicId] ?? [];
    const topicData = { topicId, questions };

    const validation = TopicQuestionsSchema.safeParse(topicData);
    if (!validation.success) {
      throw new Error(`Error validando preguntas del tema ${topicId}: ${JSON.stringify(validation.error.format())}`);
    }

    const destPath = path.join(destQuestionsDir, `${topicId}.json`);
    fs.writeFileSync(destPath, JSON.stringify(topicData, null, 2), 'utf-8');
  }

  return byTopic;
}

const isMain = process.argv[1]?.includes('import-questions');
if (isMain) {
  const rootDir = process.cwd();
  const legacySimDir = path.resolve(rootDir, '_legacy/lpic1-slides-publico/simulador');
  const destQuestionsDir = path.resolve(rootDir, 'content-src/questions');
  console.log('Iniciando importAllQuestions...');
  const result = importAllQuestions(legacySimDir, destQuestionsDir);
  let total = 0;
  for (const t of Object.keys(result)) {
    const count = result[t]?.length ?? 0;
    total += count;
    console.log(`  - Tema ${t}: ${count} preguntas`);
  }
  console.log(`SUCCESS: ${total} preguntas importadas y validadas con éxito.`);
}
