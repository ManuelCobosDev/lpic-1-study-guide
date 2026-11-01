import { UserProgress } from '../models/progress.model';
import { Subtopic, Topic } from '../models/curriculum.model';
import { ExamAttempt } from '../models/attempt.model';

export function selectSubtopicProgress(
  subtopicId: string,
  progress: UserProgress,
  totalSlides = 0
): number {
  if (progress.completedSubtopics[subtopicId]) {
    return 100;
  }

  if (totalSlides <= 0) {
    return 0;
  }

  const viewed = progress.viewedSlides[subtopicId]?.length ?? 0;
  if (viewed <= 0) {
    return 0;
  }

  const calculated = Math.round((viewed / totalSlides) * 100);
  return Math.min(99, Math.max(0, calculated));
}

export function selectTopicProgress(
  topicId: string,
  progress: UserProgress,
  subtopics: Subtopic[]
): number {
  const topicSubtopics = subtopics.filter((s) => s.topicId === topicId);
  if (topicSubtopics.length === 0) {
    return 0;
  }

  let totalMinutes = 0;
  let weightedProgressSum = 0;

  for (const subtopic of topicSubtopics) {
    const minutes = Math.max(1, subtopic.estimatedMinutes);
    const subProgress = selectSubtopicProgress(subtopic.id, progress, subtopic.slideCount ?? 0);
    totalMinutes += minutes;
    weightedProgressSum += subProgress * minutes;
  }

  if (totalMinutes === 0) {
    return 0;
  }

  return Math.min(100, Math.round(weightedProgressSum / totalMinutes));
}

export function selectExamProgress(
  examId: string,
  progress: UserProgress,
  topics: Topic[],
  subtopics: Subtopic[]
): number {
  const examTopics = topics.filter((t) => t.examId === examId);
  if (examTopics.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedProgressSum = 0;

  for (const topic of examTopics) {
    const weight = Math.max(1, topic.weight);
    const topicProgress = selectTopicProgress(topic.id, progress, subtopics);
    totalWeight += weight;
    weightedProgressSum += topicProgress * weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.min(100, Math.round(weightedProgressSum / totalWeight));
}

export function selectNextRecommendedSubtopic(
  progress: UserProgress,
  subtopics: Subtopic[]
): Subtopic | null {
  const availableSubtopics = subtopics.filter((s) => s.status === 'available');

  // 1. Prioridad: subtema en progreso (algunas diapositivas vistas pero no completado)
  const inProgress = availableSubtopics.find((s) => {
    const isCompleted = Boolean(progress.completedSubtopics[s.id]);
    const hasViewed = (progress.viewedSlides[s.id]?.length ?? 0) > 0;
    return !isCompleted && hasViewed;
  });

  if (inProgress) {
    return inProgress;
  }

  // 2. Siguiente subtema no empezado
  const nextPending = availableSubtopics.find((s) => !progress.completedSubtopics[s.id]);
  return nextPending ?? null;
}

export function selectWeakTopics(
  progress: UserProgress,
  attempts: ExamAttempt[],
  topics: Topic[],
  subtopics: Subtopic[]
): Topic[] {
  const weakTopicIds = new Set<string>();

  // A partir de intentos de examen con puntuaciones por tema
  if (attempts.length > 0) {
    const scoresByTopic: Record<string, { totalScore: number; count: number }> = {};

    for (const attempt of attempts) {
      if (attempt.topicScores) {
        for (const [tId, score] of Object.entries(attempt.topicScores)) {
          const entry = scoresByTopic[tId] ?? { totalScore: 0, count: 0 };
          entry.totalScore += score.percentage;
          entry.count += 1;
          scoresByTopic[tId] = entry;
        }
      }
    }

    for (const [tId, data] of Object.entries(scoresByTopic)) {
      if (data.count > 0 && data.totalScore / data.count < 60) {
        weakTopicIds.add(tId);
      }
    }
  }

  // Si no hay intentos de simulador o se detecta rezago importante
  const progresses = topics.map((t) => ({
    topic: t,
    progress: selectTopicProgress(t.id, progress, subtopics)
  }));

  const maxProgress = Math.max(0, ...progresses.map((p) => p.progress));
  if (maxProgress >= 70) {
    for (const p of progresses) {
      if (p.progress < 40) {
        weakTopicIds.add(p.topic.id);
      }
    }
  }

  return topics.filter((t) => weakTopicIds.has(t.id));
}

