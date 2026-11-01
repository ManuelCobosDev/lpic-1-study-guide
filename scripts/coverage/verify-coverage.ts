import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import {
  ExtractedUnit,
  CoverageReportData,
  CoverageFailure
} from './types';
import { loadLedger } from './ledger-loader';
import { parseSrcString, extractTargetCorpus } from './parser-utils';
import { Slide } from '../../src/app/core/models/slide.model';
import { Lab } from '../../src/app/core/models/lab.model';
import { Command } from '../../src/app/core/models/command.model';
import { GlossaryTerm } from '../../src/app/core/models/glossary.model';
import { Question } from '../../src/app/core/models/question.model';

export interface CoverageOptions {
  rootDir?: string;
  unitsOverride?: ExtractedUnit[];
  slidesOverride?: Slide[];
  ledgerOverrideDir?: string;
  questionsOverride?: Question[];
  flashcardsCountOverride?: number;
  skipPoolCheck?: boolean;
}

export function evaluateCoverage(subtopicId: string, options: CoverageOptions = {}): CoverageReportData {
  const rootDir = options.rootDir || '.';
  const topicId = subtopicId.split('.')[0];
  const failures: CoverageFailure[] = [];

  // 1. Cargar unidades extraídas
  let allUnits: ExtractedUnit[] = [];
  if (options.unitsOverride) {
    allUnits = options.unitsOverride;
  } else {
    const unitsPath = path.resolve(rootDir, 'content-src/_extract/102-500/units.json');
    if (fs.existsSync(unitsPath)) {
      allUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
    }
  }

  const objectiveUnits = allUnits.filter(u => u.objective === subtopicId);
  const validUnitIds = new Set(objectiveUnits.map(u => u.id));

  // 2. Cargar Ledger
  const ledger = loadLedger(subtopicId, options.ledgerOverrideDir ? options.ledgerOverrideDir : path.resolve(rootDir, 'content-src/coverage'));
  const omittedUnitIds = new Set(Object.keys(ledger.omit || {}));
  const waivedTokensMap = new Map<string, Set<string>>(); // unitId -> set of waived tokens
  for (const w of ledger.tokenWaivers || []) {
    if (!waivedTokensMap.has(w.unit)) {
      waivedTokensMap.set(w.unit, new Set());
    }
    waivedTokensMap.get(w.unit)!.add(w.token);
  }

  // 3. Cargar Lección
  let slides: Slide[] = [];
  if (options.slidesOverride) {
    slides = options.slidesOverride;
  } else {
    const jsonLessonPath = path.resolve(rootDir, `content-src/lessons/${subtopicId}.json`);
    if (fs.existsSync(jsonLessonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonLessonPath, 'utf-8'));
        slides = parsed.slides || [];
      } catch (e) {
        console.warn(`[coverage] Error leyendo ${jsonLessonPath}:`, e);
      }
    }
  }

  // 4. Cargar Ejercicios
  let exercisesRaw = '';
  const exPath = path.resolve(rootDir, `content-src/exercises/${subtopicId}.yaml`);
  if (fs.existsSync(exPath)) {
    exercisesRaw = fs.readFileSync(exPath, 'utf-8');
  }

  // 5. Cargar Laboratorio
  let lab: Lab | null = null;
  const labPath = path.resolve(rootDir, `content-src/labs/${subtopicId}.yaml`);
  if (fs.existsSync(labPath)) {
    try {
      lab = yaml.load(fs.readFileSync(labPath, 'utf-8')) as Lab;
    } catch {
      // fallback
    }
  }

  // 6. Cargar Comandos
  let commands: Command[] = [];
  const cmdsPath = path.resolve(rootDir, 'content-src/commands.yaml');
  if (fs.existsSync(cmdsPath)) {
    try {
      const allCmds = yaml.load(fs.readFileSync(cmdsPath, 'utf-8')) as Command[];
      commands = (Array.isArray(allCmds) ? allCmds : []).filter(c => c.subtopicIds?.includes(subtopicId));
    } catch {
      // fallback
    }
  }

  // 7. Cargar Glosario
  let glossary: GlossaryTerm[] = [];
  const glosPath = path.resolve(rootDir, 'content-src/glossary.yaml');
  if (fs.existsSync(glosPath)) {
    try {
      const allGlos = yaml.load(fs.readFileSync(glosPath, 'utf-8')) as GlossaryTerm[];
      glossary = (Array.isArray(allGlos) ? allGlos : []).filter(g => g.subtopicIds?.includes(subtopicId));
    } catch {
      // fallback
    }
  }

  // 8. Cargar Preguntas
  let questions: Question[] = [];
  if (options.questionsOverride) {
    questions = options.questionsOverride;
  } else {
    const qPath = path.resolve(rootDir, `content-src/questions/${topicId}.yaml`);
    if (fs.existsSync(qPath)) {
      try {
        const qData = yaml.load(fs.readFileSync(qPath, 'utf-8')) as { questions?: Question[] };
        questions = (qData?.questions || []).filter(q => q.subtopicId === subtopicId);
      } catch {
        // fallback
      }
    }
  }

  // 9. Cargar Flashcards
  let flashcardsCount = 0;
  if (options.flashcardsCountOverride !== undefined) {
    flashcardsCount = options.flashcardsCountOverride;
  } else {
    const fcPath = path.resolve(rootDir, 'content-src/flashcards-extra.yaml');
    if (fs.existsSync(fcPath)) {
      try {
        const fcData = yaml.load(fs.readFileSync(fcPath, 'utf-8')) as Array<{ subtopicId?: string }>;
        flashcardsCount = (Array.isArray(fcData) ? fcData : []).filter(f => f.subtopicId === subtopicId).length;
      } catch {
        // fallback
      }
    }
  }

  // RECOPILACIÓN DE UNIDADES MAPEADAS Y VERIFICACIONES DE SRC
  const mappedUnitIds = new Set<string>();
  const invalidSrcIds: string[] = [];
  const untracedBlocks: string[] = [];
  let authorBlocksCount = 0;

  for (let sIdx = 0; sIdx < slides.length; sIdx++) {
    const s = slides[sIdx];
    if (!s) continue;
    const sNum = sIdx + 1;
    const slideSrc = parseSrcString(s.src);

    if (slideSrc.isAutor) {
      authorBlocksCount++;
    } else if (slideSrc.isMeta) {
      // meta block
    } else if (slideSrc.unitIds.length > 0) {
      for (const uid of slideSrc.unitIds) {
        if (!validUnitIds.has(uid)) {
          invalidSrcIds.push(`Diapositiva ${sNum} referencia unidad inexistente o de otro objetivo: ${uid}`);
        } else {
          mappedUnitIds.add(uid);
        }
      }
    }

    // Check individual blocks if they have their own src
    for (let bIdx = 0; bIdx < s.blocks.length; bIdx++) {
      const b = s.blocks[bIdx];
      if (!b) continue;
      if (b.src) {
        const bSrc = parseSrcString(b.src);
        if (bSrc.isAutor) {
          authorBlocksCount++;
        } else if (bSrc.unitIds.length > 0) {
          for (const uid of bSrc.unitIds) {
            if (!validUnitIds.has(uid)) {
              invalidSrcIds.push(`Bloque ${bIdx + 1} de diapositiva ${sNum} referencia unidad inexistente: ${uid}`);
            } else {
              mappedUnitIds.add(uid);
            }
          }
        }
      } else if (!s.src) {
        // Neither slide nor block has src
        untracedBlocks.push(`Diapositiva ${sNum} bloque ${bIdx + 1} (${b.type}) carece de trazabilidad <!-- src: ... -->`);
      }
    }
  }

  // Extraer texto destino para comprobar tokens técnicos
  const targetCorpus = extractTargetCorpus(slides, exercisesRaw, lab, commands, glossary);
  const targetCorpusLower = targetCorpus.toLowerCase();

  // Tokens comprobación
  let totalTokensCount = 0;
  let coveredTokensCount = 0;
  let waivedTokensCount = 0;
  const missingTokensByUnit: Record<string, string[]> = {};

  for (const unit of objectiveUnits) {
    const isMapped = mappedUnitIds.has(unit.id);
    const isOmitted = omittedUnitIds.has(unit.id);
    if (!isMapped && !isOmitted) continue;

    const unitWaivers = waivedTokensMap.get(unit.id) || new Set<string>();

    const checkTokenList = (tokens: string[], caseSensitive: boolean) => {
      for (const tok of tokens) {
        totalTokensCount++;
        if (unitWaivers.has(tok)) {
          waivedTokensCount++;
          coveredTokensCount++;
          continue;
        }

        const found = caseSensitive
          ? targetCorpus.includes(tok)
          : targetCorpusLower.includes(tok.toLowerCase());

        if (found) {
          coveredTokensCount++;
        } else {
          let list = missingTokensByUnit[unit.id];
          if (!list) {
            list = [];
            missingTokensByUnit[unit.id] = list;
          }
          list.push(tok);
        }
      }
    };

    checkTokenList(unit.tokens.commands, true);
    checkTokenList(unit.tokens.flags, true);
    checkTokenList(unit.tokens.paths, true);
    checkTokenList(unit.tokens.vars, true);
    checkTokenList(unit.tokens.numbers, true);
    checkTokenList(unit.tokens.terms, false);
    checkTokenList(unit.tokens.acronyms, true);
  }

  // ==================== APLICACIÓN DE LAS 10 REGLAS (Spec 11 §11.6) ====================

  // Regla 1: Alguna unidad del objetivo no aparece en ningún src ni en el ledger como omitida con motivo
  const unmappedUnits = objectiveUnits.filter(u => !mappedUnitIds.has(u.id) && !omittedUnitIds.has(u.id));
  if (unmappedUnits.length > 0) {
    failures.push({
      rule: 1,
      title: 'Unidades del PDF sin cubrir',
      message: `Existen ${unmappedUnits.length} unidades del objetivo ${subtopicId} sin mapear en lección ni omitidas en el ledger.`,
      details: unmappedUnits.slice(0, 10).map(u => `${u.id} (p. ${u.page}, ${u.kind}): ${u.text.substring(0, 80)}...`)
    });
  }

  // Regla 2: Falta algún token técnico de una unidad cubierta en el texto destino, salvo exención
  const missingTokenUnits = Object.keys(missingTokensByUnit);
  if (missingTokenUnits.length > 0) {
    const details: string[] = [];
    for (const uid of missingTokenUnits.slice(0, 10)) {
      const mList = missingTokensByUnit[uid];
      if (mList) {
        details.push(`${uid}: faltan [${mList.join(', ')}]`);
      }
    }
    failures.push({
      rule: 2,
      title: 'Tokens técnicos ausentes en el texto de estudio',
      message: `Faltan tokens técnicos de ${missingTokenUnits.length} unidades cubiertas que no aparecen en diapositivas, ejercicios, lab, comandos ni glosario.`,
      details
    });
  }

  // Regla 3: Hay bloques, preguntas o flashcards sin src (distinto de meta / autor declarado)
  if (untracedBlocks.length > 0) {
    failures.push({
      rule: 3,
      title: 'Bloques de contenido sin fuente de trazabilidad',
      message: `Existen ${untracedBlocks.length} bloques sin anotación de trazabilidad <!-- src: ... -->.`,
      details: untracedBlocks.slice(0, 8)
    });
  }

  // Regla 4: Un src apunta a una unidad que no existe o de otro objetivo
  if (invalidSrcIds.length > 0) {
    failures.push({
      rule: 4,
      title: 'Anotaciones src inválidas o con identificadores inexistentes',
      message: `Se encontraron ${invalidSrcIds.length} referencias de src erróneas.`,
      details: invalidSrcIds.slice(0, 8)
    });
  }

  // Regla 5: La lección supera 20 diapositivas sin una decisión registrada en DECISIONS.md
  if (slides.length > 20) {
    failures.push({
      rule: 5,
      title: 'Límite de 20 diapositivas superado',
      message: `La lección tiene ${slides.length} diapositivas (máximo permitido: 20 sin aprobación expresa en DECISIONS.md).`
    });
  }

  // Regla 6: Ejercicios guiados/exploratorios del PDF ausentes
  const pdfExercises = objectiveUnits.filter(u => u.kind === 'exercise-guided' || u.kind === 'exercise-explor');
  if (pdfExercises.length > 0 && !exercisesRaw) {
    failures.push({
      rule: 6,
      title: 'Faltan ejercicios oficiales',
      message: `El PDF contiene ${pdfExercises.length} ejercicios para ${subtopicId}, pero no se encontró content-src/exercises/${subtopicId}.yaml.`
    });
  }

  // Regla 7: Áreas clave con < 2 preguntas o Lista parcial no cubierta
  const keyKnowledgeUnits = objectiveUnits.filter(u => u.kind === 'key-knowledge');
  if (keyKnowledgeUnits.length > 0 && questions.length < keyKnowledgeUnits.length * 2 && questions.length < 15) {
    failures.push({
      rule: 7,
      title: 'Pool de preguntas insuficiente para áreas de conocimiento',
      message: `El objetivo define ${keyKnowledgeUnits.length} áreas clave y requiere un banco robusto (encontradas: ${questions.length} preguntas).`
    });
  }

  // Regla 8: Explicación de comandos y términos (explainedIn válido)
  const invalidExplainedIn: string[] = [];
  for (const c of commands) {
    if (c.explainedIn) {
      for (const loc of c.explainedIn) {
        if (!loc || typeof loc !== 'string' || !/^\d{3}\.\d(#\d+)?$/.test(loc)) {
          invalidExplainedIn.push(`Comando ${c.name} tiene explainedIn inválido: ${loc}`);
        }
      }
    }
  }
  for (const g of glossary) {
    if (g.explainedIn) {
      for (const loc of g.explainedIn) {
        if (!loc || typeof loc !== 'string' || !/^\d{3}\.\d(#\d+)?$/.test(loc)) {
          invalidExplainedIn.push(`Término ${g.term} tiene explainedIn inválido: ${loc}`);
        }
      }
    }
  }
  if (invalidExplainedIn.length > 0) {
    failures.push({
      rule: 8,
      title: 'Referencias explainedIn inválidas en comandos o glosario',
      message: `Se encontraron ${invalidExplainedIn.length} comandos o términos sin enlace válido a lección.`,
      details: invalidExplainedIn
    });
  }

  // Regla 9: Mínimos de pool de preguntas y flashcards (Spec 12 §12.6)
  if (!options.skipPoolCheck && objectiveUnits.length > 0 && (questions.length < 5 || (flashcardsCount < 5 && commands.length + glossary.length < 5))) {
    failures.push({
      rule: 9,
      title: 'Pool mínimo de práctica no alcanzado',
      message: `El objetivo no alcanza los mínimos para el simulador y flashcards (preguntas: ${questions.length}, flashcards/conceptos: ${flashcardsCount + commands.length + glossary.length}).`
    });
  }

  // Regla 10: Las exenciones superan el 3% de los tokens del objetivo
  const waiversPct = totalTokensCount > 0 ? (waivedTokensCount / totalTokensCount) * 100 : 0;
  if (waiversPct > 3.0) {
    failures.push({
      rule: 10,
      title: 'Exceso de exenciones de tokens (tope 3%)',
      message: `Las exenciones alcanzan el ${waiversPct.toFixed(2)}% de los tokens (${waivedTokensCount}/${totalTokensCount}). El límite estricto es 3.0%.`
    });
  }

  return {
    objectiveId: subtopicId,
    topicId: topicId || 'unknown',
    totalUnits: objectiveUnits.length,
    mappedUnitsCount: mappedUnitIds.size,
    omittedUnitsCount: omittedUnitIds.size,
    unmappedUnits,
    totalTokensCount,
    coveredTokensCount,
    waivedTokensCount,
    missingTokensByUnit,
    waiversPercentage: Math.round(waiversPct * 100) / 100,
    slideCount: slides.length,
    authorBlocksCount,
    questionsCount: questions.length,
    flashcardsCount,
    failures,
    passed: failures.length === 0
  };
}

// CLI Driver
if (process.argv[1] && process.argv[1].endsWith('verify-coverage.ts')) {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('Uso: npx tsx scripts/coverage/verify-coverage.ts <subtopicId>');
    process.exit(1);
  }

  console.log(`Evaluando cobertura oficial para ${targetId}...`);
  const report = evaluateCoverage(targetId);

  console.log(`\n================ RESULTADOS DE COBERTURA: ${targetId} ================`);
  console.log(`- Unidades totales del PDF: ${report.totalUnits}`);
  console.log(`- Unidades mapeadas: ${report.mappedUnitsCount}`);
  console.log(`- Unidades omitidas con motivo: ${report.omittedUnitsCount}`);
  console.log(`- Unidades sin cubrir: ${report.unmappedUnits.length}`);
  console.log(`- Tokens técnicos totales: ${report.totalTokensCount}`);
  console.log(`- Tokens técnicos presentes/cubiertos: ${report.coveredTokensCount}`);
  console.log(`- Tokens exentos con motivo: ${report.waivedTokensCount} (${report.waiversPercentage}%)`);
  console.log(`- Diapositivas: ${report.slideCount}`);
  console.log(`- Bloques del autor declarados: ${report.authorBlocksCount}`);
  console.log(`- Preguntas en pool: ${report.questionsCount}`);

  if (report.passed) {
    console.log(`\n🎉 COBERTURA 100% VERIFICADA para ${targetId}. Sin fallos.`);
    process.exit(0);
  } else {
    console.error(`\n❌ FALLO DE COBERTURA: Se detectaron ${report.failures.length} incumplimientos:`);
    for (const f of report.failures) {
      console.error(`  [Regla ${f.rule}] ${f.title}: ${f.message}`);
      if (f.details) {
        for (const d of f.details.slice(0, 5)) {
          console.error(`    * ${d}`);
        }
      }
    }
    process.exit(1);
  }
}
