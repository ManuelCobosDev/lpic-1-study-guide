import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { Question, QuestionDifficulty, QuestionType } from '../../../core/models/question.model';
import { QuestionAnswer } from '../../../core/models/attempt.model';
import { Topic } from '../../../core/models/curriculum.model';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { QuestionCardComponent } from '../components/question-card/question-card.component';

@Component({
  selector: 'app-simulator-practice-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    QuestionCardComponent
  ],
  templateUrl: './simulator-practice-page.component.html',
  styleUrls: ['./simulator-practice-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatorPracticePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  private readonly preferencesService = inject(PreferencesService);

  readonly topics = signal<Topic[]>([]);
  readonly allQuestions = signal<Question[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Filtros interactivos
  readonly selectedExam = signal<'101' | '102' | 'all'>('all');
  readonly selectedTopicId = signal<string>('all');
  readonly selectedType = signal<string>('all');
  readonly selectedDifficulty = signal<string>('all');
  readonly onlyFlagged = signal<boolean>(false);

  /**
   * Temas filtrados por el examen seleccionado en URL si aplica
   */
  readonly filteredTopics = computed<Topic[]>(() => {
    const exam = this.selectedExam();
    if (exam === 'all') return this.topics();
    return this.topics().filter((t) =>
      exam === '102' ? parseInt(t.id, 10) >= 105 : parseInt(t.id, 10) <= 104
    );
  });

  // Estado de la sesión de práctica
  readonly currentIndex = signal<number>(0);
  readonly answers = signal<Record<string, QuestionAnswer>>({});
  readonly checkedStatus = signal<Record<string, boolean>>({});

  /**
   * Preguntas filtradas según los criterios seleccionados
   */
  readonly filteredQuestions = computed<Question[]>(() => {
    let list = this.allQuestions();

    const examFilter = this.selectedExam();
    if (examFilter !== 'all') {
      list = list.filter((q) =>
        examFilter === '102' ? parseInt(q.topicId, 10) >= 105 : parseInt(q.topicId, 10) <= 104
      );
    }

    const topicFilter = this.selectedTopicId();
    if (topicFilter !== 'all') {
      list = list.filter((q) => q.topicId === topicFilter);
    }

    const typeFilter = this.selectedType();
    if (typeFilter !== 'all') {
      list = list.filter((q) => q.type === (typeFilter as QuestionType));
    }

    const diffFilter = this.selectedDifficulty();
    if (diffFilter !== 'all') {
      list = list.filter((q) => q.difficulty === (diffFilter as QuestionDifficulty));
    }

    if (this.onlyFlagged()) {
      const answersMap = this.answers();
      list = list.filter((q) => Boolean(answersMap[q.id]?.flagged));
    }

    return list;
  });

  /**
   * Pregunta activa actual
   */
  readonly currentQuestion = computed<Question | undefined>(() => {
    const list = this.filteredQuestions();
    const idx = this.currentIndex();
    if (idx >= 0 && idx < list.length) {
      return list[idx];
    }
    return undefined;
  });

  /**
   * Respuesta de la pregunta activa
   */
  readonly currentAnswer = computed<QuestionAnswer | undefined>(() => {
    const q = this.currentQuestion();
    if (!q) return undefined;
    return this.answers()[q.id];
  });

  /**
   * Si la pregunta activa está marcada para revisar
   */
  readonly isCurrentFlagged = computed<boolean>(() => {
    return Boolean(this.currentAnswer()?.flagged);
  });

  /**
   * Si la pregunta activa ha sido comprobada
   */
  readonly isCurrentChecked = computed<boolean>(() => {
    const q = this.currentQuestion();
    if (!q) return false;
    return Boolean(this.checkedStatus()[q.id]);
  });

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      const manifest = await this.contentService.getManifest();
      this.topics.set(manifest.topics);

      // Cargar preguntas de todos los temas disponibles
      const includePlaceholders = this.preferencesService.includeExampleContent();
      const loadedQuestions: Question[] = [];

      for (const topic of manifest.topics) {
        try {
          const qList = await this.contentService.getQuestions(topic.id);
          const filtered = includePlaceholders ? qList : qList.filter((q) => !q.placeholder);
          loadedQuestions.push(...filtered);
        } catch {
          // Ignorar temas sin banco de preguntas
        }
      }

      this.allQuestions.set(loadedQuestions);

      // Leer query param ?exam=
      const initialExam = this.route.snapshot.queryParamMap.get('exam');
      if (initialExam === '102' || initialExam === '101') {
        this.selectedExam.set(initialExam);
      }

      // Leer query param ?tema=
      const initialTopic = this.route.snapshot.queryParamMap.get('tema');
      if (initialTopic && manifest.topics.some((t) => t.id === initialTopic)) {
        this.selectedTopicId.set(initialTopic);
        if (!initialExam) {
          this.selectedExam.set(parseInt(initialTopic, 10) >= 105 ? '102' : '101');
        }
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onTopicChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTopicId.set(value);
    this.currentIndex.set(0);
  }

  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value);
    this.currentIndex.set(0);
  }

  onDifficultyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDifficulty.set(value);
    this.currentIndex.set(0);
  }

  onFlaggedToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.onlyFlagged.set(checked);
    this.currentIndex.set(0);
  }

  resetFilters(): void {
    this.selectedTopicId.set('all');
    this.selectedType.set('all');
    this.selectedDifficulty.set('all');
    this.onlyFlagged.set(false);
    this.currentIndex.set(0);
  }

  handleAnswerChange(answerData: { selectedOptions?: string[]; textAnswer?: string }): void {
    const q = this.currentQuestion();
    if (!q) return;

    const prev = this.answers()[q.id];
    const updated: QuestionAnswer = {
      questionId: q.id,
      selectedOptions: answerData.selectedOptions ?? prev?.selectedOptions,
      textAnswer: answerData.textAnswer !== undefined ? answerData.textAnswer : prev?.textAnswer,
      flagged: prev?.flagged ?? false,
      answeredAt: new Date().toISOString()
    };

    this.answers.update((m) => ({ ...m, [q.id]: updated }));
  }

  handleToggleFlag(): void {
    const q = this.currentQuestion();
    if (!q) return;

    const prev = this.answers()[q.id];
    const isFlagged = Boolean(prev?.flagged);
    const updated: QuestionAnswer = {
      questionId: q.id,
      selectedOptions: prev?.selectedOptions,
      textAnswer: prev?.textAnswer,
      flagged: !isFlagged,
      answeredAt: prev?.answeredAt ?? new Date().toISOString()
    };

    this.answers.update((m) => ({ ...m, [q.id]: updated }));
  }

  handleCheckPractice(): void {
    const q = this.currentQuestion();
    if (!q) return;
    this.checkedStatus.update((status) => ({ ...status, [q.id]: true }));
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.filteredQuestions().length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }
}

