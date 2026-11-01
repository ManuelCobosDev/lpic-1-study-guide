import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { ContainerComponent } from '../../ui/container/container.component';

interface Crumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (crumbs().length > 1) {
      <nav aria-label="Miga de pan" class="py-2.5 border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
        <app-container>
          <ol class="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap">
            @for (crumb of crumbs(); track crumb.url; let isLast = $last) {
              <li class="flex items-center gap-1.5">
                @if (!isLast) {
                  <a [routerLink]="crumb.url" class="hover:text-[var(--text)] transition-colors">
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
    for (const segment of segments) {
      accUrl += `/${segment}`;
      const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
      result.push({
        label: decodeURIComponent(capitalized),
        url: accUrl
      });
    }

    return result;
  });
}

