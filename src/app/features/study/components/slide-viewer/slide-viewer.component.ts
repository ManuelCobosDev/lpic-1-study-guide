import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slide } from '../../../../core/models/slide.model';
import { BlockRendererComponent } from '../../../../shared/content-blocks/block-renderer.component';
import { KbdComponent } from '../../../../shared/ui/kbd/kbd.component';

@Component({
  selector: 'app-slide-viewer',
  standalone: true,
  imports: [
    CommonModule,
    BlockRendererComponent,
    KbdComponent
  ],
  template: `
    <div
      #viewerContainer
      class="slide-viewer-container relative select-none rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden shadow-md flex flex-col focus:outline-hidden"
      [class.fullscreen-active]="isFullscreen()"
      [class.cursor-none]="isFullscreen() && !showControls()"
      (mousemove)="onUserActivity()"
    >
      <!-- Anuncio accesible aria-live para lectores de pantalla -->
      <div class="sr-only" aria-live="polite">
        {{ ariaAnnouncement() }}
      </div>

      <!-- Barra superior en pantalla completa -->
      @if (isFullscreen()) {
        <div
          class="fullscreen-top-bar absolute top-0 inset-x-0 z-40 h-12 px-6 flex items-center justify-between bg-slate-950/80 backdrop-blur-md text-white border-b border-slate-800 transition-opacity duration-300"
          [class.opacity-0]="!showControls()"
          [class.pointer-events-none]="!showControls()"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              LPIC-1 · {{ subtopicId() }}
            </span>
            <span class="text-slate-500">·</span>
            <span class="text-xs text-slate-300 font-medium truncate">
              {{ currentSlide()?.title }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs font-mono font-bold text-slate-400">
              {{ currentIndex() + 1 }} / {{ totalSlides() }}
            </span>
            <button
              type="button"
              class="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              (click)="exitFullscreen()"
              aria-label="Salir de pantalla completa"
            >
              Salir (Esc)
            </button>
          </div>
        </div>
      }

      <!-- Escenario central de presentación (Letterbox 16:9 escalado) -->
      <div
        #stageWrapper
        class="stage-wrapper relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 min-h-[360px] sm:min-h-[460px] lg:min-h-[580px] bg-[var(--bg)]"
      >
        <!-- Lienzo lógico 1280x720 escalado -->
        <div
          #logicalCanvas
          class="logical-canvas relative w-[1280px] h-[720px] shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-lg overflow-hidden flex flex-col transition-transform duration-100 ease-out origin-center"
          [style.transform]="'scale(' + scale() + ')'"
          [style.zoom]="textZoom() !== 100 ? textZoom() + '%' : null"
        >
          @if (currentSlide(); as slide) {
            <article class="slide-content-wrapper flex-1 p-12 lg:p-16 flex flex-col justify-between overflow-y-auto">
              <!-- Cabecera de la diapositiva -->
              <header class="slide-header mb-6">
                @if (slide.layout === 'cover') {
                  <div class="cover-eyebrow text-xs font-mono font-bold text-[var(--primary-text)] uppercase tracking-wider mb-2">
                    Objetivo Oficial LPIC-1 {{ subtopicId() }}
                  </div>
                  <h1 class="text-4xl lg:text-5xl font-black text-[var(--text)] tracking-tight leading-tight mb-4">
                    {{ slide.title }}
                  </h1>
                } @else {
                  <div class="flex items-center justify-between gap-4 mb-2">
                    <span class="text-xs font-mono font-semibold text-[var(--text-muted)]">
                      Subtema {{ subtopicId() }} · Diapositiva {{ currentIndex() + 1 }} de {{ totalSlides() }}
                    </span>
                    @if (isViewed(currentIndex() + 1)) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[var(--success-text)]">
                        <span>●</span> Vista
                      </span>
                    }
                  </div>
                  <h2 class="text-2xl lg:text-3xl font-extrabold text-[var(--text)] tracking-tight leading-snug">
                    {{ slide.title }}
                  </h2>
                }
              </header>

              <!-- Bloques de contenido según layout -->
              <div
                class="slide-blocks-area flex-1 flex flex-col justify-center"
                [class.grid]="slide.layout === 'two-column'"
                [class.grid-cols-2]="slide.layout === 'two-column'"
                [class.gap-8]="slide.layout === 'two-column'"
              >
                @for (block of slide.blocks; track $index) {
                  <app-block-renderer [block]="block" [highlightQuery]="highlightQuery()" />
                }
              </div>

              <!-- Pie interno sutil de la diapositiva -->
              <footer class="slide-footer pt-6 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-subtle)] font-mono">
                <span>LPIC-1 Study Guide</span>
                <span>{{ currentIndex() + 1 }} / {{ totalSlides() }}</span>
              </footer>
            </article>
          } @else {
            <div class="flex-1 flex items-center justify-center text-sm text-[var(--text-muted)]">
              No hay diapositivas disponibles
            </div>
          }
        </div>
      </div>

      <!-- Barra de progreso inferior 4 px -->
      <div class="slide-progress-bar h-1 bg-[var(--border)] w-full overflow-hidden shrink-0">
        <div
          class="h-full bg-[var(--primary)] transition-all duration-200 ease-out"
          [style.width.%]="progressPercent()"
        ></div>
      </div>

      <!-- Barra de control inferior (56 px) -->
      <div
        class="slide-controls-bar h-14 px-4 sm:px-6 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between gap-2 shrink-0 transition-opacity duration-300"
        [class.opacity-0]="isFullscreen() && !showControls()"
        [class.pointer-events-none]="isFullscreen() && !showControls()"
      >
        <!-- Izquierda: Navegación Anterior / Siguiente -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="control-btn px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="currentIndex() === 0"
            (click)="prevSlide()"
            aria-label="Diapositiva anterior"
          >
            ‹ Anterior
          </button>

          <span class="slide-counter text-xs font-mono font-bold text-[var(--text)] px-2 select-none">
            {{ currentIndex() + 1 }} / {{ totalSlides() }}
          </span>

          <button
            type="button"
            class="control-btn px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="currentIndex() >= totalSlides() - 1"
            (click)="nextSlide()"
            aria-label="Siguiente diapositiva"
          >
            Siguiente ›
          </button>
        </div>

        <!-- Derecha: Botones de herramientas secundarias (Miniaturas, Notas, Zoom, Pantalla Completa, Ayuda) -->
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            [class.text-[var(--primary-text)]]="showThumbnails()"
            [class.bg-[var(--primary-soft)]]="showThumbnails()"
            (click)="toggleThumbnails()"
            title="Miniaturas (T)"
            aria-label="Alternar miniaturas de diapositivas"
          >
            <span class="text-sm" aria-hidden="true">🗂️</span>
          </button>

          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            [class.text-[var(--primary-text)]]="showNotes()"
            [class.bg-[var(--primary-soft)]]="showNotes()"
            (click)="toggleNotes()"
            title="Notas del instructor (N)"
            aria-label="Alternar notas del instructor"
          >
            <span class="text-sm" aria-hidden="true">📝</span>
          </button>

          <!-- Zoom de texto -->
          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            (click)="adjustZoom(-10)"
            title="Reducir zoom (-)"
            aria-label="A- Reducir tamaño de texto"
          >
            <span class="text-xs font-mono font-bold" aria-hidden="true">A-</span>
          </button>
          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            (click)="adjustZoom(10)"
            title="Aumentar zoom (+)"
            aria-label="A+ Aumentar tamaño de texto"
          >
            <span class="text-xs font-mono font-bold" aria-hidden="true">A+</span>
          </button>

          <!-- Pantalla completa -->
          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            [class.text-[var(--primary-text)]]="isFullscreen()"
            (click)="toggleFullscreen()"
            title="Pantalla completa (F)"
            aria-label="Alternar pantalla completa"
          >
            <span class="text-sm" aria-hidden="true">⛶</span>
          </button>

          <!-- Ayuda de atajos -->
          <button
            type="button"
            class="icon-tool-btn p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            (click)="toggleHelp()"
            title="Atajos de teclado (?)"
            aria-label="Ver atajos de teclado"
          >
            <span class="text-xs font-bold font-mono">?</span>
          </button>
        </div>
      </div>

      <!-- Cajón de Miniaturas (Thumbnails Drawer) -->
      @if (showThumbnails()) {
        <aside
          class="thumbnails-drawer absolute top-0 bottom-14 right-0 z-30 w-64 p-3 bg-[var(--surface)] border-l border-[var(--border)] overflow-y-auto shadow-xl"
          aria-label="Cajón de miniaturas"
        >
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
            <h4 class="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">
              Miniaturas ({{ totalSlides() }})
            </h4>
            <button
              type="button"
              class="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              (click)="showThumbnails.set(false)"
              aria-label="Cerrar miniaturas"
            >
              ✕
            </button>
          </div>

          <div class="space-y-2">
            @for (slide of slides(); track slide.slideNumber; let idx = $index) {
              <button
                type="button"
                class="thumb-btn w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5"
                [class.border-[var(--primary)]]="idx === currentIndex()"
                [class.bg-[var(--primary-soft)]]="idx === currentIndex()"
                [class.border-[var(--border)]]="idx !== currentIndex()"
                (click)="goToSlide(idx + 1)"
              >
                <span
                  class="w-5 h-5 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0"
                  [class.bg-[var(--primary)]]="idx === currentIndex()"
                  [class.text-white]="idx === currentIndex()"
                  [class.bg-[var(--surface-muted)]]="idx !== currentIndex()"
                  [class.text-[var(--text-muted)]]="idx !== currentIndex()"
                >
                  {{ idx + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-[var(--text)] truncate">
                    {{ slide.title }}
                  </div>
                  @if (isViewed(idx + 1)) {
                    <span class="text-[10px] font-mono text-[var(--success-text)] font-medium">✓ Vista</span>
                  }
                </div>
              </button>
            }
          </div>
        </aside>
      }

      <!-- Panel de Notas del Instructor -->
      @if (showNotes()) {
        <div
          class="notes-panel absolute bottom-14 inset-x-0 z-30 max-h-48 p-4 bg-slate-900/95 text-slate-200 border-t border-slate-800 overflow-y-auto shadow-2xl backdrop-blur-md"
          role="region"
          aria-label="Notas del instructor"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📌</span> Notas del instructor · Diapositiva {{ currentIndex() + 1 }}
            </span>
            <button
              type="button"
              class="text-xs text-slate-400 hover:text-white cursor-pointer"
              (click)="showNotes.set(false)"
              aria-label="Cerrar notas"
            >
              Cerrar ✕
            </button>
          </div>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed m-0 font-sans">
            {{ currentSlide()?.notes ?? 'No hay notas del instructor para esta diapositiva.' }}
          </p>
        </div>
      }

      <!-- Modal de Ayuda de Atajos de Teclado -->
      @if (showHelp()) {
        <div class="help-dialog-overlay absolute inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            class="help-dialog-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm border-none cursor-pointer p-0 w-full h-full"
            (click)="showHelp.set(false)"
            aria-label="Cerrar diálogo de ayuda"
          ></button>

          <div
            class="help-dialog-card relative z-10 w-full max-w-md p-6 rounded-2xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-2xl"
            role="dialog"
            aria-label="Atajos de teclado del visor de diapositivas"
          >
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
              <h3 class="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <span>⌨️</span> Atajos de Teclado
              </h3>
              <button
                type="button"
                class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                (click)="showHelp.set(false)"
                aria-label="Cerrar ayuda"
              >
                ✕
              </button>
            </div>

            <div class="space-y-2.5 text-xs sm:text-sm">
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Siguiente diapositiva</span>
                <div class="flex items-center gap-1">
                  <app-kbd>→</app-kbd>
                  <app-kbd>↓</app-kbd>
                  <app-kbd>Espacio</app-kbd>
                </div>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Diapositiva anterior</span>
                <div class="flex items-center gap-1">
                  <app-kbd>←</app-kbd>
                  <app-kbd>↑</app-kbd>
                </div>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Primera / Última</span>
                <div class="flex items-center gap-1">
                  <app-kbd>Inicio</app-kbd>
                  <app-kbd>Fin</app-kbd>
                </div>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Pantalla completa</span>
                <app-kbd>F</app-kbd>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Salir / Cerrar</span>
                <app-kbd>Esc</app-kbd>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Cajón de miniaturas</span>
                <app-kbd>T</app-kbd>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Notas del instructor</span>
                <app-kbd>N</app-kbd>
              </div>
              <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span class="text-[var(--text-muted)]">Saltar a diapositiva</span>
                <div class="flex items-center gap-1">
                  <app-kbd>1</app-kbd>
                  <span>..</span>
                  <app-kbd>9</app-kbd>
                </div>
              </div>
            </div>

            <div class="mt-6 text-right">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] cursor-pointer"
                (click)="showHelp.set(false)"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .fullscreen-active {
      position: fixed !important;
      inset: 0 !important;
      z-index: 70 !important;
      width: 100vw !important;
      height: 100vh !important;
      border-radius: 0 !important;
      border: none !important;
    }
  `],
  host: {
    '(window:keydown)': 'handleGlobalKeydown($event)',
    tabindex: '0'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideViewerComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);

  readonly subtopicId = input.required<string>();
  readonly slides = input.required<Slide[]>();
  readonly currentSlideNumber = model<number>(1);
  readonly viewedSlides = input<number[]>([]);
  readonly highlightQuery = input<string>('');

  readonly slideChange = output<number>();
  readonly slideViewed = output<number>();

  readonly viewerContainer = viewChild<ElementRef<HTMLElement>>('viewerContainer');
  readonly stageWrapper = viewChild<ElementRef<HTMLElement>>('stageWrapper');

  readonly isFullscreen = signal<boolean>(false);
  readonly showThumbnails = signal<boolean>(false);
  readonly showNotes = signal<boolean>(false);
  readonly showHelp = signal<boolean>(false);
  readonly showControls = signal<boolean>(true);
  readonly textZoom = signal<number>(100);
  readonly scale = signal<number>(1);
  readonly ariaAnnouncement = signal<string>('');

  private resizeObserver: ResizeObserver | null = null;
  private autoHideTimeout: ReturnType<typeof setTimeout> | null = null;
  private viewTimer: ReturnType<typeof setTimeout> | null = null;

  readonly totalSlides = computed(() => this.slides().length);

  readonly currentIndex = computed(() => {
    const num = this.currentSlideNumber();
    const total = this.totalSlides();
    if (total === 0) return 0;
    return Math.max(0, Math.min(num - 1, total - 1));
  });

  readonly currentSlide = computed(() => {
    const list = this.slides();
    const idx = this.currentIndex();
    return list[idx] ?? null;
  });

  readonly progressPercent = computed(() => {
    const total = this.totalSlides();
    if (total <= 1) return 100;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  constructor() {
    // Cada vez que cambia de diapositiva:
    // 1. Anunciar a lectores de pantalla
    // 2. Iniciar timer de 2s para marcar como vista
    effect(() => {
      const slide = this.currentSlide();
      const num = this.currentIndex() + 1;
      const total = this.totalSlides();
      if (slide) {
        this.ariaAnnouncement.set(`Diapositiva ${num} de ${total}: ${slide.title}`);
      }

      if (this.viewTimer) {
        clearTimeout(this.viewTimer);
      }
      this.viewTimer = setTimeout(() => {
        this.slideViewed.emit(num);
      }, 2000);
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateScale();
      });
      // Observar el contenedor para ajustar el scale
      setTimeout(() => {
        const stage = this.stageWrapper()?.nativeElement;
        if (stage && this.resizeObserver) {
          this.resizeObserver.observe(stage);
          this.calculateScale();
        }
      }, 50);
    }

    // Tomar foco para atajos sin clic previo
    setTimeout(() => {
      this.elementRef.nativeElement.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
    if (this.viewTimer) {
      clearTimeout(this.viewTimer);
    }
  }

  nextSlide(): void {
    if (this.currentIndex() < this.totalSlides() - 1) {
      this.goToSlide(this.currentIndex() + 2);
    }
  }

  prevSlide(): void {
    if (this.currentIndex() > 0) {
      this.goToSlide(this.currentIndex());
    }
  }

  goToSlide(num: number): void {
    const bounded = Math.max(1, Math.min(num, this.totalSlides()));
    this.currentSlideNumber.set(bounded);
    this.slideChange.emit(bounded);
  }

  isViewed(slideNumber: number): boolean {
    return this.viewedSlides().includes(slideNumber);
  }

  toggleThumbnails(): void {
    this.showThumbnails.update((v) => !v);
  }

  toggleNotes(): void {
    this.showNotes.update((v) => !v);
  }

  toggleHelp(): void {
    this.showHelp.update((v) => !v);
  }

  adjustZoom(delta: number): void {
    this.textZoom.update((z) => Math.max(90, Math.min(z + delta, 150)));
  }

  toggleFullscreen(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen(): void {
    const container = this.viewerContainer()?.nativeElement;
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        // Fallback CSS
        this.isFullscreen.set(true);
      });
    } else {
      this.isFullscreen.set(true);
    }
    this.isFullscreen.set(true);
    setTimeout(() => this.calculateScale(), 100);
  }

  exitFullscreen(): void {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch((err: unknown) => {
        void err;
      });
    }
    this.isFullscreen.set(false);
    setTimeout(() => this.calculateScale(), 100);
  }

  onUserActivity(): void {
    if (!this.isFullscreen()) return;
    this.showControls.set(true);
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
    this.autoHideTimeout = setTimeout(() => {
      if (this.isFullscreen() && !this.showThumbnails() && !this.showNotes() && !this.showHelp()) {
        this.showControls.set(false);
      }
    }, 2500);
  }

  calculateScale(): void {
    const stage = this.stageWrapper()?.nativeElement;
    if (!stage) return;

    const availableWidth = stage.clientWidth - 32;
    const availableHeight = stage.clientHeight - 32;

    const canvasWidth = 1280;
    const canvasHeight = 720;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;

    const newScale = Math.min(scaleX, scaleY, 1.2);
    this.scale.set(Math.max(0.2, Number(newScale.toFixed(3))));
  }

  handleGlobalKeydown(event: KeyboardEvent): void {
    // Si el usuario escribe en un campo de texto, ignorar
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        this.nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.prevSlide();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(1);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.totalSlides());
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case 'Escape':
        if (this.showHelp()) {
          this.showHelp.set(false);
        } else if (this.showNotes()) {
          this.showNotes.set(false);
        } else if (this.showThumbnails()) {
          this.showThumbnails.set(false);
        } else if (this.isFullscreen()) {
          this.exitFullscreen();
        }
        break;
      case 't':
      case 'T':
        event.preventDefault();
        this.toggleThumbnails();
        break;
      case 'n':
      case 'N':
        event.preventDefault();
        this.toggleNotes();
        break;
      case '?':
        event.preventDefault();
        this.toggleHelp();
        break;
      case '+':
        event.preventDefault();
        this.adjustZoom(10);
        break;
      case '-':
        event.preventDefault();
        this.adjustZoom(-10);
        break;
      default:
        // Teclas 1..9 para salto directo
        if (/^[1-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const target = parseInt(event.key, 10);
          if (target <= this.totalSlides()) {
            event.preventDefault();
            this.goToSlide(target);
          }
        }
        break;
    }
  }
}
