import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slide } from '../../../../core/models/slide.model';
import { BlockRendererComponent } from '../../../../shared/content-blocks/block-renderer.component';

@Component({
  selector: 'app-lesson-web-view',
  standalone: true,
  imports: [CommonModule, BlockRendererComponent],
  template: `
    <div class="lesson-web-view relative flex flex-col lg:flex-row gap-8 items-start my-6">
      <!-- Columna Principal: Documento de Lectura Continuo (760 px de ancho) -->
      <main class="web-reading-column flex-1 max-w-[760px] w-full mx-auto space-y-12 select-text font-sans">
        @for (slide of slides(); track slide.slideNumber; let idx = $index) {
          <section
            [id]="'section-' + slide.slideNumber"
            class="web-slide-section scroll-mt-24 p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs transition-all"
            [class.border-[var(--primary)]]="activeSection() === slide.slideNumber"
          >
            <!-- Cabecera de la sección -->
            <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--border)]">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-md bg-[var(--primary-soft)] text-[var(--primary-text)] font-mono text-xs font-bold flex items-center justify-center">
                  {{ slide.slideNumber }}
                </span>
                <span class="text-xs font-mono text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  Sección {{ slide.slideNumber }} de {{ slides().length }}
                </span>
              </div>

              <!-- Botón rápido para saltar a esta diapositiva -->
              <button
                type="button"
                class="jump-to-slide-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs font-medium hover:bg-[var(--surface)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
                (click)="jumpToSlide.emit(slide.slideNumber)"
                title="Ver esta sección como diapositiva interactiva 16:9"
              >
                <span>Ver en diapositiva</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight leading-snug mb-6">
              {{ slide.title }}
            </h2>

            <!-- Bloques de contenido -->
            <div class="web-blocks-list space-y-6">
              @for (block of slide.blocks; track $index) {
                <app-block-renderer [block]="block" />
              }
            </div>

            <!-- Notas del instructor en acordeón o aviso si existen -->
            @if (slide.notes) {
              <div class="instructor-note-card mt-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-[var(--text)]">
                <div class="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider">
                  <span>📌</span> Nota didáctica del instructor
                </div>
                <p class="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed m-0 font-sans">
                  {{ slide.notes }}
                </p>
              </div>
            }
          </section>
        }
      </main>

      <!-- Columna Lateral Derecha Sticky (240 px): Índice "En esta página" con Scrollspy -->
      <aside
        class="web-toc-sidebar hidden lg:block sticky top-24 w-60 shrink-0 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs"
        aria-label="Índice de secciones del documento"
      >
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
          <span class="text-sm" aria-hidden="true">📑</span>
          <h3 class="text-xs font-mono font-bold text-[var(--text)] uppercase tracking-wider">
            En esta lección
          </h3>
        </div>

        <nav class="toc-nav space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          @for (slide of slides(); track slide.slideNumber) {
            <a
              [href]="'#section-' + slide.slideNumber"
              class="toc-link block px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate"
              [class.font-bold]="activeSection() === slide.slideNumber"
              [class.text-[var(--primary-text)]]="activeSection() === slide.slideNumber"
              [class.bg-[var(--primary-soft)]]="activeSection() === slide.slideNumber"
              [class.text-[var(--text-muted)]]="activeSection() !== slide.slideNumber"
              [class.hover:text-[var(--text)]]="activeSection() !== slide.slideNumber"
              [class.hover:bg-[var(--surface-muted)]]="activeSection() !== slide.slideNumber"
              (click)="scrollToSection($event, slide.slideNumber)"
            >
              <span class="font-mono mr-1.5 opacity-70">{{ slide.slideNumber }}. </span>
              <span>{{ slide.title }}</span>
            </a>
          }
        </nav>
      </aside>
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
export class LessonWebViewComponent implements AfterViewInit, OnDestroy {
  readonly slides = input.required<Slide[]>();
  readonly initialSection = input<number>(1);

  readonly jumpToSlide = output<number>();
  readonly sectionVisible = output<number>();

  readonly activeSection = signal<number>(1);

  private intersectionObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id; // "section-N"
              const secNum = parseInt(id.replace('section-', ''), 10);
              if (!isNaN(secNum)) {
                this.activeSection.set(secNum);
                this.sectionVisible.emit(secNum);
              }
            }
          });
        },
        { threshold: 0.3 }
      );

      const sections = document.querySelectorAll('.web-slide-section');
      sections.forEach((s) => this.intersectionObserver?.observe(s));
    }

    // Si viene con sección inicial, hacer scroll suave hacia ella
    const initSec = this.initialSection();
    if (initSec > 1) {
      setTimeout(() => {
        const target = document.getElementById('section-' + initSec);
        if (typeof target?.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  scrollToSection(event: MouseEvent, sectionNumber: number): void {
    event.preventDefault();
    this.activeSection.set(sectionNumber);
    const target = document.getElementById('section-' + sectionNumber);
    if (typeof target?.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

