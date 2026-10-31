import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { ContentService } from './content.service';
import { PreferencesService } from './preferences.service';
import { PersistedStore } from '../state/persisted-store';
import { Question } from '../models/question.model';
import { ActiveExamSession, ExamAttempt, QuestionAnswer } from '../models/attempt.model';
import {
  calculateExamScore,
  selectExamQuestions,
  SubtopicWeightInfo
} from '../engines/scoring/scoring.engine';

export interface ExamHistoryState {
  schemaVersion: number;
  attempts: ExamAttempt[];
}

export const DEFAULT_HISTORY_STATE: ExamHistoryState = {
  schemaVersion: 1,
  attempts: []
};

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly storage = inject(StorageService);
  private readonly contentService = inject(ContentService);
  private readonly preferencesService = inject(PreferencesService);

  private readonly sessionStore = new PersistedStore<ActiveExamSession | null>(this.storage, {
    key: 'exam_active_session',
    schemaVersion: 1,
    initialValue: null
  });

  private readonly historyStore = new PersistedStore<ExamHistoryState>(this.storage, {
    key: 'exam_history',
    schemaVersion: 1,
    initialValue: DEFAULT_HISTORY_STATE
  });

  readonly activeSession = this.sessionStore.data;
  readonly history = computed(() => this.historyStore.data().attempts);
  readonly hasActiveSession = computed(() => this.activeSession() !== null);

  /**
   * Calcula los segundos restantes del examen en base a startedAt persistido.
   * Si la página se recarga, el temporizador continúa sincronizado con el reloj real.
   */
  getRemainingSeconds(session?: ActiveExamSession | null): number {
    const currentSession = session ?? this.activeSession();
    if (!currentSession) return 0;
    if (currentSession.mode === 'practice') return 0;

    const elapsedMs = Date.now() - new Date(currentSession.startedAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    return Math.max(0, currentSession.durationSeconds - elapsedSeconds);
  }

  /**
   * Inicia un nuevo simulacro de examen o práctica.
   */
  async startExam(options: {
    mode: 'exam' | 'practice';
    topicId?: string;
    seed?: number;
    questionLimit?: number;
  }): Promise<ActiveExamSession> {
    const manifest = await this.contentService.getManifest();

    // Recopilar preguntas según topicId o todo el currículo
    const allQuestions: Question[] = [];
    const topicsToLoad = options.topicId
      ? [options.topicId]
      : manifest.topics.map((t) => t.id);

    for (const tId of topicsToLoad) {
      try {
        const questions = await this.contentService.getQuestions(tId);
        allQuestions.push(...questions);
      } catch {
        // Ignorar temas sin archivo de preguntas
      }
    }

    // Filtrar preguntas según preferencias (incluir o excluir placeholders/ejemplo)
    const includePlaceholders = this.preferencesService.includeExampleContent();
    const pool = includePlaceholders
      ? allQuestions
      : allQuestions.filter((q) => !q.placeholder);

    const subtopicWeights: SubtopicWeightInfo[] = manifest.subtopics.map((s) => ({
      id: s.id,
      topicId: s.topicId,
      weight: s.weight
    }));

    // Determinar cantidad de preguntas y duración
    const isExam = options.mode === 'exam';
    const defaultTarget = isExam ? 60 : 20;
    const targetCount = options.questionLimit ?? Math.min(defaultTarget, pool.length);

    // 1.5 min por pregunta = 90 s por pregunta en examen cronometrado
    const durationSeconds = isExam ? targetCount * 90 : 0;
    const seed = options.seed ?? Date.now();

    const selectedQuestions = selectExamQuestions(pool, subtopicWeights, targetCount, seed);

    const newSession: ActiveExamSession = {
      id: `attempt-${Date.now()}`,
      mode: options.mode,
      topicId: options.topicId,
      startedAt: new Date().toISOString(),
      durationSeconds,
      seed,
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      answers: {}
    };

    this.sessionStore.set(newSession);
    this.sessionStore.flush();
    return newSession;
  }

  /**
   * Guarda o actualiza la respuesta dada a una pregunta en la sesión activa.
   */
  answerQuestion(
    questionId: string,
    answerData: { selectedOptions?: string[]; textAnswer?: string }
  ): void {
    const session = this.activeSession();
    if (!session) return;

    const prevAnswer = session.answers[questionId];
    const updatedAnswer: QuestionAnswer = {
      questionId,
      selectedOptions: answerData.selectedOptions ?? prevAnswer?.selectedOptions,
      textAnswer: answerData.textAnswer !== undefined ? answerData.textAnswer : prevAnswer?.textAnswer,
      flagged: prevAnswer?.flagged ?? false,
      answeredAt: new Date().toISOString()
    };

    this.sessionStore.update((s) => {
      if (!s) return null;
      return {
        ...s,
        answers: {
          ...s.answers,
          [questionId]: updatedAnswer
        }
      };
    });
    this.sessionStore.flush();
  }

  /**
   * Marca o desmarca una pregunta para revisión en la sesión activa.
   */
  toggleFlagQuestion(questionId: string): void {
    const session = this.activeSession();
    if (!session) return;

    const prevAnswer = session.answers[questionId];
    const isFlagged = Boolean(prevAnswer?.flagged);

    const updatedAnswer: QuestionAnswer = {
      questionId,
      selectedOptions: prevAnswer?.selectedOptions,
      textAnswer: prevAnswer?.textAnswer,
      flagged: !isFlagged,
      answeredAt: prevAnswer?.answeredAt ?? new Date().toISOString()
    };

    this.sessionStore.update((s) => {
      if (!s) return null;
      return {
        ...s,
        answers: {
          ...s.answers,
          [questionId]: updatedAnswer
        }
      };
    });
    this.sessionStore.flush();
  }

  /**
   * Actualiza el índice de la pregunta activa en pantalla.
   */
  setCurrentQuestionIndex(index: number): void {
    const session = this.activeSession();
    if (!session) return;

    if (index >= 0 && index < session.questions.length) {
      this.sessionStore.update((s) => {
        if (!s) return null;
        return {
          ...s,
          currentQuestionIndex: index
        };
      });
      this.sessionStore.flush();
    }
  }

  /**
   * Finaliza el examen actual, calcula la puntuación 200 - 800 y guarda en el historial.
   */
  async finishCurrentExam(): Promise<ExamAttempt | null> {
    const session = this.activeSession();
    if (!session) return null;

    const manifest = await this.contentService.getManifest();
    const subtopicWeights: SubtopicWeightInfo[] = manifest.subtopics.map((s) => ({
      id: s.id,
      topicId: s.topicId,
      weight: s.weight
    }));

    const scoreResult = calculateExamScore(session.questions, session.answers, subtopicWeights);
    const timeRemainingSeconds = this.getRemainingSeconds(session);

    const completedAttempt: ExamAttempt = {
      id: session.id,
      mode: session.mode,
      topicId: session.topicId,
      startedAt: session.startedAt,
      finishedAt: new Date().toISOString(),
      durationSeconds: session.durationSeconds,
      timeRemainingSeconds,
      seed: session.seed,
      questionIds: session.questions.map((q) => q.id),
      questions: session.questions,
      answers: session.answers,
      score: scoreResult.score,
      passed: scoreResult.passed,
      topicScores: scoreResult.topicScores
    };

    // Guardar en el historial de intentos
    this.historyStore.update((h) => ({
      ...h,
      attempts: [completedAttempt, ...h.attempts]
    }));
    this.historyStore.flush();

    // Limpiar sesión activa
    this.sessionStore.set(null);
    this.sessionStore.flush();

    return completedAttempt;
  }

  /**
   * Descarta la sesión activa sin guardarla en el historial de exámenes completados.
   */
  abandonCurrentExam(): void {
    this.sessionStore.set(null);
    this.sessionStore.flush();
  }

  /**
   * Recupera un intento finalizado por ID desde el historial persistido.
   */
  getAttemptById(id: string): ExamAttempt | undefined {
    return this.history().find((a) => a.id === id);
  }

  /**
   * Devuelve los últimos intentos del historial para la tabla de inicio del simulador.
   */
  getRecentAttempts(limit = 5): ExamAttempt[] {
    return this.history().slice(0, limit);
  }

  /**
   * Comprueba si hay preguntas disponibles en la plataforma para iniciar un examen.
   */
  async hasAvailableQuestions(): Promise<boolean> {
    try {
      const manifest = await this.contentService.getManifest();
      for (const t of manifest.topics) {
        const qList = await this.contentService.getQuestions(t.id);
        if (qList.length > 0) return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
