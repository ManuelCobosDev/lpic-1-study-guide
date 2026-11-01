import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { NotesService } from '../../../core/services/notes.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { DefaultStudyView } from '../../../core/models/preferences.model';
import { Lesson } from '../../../core/models/lesson.model';
import { SlideViewerComponent } from '../components/slide-viewer/slide-viewer.component';
import { LessonWebViewComponent } from '../components/lesson-web-view/lesson-web-view.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TabsComponent, TabItem } from '../../../shared/ui/tabs/tabs.component';

@Component({
  selector: 'app-lesson-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SlideViewerComponent,
    LessonWebViewComponent,
    ButtonComponent,
    TabsComponent
  ],
  template: `
    <div class="lesson-page-container min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <!-- 1. Barra de Migas de Pan (Breadcrumbs) -->
      <nav aria-label="Migas de pan" class="breadcrumbs text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
        <a routerLink="/" class="hover:text-[var(--text)] transition-colors">Inicio</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/temario" class="hover:text-[var(--text)] transition-colors">Temario</a>
        <span aria-hidden="true">›</span>
        <a [routerLink]="['/temario', lesson()?.examId || '101']" class="hover:text-[var(--text)] transition-colors">
          Examen {{ lesson()?.examId || '101' }}
        </a>
        <span aria-hidden="true">›</span>
        <a [routerLink]="['/temario', lesson()?.examId || '101', lesson()?.topicId || '103']" class="hover:text-[var(--text)] transition-colors">
          Tema {{ lesson()?.topicId || '103' }}
        </a>
        <span aria-hidden="true">›</span>
        <span class="text-[var(--primary-text)] font-bold" aria-current="page">{{ subtopicId() }}</span>
      </nav>

      @if (loading()) {
        <div class="p-16 text-center text-sm text-[var(--text-muted)] animate-pulse">
          Cargando contenido oficial del subtema {{ subtopicId() }}...
        </div>
      } @else if (error()) {
        <div class="p-8 max-w-xl mx-auto my-12 text-center bg-red-500/10 border border-red-500/30 rounded-2xl text-[var(--text)]">
          <h2 class="text-base font-bold text-red-600 dark:text-red-400 mb-2">Error al cargar la lección</h2>
          <p class="text-xs text-[var(--text-muted)] mb-4">{{ error() }}</p>
          <a routerLink="/temario" class="text-xs font-semibold text-[var(--primary-text)] underline">
            Volver al temario
          </a>
        </div>
      } @else if (lesson(); as l) {
        <!-- 2. Cabecera Principal con Selector de Vistas y Botón de Completado -->
        <header class="lesson-header flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary-text)] font-mono text-xs font-bold">
                Subtema {{ l.id }}
              </span>
              <span class="text-xs font-mono text-[var(--text-muted)]">
                Examen {{ l.examId }} · Tema {{ l.topicId }}
              </span>
              <span class="text-xs font-mono text-[var(--text-muted)]">
                · ~{{ l.estimatedMinutes }} min
              </span>
              @if (l.placeholder) {
                <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  En preparación (Esqueleto)
                </span>
              }
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
              {{ l.title }}
            </h1>
          </div>

          <!-- Controles de cabecera: Selector de Vistas + Toggle Completado -->
          <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
            <!-- Selector de Vistas Segmentado -->
            <div
              class="view-selector-group inline-flex items-center p-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]"
              role="group"
              aria-label="Selector de formato de estudio"
            >
              <button
                type="button"
                class="view-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                [class.bg-[var(--surface)]]="vista() === 'slides'"
                [class.text-[var(--primary-text)]]="vista() === 'slides'"
                [class.shadow-xs]="vista() === 'slides'"
                [class.text-[var(--text-muted)]]="vista() !== 'slides'"
                (click)="onSelectView('slides')"
                title="Vista de Diapositivas 16:9 con atajos de teclado"
              >
                <span aria-hidden="true">🖥️</span>
                <span>Diapositivas</span>
              </button>
              <button
                type="button"
                class="view-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                [class.bg-[var(--surface)]]="vista() === 'web'"
                [class.text-[var(--primary-text)]]="vista() === 'web'"
                [class.shadow-xs]="vista() === 'web'"
                [class.text-[var(--text-muted)]]="vista() !== 'web'"
                (click)="onSelectView('web')"
                title="Vista Web continua de lectura"
              >
                <span aria-hidden="true">📖</span>
                <span>Web</span>
              </button>
              <button
                type="button"
                class="view-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                [class.bg-[var(--surface)]]="vista() === 'pdf'"
                [class.text-[var(--primary-text)]]="vista() === 'pdf'"
                [class.shadow-xs]="vista() === 'pdf'"
                [class.text-[var(--text-muted)]]="vista() !== 'pdf'"
                (click)="onSelectView('pdf')"
                title="Generar e Imprimir PDF"
              >
                <span aria-hidden="true">📄</span>
                <span>PDF</span>
              </button>
            </div>

            <!-- Botón Toggle de Estado de Completado -->
            <button
              type="button"
              class="completed-toggle-btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer select-none"
              [class.bg-[var(--success)]]="isCompleted()"
              [class.text-white]="isCompleted()"
              [class.border-[var(--success)]]="isCompleted()"
              [class.hover:bg-[var(--success-hover)]]="isCompleted()"
              [class.bg-[var(--surface)]]="!isCompleted()"
              [class.border-[var(--border)]]="!isCompleted()"
              [class.text-[var(--text)]]="!isCompleted()"
              [class.hover:border-[var(--success)]]="!isCompleted()"
              [class.hover:text-[var(--success-text)]]="!isCompleted()"
              (click)="toggleCompleted()"
              [attr.aria-pressed]="isCompleted()"
              title="Marcar o desmarcar este subtema como completado"
            >
              @if (isCompleted()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Completado</span>
              } @else {
                <div class="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)]" aria-hidden="true"></div>
                <span>Marcar completado</span>
              }
            </button>
          </div>
        </header>

        <!-- 3. Visor de Estudio Condicional (Diapositivas, Web o PDF) -->
        <section class="lesson-viewer-section min-h-[480px]" aria-label="Contenido principal de la lección">
          @if (vista() === 'slides') {
            <app-slide-viewer
              [subtopicId]="l.id"
              [slides]="l.slides"
              [currentSlideNumber]="currentSlideNumber()"
              [highlightQuery]="highlightQuery()"
              (slideChange)="onSlideChange($event)"
            />
          } @else if (vista() === 'web') {
            <app-lesson-web-view
              [slides]="l.slides"
              [initialSection]="currentSlideNumber()"
              (jumpToSlide)="onJumpToSlideFromWeb($event)"
              (sectionVisible)="onSectionVisibleFromWeb($event)"
            />
          } @else if (vista() === 'pdf') {
            <!-- Panel de Generación e Impresión PDF -->
            <div class="pdf-panel p-8 sm:p-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs max-w-3xl mx-auto text-center space-y-6">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-text)] flex items-center justify-center text-3xl shadow-xs">
                📄
              </div>

              <div class="space-y-2">
                <h2 class="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
                  Descargar o Imprimir Lección en PDF
                </h2>
                <p class="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
                  Genera una versión optimizada para lectura en papel o archivo PDF vectorial, con formato continuo A4 o diapositivas individuales por página.
                </p>
              </div>

              <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] max-w-md mx-auto text-left space-y-1.5 text-xs text-[var(--text-muted)]">
                <div class="font-mono font-bold text-[var(--text)] uppercase tracking-wider mb-1">
                  💡 Consejos de impresión:
                </div>
                <div>• Selecciona <strong>"Guardar como PDF"</strong> en el destino de tu navegador.</div>
                <div>• Los diagramas se exportan en formato SVG vectorial sin pérdida.</div>
                <div>• Los márgenes y saltos de página se ajustan automáticamente.</div>
              </div>

              <div class="flex items-center justify-center gap-4 flex-wrap pt-2">
                <app-button
                  variant="primary"
                  size="md"
                  [routerLink]="['/estudiar', l.id, 'imprimir']"
                >
                  <span>🖨️ Abrir vista de impresión</span>
                </app-button>

                <a
                  [routerLink]="['/estudiar', l.id, 'imprimir']"
                  [queryParams]="{ autoPrint: '1' }"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                >
                  <span>Imprimir directo en pestaña nueva</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          }
        </section>

        <!-- 4. Pestañas Secundarias (Laboratorio, Notas Personales, Comandos y Glosario) -->
        <section class="lesson-secondary-tabs-section pt-8 border-t border-[var(--border)] space-y-6" aria-label="Herramientas y recursos complementarios">
          <app-tabs
            [tabs]="secondaryTabs"
            [activeId]="activeTab()"
            (tabChange)="onTabChange($event)"
          />

          <!-- Pestaña 1: Laboratorio Práctico -->
          @if (activeTab() === 'lab') {
            <div class="tab-panel-lab p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <div class="flex items-center gap-2">
                  <span class="text-lg" aria-hidden="true">🧪</span>
                  <h3 class="text-base font-bold text-[var(--text)]">
                    Práctica Guiada de Laboratorio: {{ l.id }}
                  </h3>
                </div>
                <p class="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Pon en práctica los comandos y conceptos de esta lección en un entorno de terminal interactivo con validación paso a paso de tus soluciones.
                </p>
              </div>

              <app-button
                variant="primary"
                size="md"
                [routerLink]="['/laboratorios', l.id]"
              >
                <span>Abrir Laboratorio {{ l.id }} →</span>
              </app-button>
            </div>
          }

          <!-- Pestaña 2: Notas Personales con Autoguardado -->
          @if (activeTab() === 'notes') {
            <div class="tab-panel-notes p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4">
              <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-base" aria-hidden="true">📝</span>
                  <h3 class="text-sm font-bold text-[var(--text)]">
                    Mis Notas Personales de Estudio
                  </h3>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <span class="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" aria-hidden="true"></span>
                  <span>Guardado local persistente</span>
                </div>
              </div>

              <label for="subtopic-personal-note" class="sr-only">Escribe tus apuntes y anotaciones para este subtema</label>
              <textarea
                id="subtopic-personal-note"
                rows="6"
                class="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs sm:text-sm font-mono leading-relaxed focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all resize-y"
                placeholder="Escribe aquí tus apuntes, trucos mnemotécnicos o comandos para repasar este subtema..."
                [value]="subtopicNote()"
                (input)="onNoteInput($event)"
              ></textarea>

              <div class="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                <span>{{ subtopicNote().length }} caracteres</span>
                <span>Las notas se conservan aunque cierres o recargues el navegador</span>
              </div>
            </div>
          }

          <!-- Pestaña 3: Comandos y Glosario Filtrados -->
          @if (activeTab() === 'reference') {
            <div class="tab-panel-reference grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Comandos clave -->
              <div class="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4">
                <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <span class="text-base" aria-hidden="true">💻</span>
                  <h3 class="text-sm font-bold text-[var(--text)]">
                    Comandos Clave de este Subtema
                  </h3>
                </div>
                @if (l.commands && l.commands.length > 0) {
                  <ul class="space-y-2" aria-label="Lista de comandos clave">
                    @for (cmd of l.commands; track cmd) {
                      <li class="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-xs">
                        <code class="font-mono font-bold text-[var(--primary-text)]">{{ cmd }}</code>
                        <span class="text-[var(--text-muted)] font-mono text-[11px]">Objetivo LPIC-1</span>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="text-xs text-[var(--text-muted)] italic">No hay comandos específicos registrados.</p>
                }
              </div>

              <!-- Términos clave -->
              <div class="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4">
                <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <span class="text-base" aria-hidden="true">📖</span>
                  <h3 class="text-sm font-bold text-[var(--text)]">
                    Términos y Conceptos Clave
                  </h3>
                </div>
                @if (l.keyTerms && l.keyTerms.length > 0) {
                  <div class="flex flex-wrap gap-2" aria-label="Lista de términos clave">
                    @for (term of l.keyTerms; track term) {
                      <span class="px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text)]">
                        {{ term }}
                      </span>
                    }
                  </div>
                } @else {
                  <p class="text-xs text-[var(--text-muted)] italic">No hay términos registrados.</p>
                }
              </div>
            </div>
          }
        </section>

        <!-- 5. Navegación Inferior Adyacente entre Subtemas -->
        <nav class="lesson-navigation flex items-center justify-between gap-4 pt-6 border-t border-[var(--border)]" aria-label="Navegación entre subtemas">
          @if (adjacentSubtopics().prev; as prev) {
            <a
              [routerLink]="['/estudiar', prev.id]"
              [queryParams]="{ vista: vista() }"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            >
              <span aria-hidden="true">←</span>
              <span>{{ prev.id }} {{ prev.title }}</span>
            </a>
          } @else {
            <div></div>
          }

          @if (adjacentSubtopics().next; as next) {
            <a
              [routerLink]="['/estudiar', next.id]"
              [queryParams]="{ vista: vista() }"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition-colors cursor-pointer ml-auto"
            >
              <span>{{ next.id }} {{ next.title }}</span>
              <span aria-hidden="true">→</span>
            </a>
          }
        </nav>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly notesService = inject(NotesService);
  private readonly preferencesService = inject(PreferencesService);

  readonly subtopicId = signal<string>('');
  readonly lesson = signal<Lesson | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly currentSlideNumber = signal<number>(1);
  readonly vista = signal<DefaultStudyView>('slides');
  readonly highlightQuery = signal<string>('');
  readonly activeTab = signal<'lab' | 'notes' | 'reference'>('notes');
  readonly subtopicNote = signal<string>('');

  readonly secondaryTabs: TabItem[] = [
    { id: 'notes', label: 'Mis Notas Personales', badge: '📝' },
    { id: 'lab', label: 'Laboratorio Práctico', badge: '🧪' },
    { id: 'reference', label: 'Comandos y Glosario', badge: '📚' }
  ];

  readonly isCompleted = computed(() => {
    const id = this.subtopicId();
    if (!id) return false;
    const progress = this.progressService.progress();
    return !!progress.completedSubtopics[id];
  });

  readonly adjacentSubtopics = computed(() => {
    const id = this.subtopicId();
    const manifest = this.contentService.manifest();
    if (!id || !manifest || !manifest.subtopics) return { prev: null, next: null };

    const allSubtopics = manifest.subtopics;
    const index = allSubtopics.findIndex((s) => s.id === id);
    if (index === -1) return { prev: null, next: null };

    return {
      prev: index > 0 ? (allSubtopics[index - 1] ?? null) : null,
      next: index < allSubtopics.length - 1 ? (allSubtopics[index + 1] ?? null) : null
    };
  });

  private routeSub: Subscription | null = null;
  private querySub: Subscription | null = null;

  ngOnInit(): void {
    // Escuchar parámetros de ruta (por ejemplo /estudiar/103.4)
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('subtema');
      if (id && id !== this.subtopicId()) {
        this.subtopicId.set(id);
        this.loadLesson(id);
      }
    });

    // Escuchar parámetros de consulta (?slide=5&vista=web)
    this.querySub = this.route.queryParamMap.subscribe((qParams) => {
      const slideParam = qParams.get('slide');
      if (slideParam) {
        const slideNum = parseInt(slideParam, 10);
        if (!isNaN(slideNum) && slideNum > 0) {
          this.currentSlideNumber.set(slideNum);
        }
      }

      const qParam = qParams.get('q');
      if (qParam) {
        this.highlightQuery.set(qParam);
      } else {
        this.highlightQuery.set('');
      }

      const vistaParam = qParams.get('vista') as DefaultStudyView | null;
      if (vistaParam && (vistaParam === 'slides' || vistaParam === 'web' || vistaParam === 'pdf')) {
        this.vista.set(vistaParam);
      } else {
        // Fallback a preferencia guardada
        this.vista.set(this.preferencesService.defaultStudyView());
      }
    });

    // Precargar manifest si aún no está disponible
    this.contentService.getManifest().catch(() => undefined);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.querySub?.unsubscribe();
  }

  async loadLesson(subtopicId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.contentService.getLesson(subtopicId);
      this.lesson.set(data);
      this.titleService.setTitle(`${data.id} ${data.title} · LPIC-1 Study Guide`);

      // Cargar nota personal guardada
      const existingNote = this.notesService.getNote(subtopicId);
      this.subtopicNote.set(existingNote);

      // Registrar visita en historial
      this.progressService.recordLastVisited(`/estudiar/${subtopicId}`, data.title);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la lección.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  onSelectView(view: DefaultStudyView): void {
    this.vista.set(view);
    this.preferencesService.setDefaultStudyView(view);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vista: view },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSlideChange(slideNumber: number): void {
    this.currentSlideNumber.set(slideNumber);
    this.progressService.recordSlideViewed(this.subtopicId(), slideNumber);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { slide: slideNumber },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onJumpToSlideFromWeb(slideNumber: number): void {
    this.onSelectView('slides');
    this.onSlideChange(slideNumber);
  }

  onSectionVisibleFromWeb(sectionNumber: number): void {
    this.currentSlideNumber.set(sectionNumber);
    this.progressService.recordSlideViewed(this.subtopicId(), sectionNumber);
  }

  toggleCompleted(): void {
    const id = this.subtopicId();
    if (!id) return;

    if (this.isCompleted()) {
      this.progressService.unmarkSubtopicCompleted(id);
    } else {
      this.progressService.markSubtopicCompleted(id);
    }
    this.progressService.flush();
  }

  onTabChange(tabId: string): void {
    if (tabId === 'lab' || tabId === 'notes' || tabId === 'reference') {
      this.activeTab.set(tabId);
    }
  }

  onNoteInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    this.subtopicNote.set(value);
    this.notesService.setNote(this.subtopicId(), value);
  }
}
