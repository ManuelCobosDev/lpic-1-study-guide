import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurriculumManifest, Subtopic, Topic } from '../../../core/models';

export interface TreeTopic extends Topic {
  subtopics: Subtopic[];
}

export interface TreeExam {
  id: string;
  code: string;
  title: string;
  topics: TreeTopic[];
}

@Component({
  selector: 'app-curriculum-tree-sidebar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="tree-sidebar" aria-label="Navegación del temario">
      <div class="tree-header">
        <h3 class="tree-header-title">Temario del Curso</h3>
        <span class="tree-header-badge">{{ totalSubtopics() }} subtemas</span>
      </div>

      <nav class="tree-nav">
        @for (exam of tree(); track exam.id) {
          <div class="exam-group">
            <div class="exam-header">
              <span class="exam-code">{{ exam.code }}</span>
              <span class="exam-title">{{ exam.title }}</span>
            </div>

            <div class="topics-list">
              @for (topic of exam.topics; track topic.id) {
                <div class="topic-group">
                  <button
                    type="button"
                    class="topic-header-btn"
                    [attr.aria-expanded]="isTopicExpanded(topic.id)"
                    (click)="toggleTopic(topic.id)"
                  >
                    <svg
                      class="topic-chevron"
                      [class.topic-chevron-open]="isTopicExpanded(topic.id)"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="topic-title">{{ topic.title }}</span>
                  </button>

                  @if (isTopicExpanded(topic.id)) {
                    <ul class="subtopics-list" role="list">
                      @for (sub of topic.subtopics; track sub.id) {
                        <li class="subtopic-item">
                          <a
                            [routerLink]="['/estudiar', sub.id]"
                            class="subtopic-link"
                            [class.subtopic-active]="isSubtopicActive(sub.id)"
                            [attr.aria-current]="isSubtopicActive(sub.id) ? 'page' : null"
                          >
                            <span class="subtopic-code">{{ sub.id }}</span>
                            <span class="subtopic-title">{{ sub.title }}</span>

                            @if (isCompleted(sub.id)) {
                              <span class="subtopic-check" title="Completado" aria-label="Completado">
                                <svg class="w-4 h-4 check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            }
                          </a>
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            </div>
          </div>
        }
      </nav>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      width: 280px;
      flex-shrink: 0;
    }

    .tree-sidebar {
      width: 280px;
      height: calc(100vh - 100px);
      position: sticky;
      top: 80px;
      overflow-y: auto;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      box-sizing: border-box;
    }

    .tree-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .tree-header-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .tree-header-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background-color: var(--surface-muted);
      color: var(--text-muted);
    }

    .tree-nav {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .exam-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .exam-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
      padding: 4px 6px;
      background-color: var(--surface-muted);
      border-radius: var(--radius-xs);
    }

    .exam-code {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-text);
    }

    .exam-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .topics-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .topic-group {
      display: flex;
      flex-direction: column;
    }

    .topic-header-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 6px 4px;
      background: transparent;
      border: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      text-align: left;
      border-radius: var(--radius-xs);
      transition: background-color var(--transition-fast);
    }

    .topic-header-btn:hover {
      background-color: var(--surface-muted);
    }

    .topic-header-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 1px;
    }

    .topic-chevron {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      transition: transform var(--transition-fast);
      flex-shrink: 0;
    }

    .topic-chevron-open {
      transform: rotate(90deg);
    }

    .topic-title {
      line-height: 18px;
    }

    .subtopics-list {
      list-style: none;
      margin: 4px 0 8px 12px;
      padding: 0 0 0 8px;
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .subtopic-item {
      display: block;
    }

    .subtopic-link {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 8px;
      border-radius: var(--radius-xs);
      text-decoration: none;
      font-size: 12px;
      line-height: 16px;
      color: var(--text-muted);
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }

    .subtopic-link:hover {
      background-color: var(--surface-muted);
      color: var(--text);
    }

    .subtopic-link:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 1px;
    }

    .subtopic-link.subtopic-active {
      background-color: var(--primary-soft);
      color: var(--primary-text);
      font-weight: 600;
    }

    .subtopic-code {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .subtopic-title {
      flex: 1 1 auto;
      min-width: 0;
      /* Max 2 lineas sin truncar arbitrariamente */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .subtopic-check {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      margin-left: auto;
    }

    .check-icon {
      color: var(--success);
    }
  `]
})
export class CurriculumTreeSidebarComponent {
  private readonly router = inject(Router);

  /** Datos del manifiesto de curriculo a representar */
  readonly manifest = input<CurriculumManifest | null>(null);

  /** Diccionario de subtemas completados (id -> boolean | string timestamp) */
  readonly completedSubtopics = input<Record<string, boolean | string>>({});

  /** Subtema activo opcional via input (o auto-detectado por URL) */
  readonly activeSubtopicId = input<string>('');

  /** Conjunto de temas colapsados/expandidos */
  readonly expandedTopics = signal<Record<string, boolean>>({});

  readonly tree = computed<TreeExam[]>(() => {
    const m = this.manifest();
    if (!m) return [];

    const topicMap = new Map<string, Topic>(m.topics.map((t: Topic) => [t.id, t]));
    const subtopicMap = new Map<string, Subtopic>(m.subtopics.map((s: Subtopic) => [s.id, s]));

    return m.exams.map((e) => {
      const examTopics: TreeTopic[] = [];
      for (const tid of e.topicIds) {
        const topic = topicMap.get(tid);
        if (topic) {
          const subtopics: Subtopic[] = [];
          for (const sid of topic.subtopicIds) {
            const sub = subtopicMap.get(sid);
            if (sub) {
              subtopics.push(sub);
            }
          }
          examTopics.push({
            ...topic,
            subtopics
          });
        }
      }

      return {
        id: e.id,
        code: e.code,
        title: e.title,
        topics: examTopics
      };
    });
  });

  readonly totalSubtopics = computed(() => {
    const m = this.manifest();
    return m ? m.subtopics.length : 0;
  });

  isTopicExpanded(topicId: string): boolean {
    const state = this.expandedTopics();
    if (state[topicId] !== undefined) {
      return state[topicId]!;
    }
    // Por defecto expandido
    return true;
  }

  toggleTopic(topicId: string): void {
    const current = this.isTopicExpanded(topicId);
    this.expandedTopics.update((prev) => ({
      ...prev,
      [topicId]: !current
    }));
  }

  isSubtopicActive(subtopicId: string): boolean {
    const inputActive = this.activeSubtopicId();
    if (inputActive) {
      return inputActive === subtopicId;
    }
    const currentUrl = this.router.url;
    return currentUrl.includes(`/estudiar/${subtopicId}`);
  }

  isCompleted(subtopicId: string): boolean {
    const map = this.completedSubtopics();
    return !!map[subtopicId];
  }
}
