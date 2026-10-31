import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepItem } from '../../core/models/block.model';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';

@Component({
  selector: 'app-steps-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ol class="steps-list my-5 space-y-4 list-none p-0">
      @for (step of items(); track step.number) {
        <li class="step-item flex items-start gap-3.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <span
            class="step-badge shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold font-mono flex items-center justify-center select-none"
            aria-hidden="true"
          >
            {{ step.number }}
          </span>
          <div class="step-content flex-1 min-w-0">
            <h4 class="step-title text-sm font-bold text-[var(--text)] mb-1">
              {{ step.title }}
            </h4>
            <div
              class="step-description text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed"
              [innerHTML]="parseDescription(step.description)"
            ></div>
          </div>
        </li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsBlockComponent {
  readonly items = input.required<StepItem[]>();

  parseDescription(desc: string): string {
    return parseInlineMarkdown(desc);
  }
}

