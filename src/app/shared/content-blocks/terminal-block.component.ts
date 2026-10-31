import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalLine } from '../../core/models/block.model';

@Component({
  selector: 'app-terminal-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-block-container my-4 rounded-xl border border-[var(--border-strong)] bg-[var(--color-slate-900)] text-slate-100 overflow-hidden font-mono shadow-md text-xs sm:text-sm">
      <!-- Cabecera de la ventana estilo consola -->
      <div class="terminal-header flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-rose-500 inline-block opacity-80"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500 inline-block opacity-80"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block opacity-80"></span>
          <span class="ml-2 text-[11px] text-slate-400 font-sans font-medium">bash — terminal</span>
        </div>

        <button
          type="button"
          class="copy-terminal-btn inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          (click)="copyCommands()"
          [attr.aria-label]="copied() ? 'Comandos copiados' : 'Copiar comandos de la terminal'"
        >
          @if (copied()) {
            <span class="text-emerald-400">✓ Copiado</span>
          } @else {
            <span>Copiar comando</span>
          }
        </button>
      </div>

      <!-- Contenido de la sesión de terminal -->
      <div class="terminal-body p-4 space-y-2 overflow-x-auto select-text leading-relaxed">
        @for (line of lines(); track $index) {
          <div class="terminal-line">
            @if (line.command) {
              <div class="terminal-cmd-row flex items-baseline gap-2">
                <span class="terminal-prompt text-emerald-400 font-bold select-none">
                  {{ line.prompt ?? '$ ' }}
                </span>
                <span class="terminal-cmd text-white font-semibold">
                  {{ line.command }}
                </span>
              </div>
            }
            @if (line.output) {
              <pre class="terminal-output text-slate-400 whitespace-pre-wrap font-mono mt-1 text-[12px] pl-4 border-l border-slate-800">{{ line.output }}</pre>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalBlockComponent {
  readonly lines = input.required<TerminalLine[]>();
  readonly copied = signal<boolean>(false);

  private readonly commandsOnlyText = computed(() => {
    return this.lines()
      .filter((l) => Boolean(l.command))
      .map((l) => l.command)
      .join('\n');
  });

  async copyCommands(): Promise<void> {
    const text = this.commandsOnlyText();
    if (!text) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }
    } catch {
      // Fallback
    }
  }
}
