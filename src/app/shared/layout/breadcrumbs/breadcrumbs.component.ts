import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { ContainerComponent } from '../../ui/container/container.component';

export interface Crumb {
  label: string;
  url: string;
}

const KNOWN_LABELS: Record<string, string> = {
  temario: 'Temario',
  estudiar: 'Temario',
  laboratorios: 'Laboratorios',
  simulador: 'Simulador',
  examen: 'Simulacro',
  practica: 'Práctica',
  resultados: 'Resultados',
  comandos: 'Comandos',
  glosario: 'Glosario',
  flashcards: 'Flashcards',
  'mapa-mental': 'Mapa mental',
  buscar: 'Búsqueda',
  progreso: 'Progreso',
  erratas: 'Fe de erratas',
  ajustes: 'Ajustes',
  'acerca-de': 'Acerca de',
  'guia-estilos': 'Guía de estilos',
  imprimir: 'Imprimir'
};

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (crumbs().length > 1) {
      <nav aria-label="Migas de pan" class="w-full border-b border-[var(--border)] bg-[var(--surface-muted)] py-2 text-xs">
        <app-container>
          <ol class="flex items-center gap-2 flex-wrap">
            @for (crumb of crumbs(); track crumb.url; let last = $last) {
              <li class="flex items-center gap-2">
                @if (!last) {
                  <a
                    [routerLink]="crumb.url"
                    class="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {{ crumb.label }}
                  </a>
                  <span class="text-[var(--text-subtle)]" aria-hidden="true">/</span>
                } @else {
                  <span class="font-medium text-[var(--text)]" aria-current="page">{{ crumb.label }}</span>
                }
              </li>
            }
          </ol>
        </app-container>
      </nav>
    }
  `
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly crumbs = computed<Crumb[]>(() => {
    const url = this.navigationEnd();
    if (!url || url === '/') {
      return [];
    }

    const segments = url.split('?')[0]?.split('/').filter(Boolean) ?? [];
    const result: Crumb[] = [{ label: 'Inicio', url: '/' }];

    let accUrl = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) {
        continue;
      }
      accUrl += `/${segment}`;

      // Si es el segmento virtual 'estudiar', redirigir el enlace de la miga a '/temario'
      const targetUrl = segment === 'estudiar' ? '/temario' : accUrl;
      const label = this.formatSegmentLabel(segment, segments, i);

      result.push({
        label,
        url: targetUrl
      });
    }

    return result;
  });

  private formatSegmentLabel(segment: string, allSegments: string[], index: number): string {
    const lower = segment.toLowerCase();
    if (KNOWN_LABELS[lower]) {
      return KNOWN_LABELS[lower];
    }

    // Caso de laboratorios con slug: 'lab-101-1' -> 'Lab 101.1'
    if (lower.startsWith('lab-')) {
      const rest = segment.slice(4).replace('-', '.');
      return `Lab ${rest}`;
    }

    // Subtemas con punto: '105.1' -> 'Subtema 105.1'
    if (/^\d+\.\d+$/.test(segment)) {
      return `Subtema ${segment}`;
    }

    // Segmentos numéricos en temario: /temario/101 -> 'Examen 101', /temario/101/101 -> 'Tema 101'
    if (/^\d{3}$/.test(segment)) {
      if (index === 1 && allSegments[0] === 'temario') {
        return `Examen ${segment}`;
      }
      if (index === 2 && allSegments[0] === 'temario') {
        return `Tema ${segment}`;
      }
    }

    // Formateo por defecto: reemplazo de guiones por espacios y capitalización inicial
    const clean = decodeURIComponent(segment).replace(/-/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}
