import { Question } from '../../models/question.model';
import { QuestionAnswer } from '../../models/attempt.model';

export interface SubtopicWeightInfo {
  id: string; // ej. '103.4'
  topicId: string; // ej. '103'
  weight: number; // ej. 4
}

export interface TopicScoreBreakdown {
  topicId: string;
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface ExamScoreResult {
  rawPointsEarned: number;
  rawPointsTotal: number;
  score: number; // Escala oficial 200 - 800
  passed: boolean; // score >= 500
  correctCount: number;
  totalQuestions: number;
  accuracyPercentage: number;
  topicScores: Record<string, TopicScoreBreakdown>;
  weakTopicIds: string[]; // temas con < 70% de acierto
}

/**
 * Normaliza una respuesta de texto para preguntas tipo fill:
 * - Convierte a minúsculas
 * - Elimina espacios iniciales y finales
 * - Colapsa múltiples espacios consecutivos en uno solo
 */
export function normalizeAnswer(text?: string | null): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Comprueba si la respuesta dada a una pregunta es 100% correcta (todo o nada).
 */
export function isAnswerCorrect(question: Question, answer?: QuestionAnswer | null): boolean {
  if (!answer) return false;

  switch (question.type) {
    case 'single': {
      const selected = answer.selectedOptions ?? [];
      if (selected.length !== 1) return false;
      const firstSelected = selected[0];
      return Boolean(firstSelected && question.correct.includes(firstSelected));
    }

    case 'multiple': {
      const selected = new Set(answer.selectedOptions ?? []);
      const correct = new Set(question.correct);

      if (selected.size !== correct.size) return false;
      for (const opt of correct) {
        if (!selected.has(opt)) return false;
      }
      return true;
    }

    case 'fill': {
      const userText = normalizeAnswer(answer.textAnswer);
      if (!userText) return false;

      const acceptedList = [
        ...(question.acceptedAnswers ?? []),
        ...question.correct
      ].map((ans) => normalizeAnswer(ans));

      return acceptedList.some((accepted) => accepted === userText);
    }

    default:
      return false;
  }
}

/**
 * Calcula la puntuación del examen según la escala oficial LPI (200 - 800).
 * Puntos por pregunta = peso del subtema / total de preguntas de ese subtema en el examen.
 * Escala = round(200 + 600 * (puntos_obtenidos / puntos_totales))
 * Aprobado >= 500 puntos.
 */
export function calculateExamScore(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  subtopics: SubtopicWeightInfo[]
): ExamScoreResult {
  if (questions.length === 0) {
    return {
      rawPointsEarned: 0,
      rawPointsTotal: 0,
      score: 200,
      passed: false,
      correctCount: 0,
      totalQuestions: 0,
      accuracyPercentage: 0,
      topicScores: {},
      weakTopicIds: []
    };
  }

  // Mapa de peso por subtema (por defecto 1 si no se encuentra)
  const weightBySubtopic = new Map<string, number>();
  for (const s of subtopics) {
    weightBySubtopic.set(s.id, s.weight > 0 ? s.weight : 1);
  }

  // Contar cuántas preguntas hay de cada subtema en este examen
  const countBySubtopic = new Map<string, number>();
  for (const q of questions) {
    countBySubtopic.set(q.subtopicId, (countBySubtopic.get(q.subtopicId) ?? 0) + 1);
  }

  let totalPointsEarned = 0;
  let totalPointsPossible = 0;
  let correctCount = 0;

  // Desglose por tema
  const topicStats: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const subtopicWeight = weightBySubtopic.get(q.subtopicId) ?? 1;
    const questionsInSubtopic = countBySubtopic.get(q.subtopicId) ?? 1;
    const questionPointValue = subtopicWeight / questionsInSubtopic;

    totalPointsPossible += questionPointValue;

    if (!topicStats[q.topicId]) {
      topicStats[q.topicId] = { correct: 0, total: 0 };
    }
    const currentTopicStat = topicStats[q.topicId];
    if (currentTopicStat) {
      currentTopicStat.total += 1;
    }

    const answer = answers[q.id];
    const correct = isAnswerCorrect(q, answer);

    if (correct) {
      correctCount += 1;
      totalPointsEarned += questionPointValue;
      if (currentTopicStat) {
        currentTopicStat.correct += 1;
      }
    }
  }

  // Escala oficial LPI 200 - 800
  const ratio = totalPointsPossible > 0 ? totalPointsEarned / totalPointsPossible : 0;
  const rawScore = 200 + 600 * ratio;
  const score = Math.min(800, Math.max(200, Math.round(rawScore)));
  const passed = score >= 500;

