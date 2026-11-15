import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WikiRefService } from '../../../core/services/wiki-ref.service';
import { WikiAnchorRect } from '../../../core/models/wiki-ref.model';

export type PopoverPlacement = 'above' | 'below';

export interface PopoverPosition {
  placement: PopoverPlacement;
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  arrowLeft: number;
}

@Component({
  selector: 'app-wiki-popover',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (wikiRefService.activePopover(); as item) {
      @if (position(); as pos) {
        <div
          class="wiki-popover-overlay fixed inset-0 z-50 pointer-events-none"
        >
          <div
            class="term-link-card preview-card pointer-events-auto absolute z-50 p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-2xl transition-[opacity,transform] duration-150 animate-in fade-in"
            [style.left.px]="pos.left"
            [style.top.px]="pos.top"
            [style.width.px]="pos.width"
            [style.max-height.px]="pos.maxHeight"
            role="dialog"
            aria-modal="false"
            [attr.aria-label]="(item.type === 'command' ? 'Término comando: ' : 'Término: ') + item.title"
            (mouseenter)="wikiRefService.keepOpen()"
            (mouseleave)="wikiRefService.onTargetLeave()"
            (keydown.escape)="wikiRefService.closePopover()"
            tabindex="-1"
          >
            <!-- Puente interactivo invisible para no perder hover al cruzar el gap -->
            @if (pos.placement === 'below') {
              <div class="absolute -top-2.5 left-0 right-0 h-2.5" aria-hidden="true"></div>
            } @else {
              <div class="absolute -bottom-2.5 left-0 right-0 h-2.5" aria-hidden="true"></div>
            }

            <!-- Flecha indicadora apuntando hacia el concepto -->
            @if (pos.placement === 'below') {
              <div
                class="popover-arrow absolute -top-1.5 w-3 h-3 bg-[var(--surface-elevated)] border-t border-l border-[var(--border-strong)] rotate-45 pointer-events-none"
                [style.left.px]="pos.arrowLeft - 6"
                aria-hidden="true"
              ></div>
            } @else {
              <div
                class="popover-arrow absolute -bottom-1.5 w-3 h-3 bg-[var(--surface-elevated)] border-b border-r border-[var(--border-strong)] rotate-45 pointer-events-none"
                [style.left.px]="pos.arrowLeft - 6"
                aria-hidden="true"
              ></div>
            }

            <!-- Contenido scrollable si la pantalla es de altura reducida -->
            <div class="popover-scroll-area overflow-y-auto max-h-[calc(100%-8px)] pr-1">
              <!-- Cabecera -->
              <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--border)]">
                <div class="flex items-center gap-2">
                  <span class="text-base" aria-hidden="true">
                    {{ item.type === 'command' ? '💻' : '📖' }}
                  </span>
                  <h4
                    class="font-bold text-sm text-[var(--text)]"
                    [class.font-mono]="item.type === 'command'"
                  >
                    {{ item.title }}
                  </h4>
                </div>
                <span
                  class="text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold"
                  [class.bg-[var(--primary-soft)]]="item.type === 'command'"
                  [class.text-[var(--primary-text)]]="item.type === 'command'"
                  [class.bg-[var(--info-soft)]]="item.type === 'term'"
                  [class.text-[var(--info-text)]]="item.type === 'term'"
                >
                  {{ item.badge }}
                </span>
              </div>

              <!-- Sinopsis si es comando -->
              @if (item.synopsis) {
                <div class="mb-2 px-2 py-1 rounded bg-[var(--surface-muted)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto">
                  {{ item.synopsis }}
                </div>
              }

              <!-- Definición breve (short) -->
              <p class="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                {{ item.short || item.description }}
              </p>

              <!-- Sección Se explica en (hasta 3 ubicaciones) -->
              @if (item.locations && item.locations.length > 0) {
                <div class="mb-3 space-y-1.5">
                  <span class="text-[11px] font-semibold text-[var(--text-muted)] block">Se explica en:</span>
                  @for (loc of item.locations; track loc.link) {
                    <a
                      [routerLink]="['/estudiar', loc.subtopicId]"
                      [queryParams]="loc.queryParams"
                      class="explained-in-btn inline-flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--primary-text)] text-xs font-semibold transition-colors"
                      (click)="wikiRefService.closePopover()"
                    >
                      <span aria-hidden="true">📍</span>
                      <span class="truncate">{{ loc.label }}</span>
                      <span class="ml-auto text-xs" aria-hidden="true">→</span>
                    </a>
                  }
                </div>
              } @else if (item.sinExplicacion) {
                <div class="mb-3 p-2 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] text-[var(--text-muted)]">
                  <span class="font-semibold block mb-0.5">Sin diapositiva específica:</span>
                  <span>{{ item.sinExplicacion }}</span>
                </div>
              }

              <!-- Pie con enlace a catálogo y botón cerrar -->
              <div class="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                <a
                  [routerLink]="item.targetPath || item.link"
                  [queryParams]="item.queryParams"
                  class="font-semibold text-[var(--primary-text)] hover:underline inline-flex items-center gap-1"
                  (click)="wikiRefService.closePopover()"
                >
                  <span>{{ item.type === 'command' ? 'Ver en comandos' : 'Ver en glosario' }}</span>
                  <span aria-hidden="true">→</span>
                </a>

                <button
                  type="button"
                  class="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text)] px-1.5 py-0.5 rounded cursor-pointer"
                  (click)="wikiRefService.closePopover()"
                  aria-label="Cerrar ventana emergente"
                >
                  Cerrar ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WikiPopoverComponent {
  readonly wikiRefService = inject(WikiRefService);

  readonly position = computed<PopoverPosition | null>(() => {
    const item = this.wikiRefService.activePopover();
    if (!item) return null;

    const MARGIN = 12;
    const GAP = 8;
    const ESTIMATED_HEIGHT = 280;

    if (typeof window === 'undefined') {
      return {
        placement: 'below',
        top: item.y + GAP,
        left: item.x,
        width: 320,
        maxHeight: 360,
        arrowLeft: 24
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const CARD_WIDTH = Math.min(320, viewportWidth - 2 * MARGIN);

    const rect: WikiAnchorRect = item.anchorRect ?? {
      top: item.y - 24,
      bottom: item.y,
      left: item.x,
      right: item.x + 60,
      width: 60,
      height: 24
    };

    // Espacio vertical disponible relativo al viewport
    const spaceBelow = viewportHeight - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;

    let placement: PopoverPlacement = 'below';
    let top = 0;
    let maxHeight = 360;

    if (spaceBelow >= ESTIMATED_HEIGHT + GAP) {
      // Cabe holgadamente debajo
      placement = 'below';
      top = rect.bottom + GAP;
      maxHeight = Math.max(160, spaceBelow - GAP);
    } else if (spaceAbove >= ESTIMATED_HEIGHT + GAP) {
      // Cabe holgadamente encima (flip)
      placement = 'above';
      top = Math.max(MARGIN, rect.top - ESTIMATED_HEIGHT - GAP);
      maxHeight = Math.max(160, spaceAbove - GAP);
    } else {
      // Si no cabe completo en ninguno, elegir el lado con más espacio disponible
      if (spaceBelow >= spaceAbove) {
        placement = 'below';
        top = rect.bottom + GAP;
        maxHeight = Math.max(140, spaceBelow - GAP);
      } else {
        placement = 'above';
        top = MARGIN;
        maxHeight = Math.max(140, spaceAbove - GAP);
      }
    }

    // Posición horizontal (alineada al inicio del anchor, acotada al viewport)
    const minLeft = MARGIN;
    const maxLeft = Math.max(MARGIN, viewportWidth - CARD_WIDTH - MARGIN);
    const left = Math.max(minLeft, Math.min(rect.left, maxLeft));

    // Flecha apuntando al centro del concepto
    const anchorCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(16, Math.min(anchorCenter - left, CARD_WIDTH - 16));

    return {
      placement,
      top,
      left,
      width: CARD_WIDTH,
      maxHeight,
      arrowLeft
    };
  });

  /**
   * Métodos auxiliares compatibles con llamadas externas existentes
   */
  boundedX(rawX: number): number {
    if (typeof window !== 'undefined') {
      const maxX = window.innerWidth - 340;
      return Math.max(16, Math.min(rawX, maxX));
    }
    return Math.max(16, rawX);
  }

  boundedY(rawY: number): number {
    if (typeof window !== 'undefined') {
      if (rawY + 280 > window.innerHeight) {
        return Math.max(16, rawY - 280);
      }
    }
    return rawY + 8;
  }
}
