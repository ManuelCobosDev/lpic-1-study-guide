import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WikiRefData } from '../../../core/models/wiki-ref.model';

@Component({
  selector: 'app-wiki-popover',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (data(); as item) {
      <div
        class="wiki-popover-overlay fixed inset-0 z-50 pointer-events-none"
      >
        <div
          class="wiki-popover-card pointer-events-auto absolute z-50 w-80 max-w-[calc(100vw-32px)] p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-xl transition-all"
          [style.left.px]="boundedX(item.x)"
          [style.top.px]="item.y + 24"
          role="dialog"
          aria-modal="false"
          [attr.aria-label]="item.title"
        >
          <!-- Cabecera -->
          <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--border)]">
            <div class="flex items-center gap-2">
              <span class="text-base" aria-hidden="true">
                {{ item.type === 'command' ? '💻' : '📖' }}
              </span>
              <h4 class="font-mono font-bold text-sm text-[var(--text)]">
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

          <!-- Descripción / Definición estilo Wikipedia -->
          <p class="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
            {{ item.description }}
          </p>

          <!-- Pie con enlace a catálogo y botón cerrar -->
          <div class="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
            <a
              [routerLink]="item.link"
              class="font-semibold text-[var(--primary-text)] hover:underline inline-flex items-center gap-1"
              (click)="dismiss.emit()"
            >
              <span>Ver ficha completa</span>
              <span aria-hidden="true">→</span>
            </a>

            <button
              type="button"
              class="text-[11px] text-[var(--text-subtle)] hover:text-[var(--text)] px-1.5 py-0.5 rounded cursor-pointer"
              (click)="dismiss.emit()"
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
  readonly data = input<WikiRefData | null>(null);
  readonly dismiss = output<void>();

  boundedX(rawX: number): number {
    // Evita que el popover se salga por la derecha de la pantalla
    if (typeof window !== 'undefined') {
      const maxX = window.innerWidth - 340;
      return Math.max(16, Math.min(rawX - 40, maxX));
    }
    return Math.max(16, rawX - 40);
  }
}
