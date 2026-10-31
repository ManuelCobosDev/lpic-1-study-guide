import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slide-html-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slide-html-container my-4 rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
      <iframe
        [src]="assetPath()"
        [title]="title()"
        class="w-full aspect-video border-none block"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      ></iframe>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideHtmlBlockComponent {
  readonly assetPath = input.required<string>();
  readonly title = input<string>('Diapositiva HTML');
}