  const topicScores: Record<string, TopicScoreBreakdown> = {};
  const weakTopicIds: string[] = [];

  for (const [topicId, stats] of Object.entries(topicStats)) {
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const topicPassed = percentage >= 65;
    topicScores[topicId] = {
      topicId,
      correct: stats.correct,
      total: stats.total,
      percentage,
      passed: topicPassed
    };

    if (percentage < 70) {
      weakTopicIds.push(topicId);
    }
  }

  return {
    rawPointsEarned: Math.round(totalPointsEarned * 100) / 100,
    rawPointsTotal: Math.round(totalPointsPossible * 100) / 100,
    score,
    passed,
    correctCount,
    totalQuestions: questions.length,
    accuracyPercentage: Math.round((correctCount / questions.length) * 100),
    topicScores,
    weakTopicIds
  };
}

/**
 * Generador pseudoaleatorio determinista Mulberry32:
 * Produce valores flotantes uniformes en [0, 1) a partir de una semilla entera.
 */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Baraja un array in-place usando el algoritmo Fisher-Yates con un generador PRNG determinista.
 */
export function shuffleWithRng<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tempI = result[i];
    const tempJ = result[j];
    if (tempI !== undefined && tempJ !== undefined) {
      result[i] = tempJ;
      result[j] = tempI;
    }
  }
  return result;
}

/**
 * Selección proporcional de preguntas por peso de subtema usando el método del mayor resto
 * y barajado determinista con Mulberry32.
 */
export function selectExamQuestions(
  allQuestions: Question[],
  subtopics: SubtopicWeightInfo[],
  targetCount = 60,
  seed = 42
): Question[] {
  // Filtrar preguntas válidas (no placeholders a menos que no haya otra alternativa)
  const availableQuestions = allQuestions.filter((q) => !q.placeholder);
  const pool = availableQuestions.length >= targetCount ? availableQuestions : allQuestions;

  if (pool.length <= targetCount) {
    const rng = mulberry32(seed);
    return shuffleWithRng(pool, rng);
  }

  const rng = mulberry32(seed);

  // Agrupar preguntas por subtema
  const questionsBySubtopic = new Map<string, Question[]>();
  for (const q of pool) {
    const list = questionsBySubtopic.get(q.subtopicId) ?? [];
    list.push(q);
    questionsBySubtopic.set(q.subtopicId, list);
  }

  // Filtrar solo los subtemas que tienen preguntas disponibles
  const activeSubtopics = subtopics.filter(
    (s) => (questionsBySubtopic.get(s.id)?.length ?? 0) > 0
  );

  const totalWeight = activeSubtopics.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) {
    return shuffleWithRng(pool, rng).slice(0, targetCount);
  }

  // Método del mayor resto para asignar cupos enteros por subtema
  interface QuotaCalc {
    subtopicId: string;
    exactQuota: number;
    integerQuota: number;
    remainder: number;
  }

  const quotas: QuotaCalc[] = activeSubtopics.map((s) => {
    const exact = (s.weight / totalWeight) * targetCount;
    const integer = Math.floor(exact);
    return {
      subtopicId: s.id,
      exactQuota: exact,
      integerQuota: integer,
      remainder: exact - integer
    };
  });

  const assigned = quotas.reduce((sum, q) => sum + q.integerQuota, 0);
  let remainingToAssign = targetCount - assigned;

  // Ordenar por resto descendente para asignar el residuo
  quotas.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < quotas.length && remainingToAssign > 0; i++) {
    const item = quotas[i];
    if (item) {
      item.integerQuota += 1;
      remainingToAssign -= 1;
    }
  }

  // Seleccionar preguntas de cada subtema según su cuota asignada
  const selectedQuestions: Question[] = [];
  const unusedQuestions: Question[] = [];

  for (const item of quotas) {
    const subtopicPool = questionsBySubtopic.get(item.subtopicId) ?? [];
    const shuffledSubtopic = shuffleWithRng(subtopicPool, rng);

    const takeCount = Math.min(item.integerQuota, shuffledSubtopic.length);
    selectedQuestions.push(...shuffledSubtopic.slice(0, takeCount));
    unusedQuestions.push(...shuffledSubtopic.slice(takeCount));
  }

  // Si algún subtema tenía menos preguntas que su cuota, rellenar del resto del pool barajado
  if (selectedQuestions.length < targetCount) {
    const needed = targetCount - selectedQuestions.length;
    const shuffledUnused = shuffleWithRng(unusedQuestions, rng);
    selectedQuestions.push(...shuffledUnused.slice(0, needed));
  }

  // Barajado final del conjunto seleccionado completo
  return shuffleWithRng(selectedQuestions, rng);
}
