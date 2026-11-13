import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Bloque de ilustración técnica (SVG) con pie de figura.
 *
 * El `alt` es obligatorio en el modelo y en el esquema Zod: un diagrama sin
 * descripción accesible no se publica. Las imágenes se limitan en altura para
 * que una figura 16:9 no desborde el lienzo de 1280×720 del visor de diapositivas.
 */
@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure class="image-block-figure my-4">
      <img
        class="image-block-img block mx-auto w-auto max-w-full max-h-[420px] rounded-xl border border-[var(--border)] bg-white"
        [src]="src()"
        [alt]="alt()"
        decoding="async"
        draggable="false"
      />
      @if (caption()) {
        <figcaption class="image-block-caption mt-2 text-center text-xs text-[var(--text-muted)] italic leading-relaxed">
          {{ caption() }}
        </figcaption>
      }
    </figure>
  `,
  styles: [`
    :host {
      display: block;
    }
    .image-block-img {
      height: auto;
    }
    @media print {
      .image-block-img {
        max-height: 360px;
        break-inside: avoid;
      }
      .image-block-figure {
        break-inside: avoid;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageBlockComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly caption = input<string>('');
}
