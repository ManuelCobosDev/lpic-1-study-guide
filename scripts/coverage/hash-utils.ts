import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { Command } from '../../src/app/core/models/command.model';
import { GlossaryTerm } from '../../src/app/core/models/glossary.model';

export function normalizeContentString(str: string): string {
  return str
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    // Remove formatting comments for stable hashing
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * Computes deterministic SHA-256 hash covering all content files associated with a subtopic.
 * Spec 11 §11.8
 */
export function computeSubtopicHash(subtopicId: string, rootDir = '.'): string {
  const hash = crypto.createHash('sha256');

  // 1. Lección (JSON o MD)
  const jsonLessonPath = path.resolve(rootDir, `content-src/lessons/${subtopicId}.json`);
  const mdLessonPath = path.resolve(rootDir, `content-src/lessons/${subtopicId}.md`);
  if (fs.existsSync(jsonLessonPath)) {
    hash.update('LESSON:');
    hash.update(normalizeContentString(fs.readFileSync(jsonLessonPath, 'utf-8')));
  } else if (fs.existsSync(mdLessonPath)) {
    hash.update('LESSON:');
    hash.update(normalizeContentString(fs.readFileSync(mdLessonPath, 'utf-8')));
  }

  // 2. Ejercicios
  const exercisesPath = path.resolve(rootDir, `content-src/exercises/${subtopicId}.yaml`);
  if (fs.existsSync(exercisesPath)) {
    hash.update('EXERCISES:');
    hash.update(normalizeContentString(fs.readFileSync(exercisesPath, 'utf-8')));
  }

  // 3. Laboratorio
  const labPath = path.resolve(rootDir, `content-src/labs/${subtopicId}.yaml`);
  if (fs.existsSync(labPath)) {
    hash.update('LAB:');
    hash.update(normalizeContentString(fs.readFileSync(labPath, 'utf-8')));
  }

  // 4. Ledger
  const ledgerPath = path.resolve(rootDir, `content-src/coverage/${subtopicId}.ledger.yaml`);
  if (fs.existsSync(ledgerPath)) {
    hash.update('LEDGER:');
    hash.update(normalizeContentString(fs.readFileSync(ledgerPath, 'utf-8')));
  }

  // 5. Preguntas del subtema
  const topicId = subtopicId.split('.')[0];
  const questionsPath = path.resolve(rootDir, `content-src/questions/${topicId}.yaml`);
  if (fs.existsSync(questionsPath)) {
    try {
      const qData = yaml.load(fs.readFileSync(questionsPath, 'utf-8')) as { questions?: Array<{ subtopicId?: string }> };
      const subtopicQuestions = (qData?.questions || []).filter(q => q.subtopicId === subtopicId);
      hash.update('QUESTIONS:');
      hash.update(JSON.stringify(subtopicQuestions));
    } catch {
      // fallback
    }
  }

  // 6. Flashcards extra
  const flashcardsPath = path.resolve(rootDir, 'content-src/flashcards-extra.yaml');
  if (fs.existsSync(flashcardsPath)) {
    try {
      const fcData = yaml.load(fs.readFileSync(flashcardsPath, 'utf-8')) as Array<{ subtopicId?: string }>;
      const subtopicFc = (Array.isArray(fcData) ? fcData : []).filter(f => f.subtopicId === subtopicId);
      hash.update('FLASHCARDS:');
      hash.update(JSON.stringify(subtopicFc));
    } catch {
      // fallback
    }
  }

  // 7. Comandos asociados
  const commandsPath = path.resolve(rootDir, 'content-src/commands.yaml');
  if (fs.existsSync(commandsPath)) {
    try {
      const cmds = yaml.load(fs.readFileSync(commandsPath, 'utf-8')) as Command[];
      const relevantCmds = (Array.isArray(cmds) ? cmds : []).filter(c => c.subtopicIds?.includes(subtopicId));
      hash.update('COMMANDS:');
      hash.update(JSON.stringify(relevantCmds));
    } catch {
      // fallback
    }
  }

  // 8. Términos de glosario asociados
  const glossaryPath = path.resolve(rootDir, 'content-src/glossary.yaml');
  if (fs.existsSync(glossaryPath)) {
    try {
      const terms = yaml.load(fs.readFileSync(glossaryPath, 'utf-8')) as GlossaryTerm[];
      const relevantTerms = (Array.isArray(terms) ? terms : []).filter(t => t.subtopicIds?.includes(subtopicId));
      hash.update('GLOSSARY:');
      hash.update(JSON.stringify(relevantTerms));
    } catch {
      // fallback
    }
  }

  return 'sha256:' + hash.digest('hex');
}

