import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WikiRefService } from '../../../core/services/wiki-ref.service';

@Component({
  selector: 'app-wiki-popover',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (wikiRefService.activePopover(); as item) {
      <div
        class="wiki-popover-overlay fixed inset-0 z-50 pointer-events-none"
      >
        <div
          class="term-link-card preview-card pointer-events-auto absolute z-50 w-80 max-w-[320px] p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-xl transition-all"
          [style.left.px]="boundedX(item.x)"
          [style.top.px]="boundedY(item.y)"
          role="dialog"
          aria-modal="false"
          [attr.aria-label]="(item.type === 'command' ? 'Término comando: ' : 'Término: ') + item.title"
          (mouseenter)="wikiRefService.keepOpen()"
          (mouseleave)="wikiRefService.onTargetLeave()"
          (keydown.escape)="wikiRefService.closePopover()"
          tabindex="-1"
        >
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
              [routerLink]="item.link"
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

  boundedX(rawX: number): number {
    if (typeof window !== 'undefined') {
      const maxX = window.innerWidth - 340;
      return Math.max(16, Math.min(rawX - 40, maxX));
    }
    return Math.max(16, rawX - 40);
  }

  boundedY(rawY: number): number {
    if (typeof window !== 'undefined') {
      // Si se desborda por abajo, voltear hacia arriba (flip)
      if (rawY + 280 > window.innerHeight + window.scrollY) {
        return Math.max(16, rawY - 260);
      }
    }
    return rawY + 16;
  }
}
