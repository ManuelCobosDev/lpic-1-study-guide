import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import {
  FlashcardItem,
  FlashcardKind,
  DeckType
} from '../src/app/core/models/flashcard.model';
import { FlashcardsCatalogSchema } from '../src/app/core/schemas/flashcard.schema';

interface RawCommand {
  id: string;
  name: string;
  synopsis?: string;
  description: string;
  category?: string;
  subtopicIds?: string[];
  flags?: Array<{ flag: string; description: string }>;
}

interface RawGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  related?: string[];
  subtopicIds?: string[];
}

interface RawExtraCard {
  id: string;
  subtopicId: string;
  kind?: FlashcardKind;
  frontTitle: string;
  frontSubtitle?: string;
  prompt: string;
  backTitle: string;
  backDescription: string;
  source?: string[];
  hint?: string;
}

interface CurriculumData {
  topics: Array<{ id: string; examId: string }>;
  subtopics: Array<{ id: string; topicId: string }>;
}

export function generateFlashcards(rootDir: string = process.cwd()): FlashcardItem[] {
  const contentSrcDir = path.resolve(rootDir, 'content-src');
  const commandsFile = path.join(contentSrcDir, 'commands.yaml');
  const glossaryFile = path.join(contentSrcDir, 'glossary.yaml');
  const extraFile = path.join(contentSrcDir, 'flashcards-extra.yaml');
  const curriculumFile = path.join(contentSrcDir, 'curriculum.yaml');

  const commands = (yaml.load(fs.readFileSync(commandsFile, 'utf-8')) as RawCommand[]) || [];
  const glossary = (yaml.load(fs.readFileSync(glossaryFile, 'utf-8')) as RawGlossaryTerm[]) || [];
  const extraCards = fs.existsSync(extraFile)
    ? ((yaml.load(fs.readFileSync(extraFile, 'utf-8')) as RawExtraCard[]) || [])
    : [];
  const curriculum = (yaml.load(fs.readFileSync(curriculumFile, 'utf-8')) as CurriculumData) || {
    topics: [],
    subtopics: []
  };

  // Mapas de subtopic -> topic y topic -> exam
  const subtopicToTopic = new Map<string, string>();
  for (const s of curriculum.subtopics) {
    subtopicToTopic.set(s.id, s.topicId);
  }
  const topicToExam = new Map<string, '101' | '102'>();
  for (const t of curriculum.topics) {
    const exam = t.examId === '102' || parseInt(t.id, 10) >= 105 ? '102' : '101';
    topicToExam.set(t.id, exam);
  }

  const getTopicAndExam = (subtopicIds: string[]): { topicId?: string; examId?: '101' | '102' } => {
    const firstSub = subtopicIds[0];
    if (!firstSub) return {};
    const topicId = subtopicToTopic.get(firstSub) || firstSub.split('.')[0];
    const examId = topicId ? topicToExam.get(topicId) || (parseInt(topicId, 10) >= 105 ? '102' : '101') : undefined;
    return { topicId, examId };
  };

  const cards: FlashcardItem[] = [];
  const seenIds = new Set<string>();

  const registerCard = (card: FlashcardItem): void => {
    if (seenIds.has(card.id)) {
      console.warn(`[generate-flashcards] Tarjeta duplicada detectada con id: ${card.id}`);
      return;
    }
    // Verificación de longitudes (Spec 12 §12.6: front <= 140, back <= 400)
    let front = card.frontTitle;
    if (front.length > 140) {
      front = front.slice(0, 137) + '...';
    }
    let backDesc = card.backDescription;
    if (backDesc.length > 400) {
      backDesc = backDesc.slice(0, 397) + '...';
    }

    seenIds.add(card.id);
    cards.push({
      ...card,
      frontTitle: front,
      backDescription: backDesc
    });
  };

  // 1. Tarjetas de comandos (1 por comando)
  for (const cmd of commands) {
    const subtopics = cmd.subtopicIds || [];
    const { topicId, examId } = getTopicAndExam(subtopics);

    registerCard({
      id: `cmd-${cmd.id}`,
      type: 'command',
      kind: 'comando',
      frontTitle: cmd.name,
      frontSubtitle: `Comando · ${cmd.category || 'General'}`,
      prompt: '¿Cuál es la función principal de este comando y su sinopsis de uso?',
      backTitle: cmd.name,
      backDescription: cmd.description,
      backSyntax: cmd.synopsis,
      backFlags: cmd.flags,
      subtopicIds: subtopics,
      topicId,
      examId
    });

    // 2. Tarjetas por cada opción/flag documentado
    if (Array.isArray(cmd.flags)) {
      cmd.flags.forEach((f, flagIdx) => {
        if (!f.flag || f.flag.trim() === '-' || f.flag.trim() === '') return;
        const cleanFlag = f.flag.trim();
        const flagSlug = cleanFlag.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const flagId = `flag-${cmd.id}-${flagIdx}-${flagSlug}`;

        registerCard({
          id: flagId,
          type: 'flag',
          kind: 'opcion',
          frontTitle: `${cmd.name} ${cleanFlag}`,
          frontSubtitle: `Opción de comando · ${cmd.name}`,
          prompt: `¿Qué función realiza la opción ${cleanFlag} en el comando ${cmd.name}?`,
          backTitle: `${cmd.name} ${cleanFlag}`,
          backDescription: f.description,
          subtopicIds: subtopics,
          topicId,
          examId
        });
      });
    }
  }

  // 3. Tarjetas de glosario (1 por término)
  for (const term of glossary) {
    const subtopics = term.subtopicIds || [];
    const { topicId, examId } = getTopicAndExam(subtopics);

    registerCard({
      id: `term-${term.id}`,
      type: 'glossary',
      kind: 'termino',
      frontTitle: term.term,
      frontSubtitle: 'Término del Glosario',
      prompt: '¿Cuál es la definición y contexto técnico de este concepto en LPIC-1?',
      backTitle: term.term,
      backDescription: term.definition,
      relatedTerms: term.related,
      subtopicIds: subtopics,
      topicId,
      examId
    });
  }

  // 4. Tarjetas complementarias (flashcards-extra.yaml)
  for (const extra of extraCards) {
    const subtopics = extra.subtopicId ? [extra.subtopicId] : [];
    const { topicId, examId } = getTopicAndExam(subtopics);

    registerCard({
      id: extra.id,
      type: extra.kind === 'comando' ? 'command' : (extra.kind === 'termino' ? 'glossary' : 'extra'),
      kind: extra.kind || 'concepto',
      frontTitle: extra.frontTitle,
      frontSubtitle: extra.frontSubtitle || `Concepto · Subtema ${extra.subtopicId}`,
      prompt: extra.prompt,
      backTitle: extra.backTitle,
      backDescription: extra.backDescription,
      subtopicIds: subtopics,
      topicId,
      examId,
      source: extra.source,
      hint: extra.hint
    });
  }

  // Validación de esquema Zod
  const parseResult = FlashcardsCatalogSchema.safeParse(cards);
  if (!parseResult.success) {
    console.error('FAIL: El catálogo de flashcards generado no cumple el esquema Zod:', parseResult.error.format());
    throw new Error('Fallo de validación de esquema en generateFlashcards');
  }

  return cards;
}

// Invocación CLI / Compilación
const isMain = process.argv[1]?.includes('generate-flashcards');
if (isMain) {
  const rootDir = process.cwd();
  const outputDir = path.resolve(rootDir, 'public/content');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const flashcards = generateFlashcards(rootDir);
  const targetPath = path.join(outputDir, 'flashcards.json');
  fs.writeFileSync(targetPath, JSON.stringify(flashcards, null, 2), 'utf-8');

  console.log(`PASS: Se generaron ${flashcards.length} flashcards masivas en ${targetPath}.`);
}
