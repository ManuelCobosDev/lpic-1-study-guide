import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { Lesson } from '../../../core/models/lesson.model';
import { BlockRendererComponent } from '../../../shared/content-blocks/block-renderer.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-lesson-print-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BlockRendererComponent, ButtonComponent],
  template: `
    <!-- Barra superior de controles (no imprimible) -->
    <header
      class="no-print sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur shadow-xs"
      aria-label="Controles de impresión"
    >
      <div class="flex items-center gap-3">
        <a
          [routerLink]="['/estudiar', subtopicId()]"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface)] transition-colors cursor-pointer"
        >
          <span aria-hidden="true">←</span>
          <span>Volver a la lección</span>
        </a>

        <div class="h-4 w-px bg-[var(--border)]" aria-hidden="true"></div>

        <span class="text-xs font-mono font-bold text-[var(--primary-text)]">
          {{ subtopicId() }}
        </span>
        <span class="text-xs text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-xs">
          {{ lesson()?.title ?? 'Cargando lección...' }}
        </span>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
        <!-- Selector de formato -->
        <div class="flex items-center gap-2 text-xs">
          <label for="format-select" class="font-medium text-[var(--text-muted)]">Formato:</label>
          <select
            id="format-select"
            class="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs focus:ring-2 focus:ring-[var(--primary)] outline-none cursor-pointer"
            [value]="formato()"
            (change)="onFormatoChange($event)"
          >
            <option value="documento">Documento A4 continuo</option>
            <option value="diapositivas">Diapositivas (1 por página)</option>
          </select>
        </div>

        <!-- Toggle notas -->
        <label class="flex items-center gap-1.5 text-xs text-[var(--text)] cursor-pointer select-none">
          <input
            type="checkbox"
            class="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            [checked]="incluirNotas()"
            (change)="onNotasToggle($event)"
          />
          <span>Incluir notas</span>
        </label>

        <!-- Botón primario de impresión -->
        <app-button
          variant="primary"
          size="sm"
          (btnClick)="printDocument()"
          title="Abrir cuadro de diálogo de impresión"
        >
          <span>🖨️ Imprimir / Guardar PDF</span>
        </app-button>
      </div>
    </header>

    @if (loading()) {
      <div class="p-12 text-center text-sm text-[var(--text-muted)] animate-pulse">
        Cargando contenido de la lección para impresión...
      </div>
    } @else if (error()) {
      <div class="p-8 max-w-xl mx-auto my-12 text-center bg-red-500/10 border border-red-500/30 rounded-2xl text-[var(--text)]">
        <h2 class="text-base font-bold text-red-600 dark:text-red-400 mb-2">Error al cargar la lección</h2>
        <p class="text-xs text-[var(--text-muted)] mb-4">{{ error() }}</p>
        <a [routerLink]="['/estudiar', subtopicId()]" class="text-xs font-semibold text-[var(--primary-text)] underline">
          Volver a la vista normal
        </a>
      </div>
    } @else if (lesson(); as l) {
      <main class="print-container max-w-4xl mx-auto p-6 sm:p-12 text-[var(--text)] select-text font-sans">
        <!-- Portada / Cabecera imprimible -->
        <header class="document-header mb-12 pb-8 border-b-2 border-[var(--border)] avoid-break">
          <div class="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-4">
            <span class="font-bold tracking-wider uppercase text-[var(--primary-text)]">
              LPIC-1 Study Guide · Aula Virtual
            </span>
            <span>Versión {{ l.version || '1.0' }}</span>
          </div>

          <div class="flex items-center gap-3 mb-3">
            <span class="px-2.5 py-1 rounded bg-[var(--primary-soft)] text-[var(--primary-text)] font-mono text-sm font-bold">
              Subtema {{ l.id }}
            </span>
            <span class="text-xs text-[var(--text-muted)] font-mono">
              ~{{ l.estimatedMinutes }} min lectura
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">
            {{ l.title }}
          </h1>

          @if (l.objectives && l.objectives.length > 0) {
            <div class="objectives-box p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] mb-6">
              <h2 class="text-xs font-mono font-bold text-[var(--primary-text)] uppercase tracking-wider mb-2">
                Objetivos Oficiales LPIC-1
              </h2>
              <ul class="list-disc list-inside text-xs space-y-1 text-[var(--text-muted)]">
                @for (obj of l.objectives; track $index) {
                  <li>{{ obj }}</li>
                }
              </ul>
            </div>
          }

          @if (l.commands && l.commands.length > 0) {
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="font-mono text-[var(--text-muted)] font-semibold">Comandos clave:</span>
              @for (cmd of l.commands; track cmd) {
                <code class="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-mono text-[var(--primary-text)]">
                  {{ cmd }}
                </code>
              }
            </div>
          }
        </header>

        <!-- Cuerpo del documento según formato -->
        <div [class.slides-mode]="formato() === 'diapositivas'" [class.document-mode]="formato() === 'documento'">
          @for (slide of l.slides; track slide.slideNumber) {
            <article
              class="lesson-item mb-10 pb-8 border-b border-[var(--border)] avoid-break"
              [class.page-slide-break]="formato() === 'diapositivas'"
            >
              <div class="flex items-center justify-between gap-4 mb-4">
                <h2 class="text-lg sm:text-xl font-bold tracking-tight">
                  <span class="font-mono text-[var(--primary-text)] mr-2">{{ slide.slideNumber }}.</span>
                  <span>{{ slide.title }}</span>
                </h2>
                <span class="text-xs font-mono text-[var(--text-muted)]">
                  Pág. {{ slide.slideNumber }}
                </span>
              </div>

              <!-- Bloques de contenido -->
              <div class="space-y-4">
                @for (block of slide.blocks; track $index) {
                  <app-block-renderer [block]="block" />
                }
              </div>

              <!-- Nota del instructor si está habilitada -->
              @if (incluirNotas() && slide.notes) {
                <div class="instructor-note mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-muted)] avoid-break">
                  <div class="font-mono font-bold text-[var(--text)] uppercase tracking-wider mb-1">
                    📌 Nota didáctica del instructor:
                  </div>
                  <p class="m-0 leading-relaxed">{{ slide.notes }}</p>
                </div>
              }
            </article>
          }
        </div>

        <!-- Pie de página final -->
        <footer class="document-footer pt-6 border-t border-[var(--border)] text-center text-xs font-mono text-[var(--text-muted)] avoid-break">
          <span>LPIC-1 Study Guide · Subtema {{ l.id }} · {{ l.title }}</span>
        </footer>
      </main>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: var(--background);
    }

    @media print {
      :host {
        background: transparent !important;
      }
      .no-print {
        display: none !important;
      }
      .page-slide-break {
        break-after: page !important;
        page-break-after: always !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
        border-bottom: none !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonPrintPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);

  readonly subtopicId = signal<string>('');
  readonly formato = signal<'documento' | 'diapositivas'>('documento');
  readonly incluirNotas = signal<boolean>(true);
  readonly autoPrint = signal<boolean>(false);

  readonly lesson = signal<Lesson | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    const qParams = this.route.snapshot.queryParams;

    const id = params['subtema'] ?? '';
    this.subtopicId.set(id);

    if (qParams['formato'] === 'diapositivas') {
      this.formato.set('diapositivas');
    }
    if (qParams['notas'] === '0') {
      this.incluirNotas.set(false);
    }
    if (qParams['autoPrint'] === '1' || qParams['print'] === '1') {
      this.autoPrint.set(true);
    }

    if (id) {
      this.loadLesson(id);
    } else {
      this.error.set('Subtema no especificado.');
      this.loading.set(false);
    }
  }

  async loadLesson(subtopicId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.contentService.getLesson(subtopicId);
      this.lesson.set(data);

      if (this.autoPrint()) {
        setTimeout(() => {
          this.printDocument();
        }, 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la lección.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  onFormatoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if (val === 'documento' || val === 'diapositivas') {
      this.formato.set(val);
    }
  }

  onNotasToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.incluirNotas.set(checked);
  }

  printDocument(): void {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }
}
