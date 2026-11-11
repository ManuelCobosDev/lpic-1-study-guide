import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-auto w-full px-4 sm:px-6 lg:px-8"
      [class.app-container-fixed]="isFixed()"
      [class.app-container-standard]="!isFixed() && !isWide()"
      [class.app-container-wide]="!isFixed() && isWide()"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    .app-container-fixed {
      max-width: 1280px;
    }
    .app-container-standard,
    .app-container-wide {
      max-width: 96vw;
    }
    @media (max-width: 640px) {
      .app-container-standard,
      .app-container-wide {
        max-width: 100%;
      }
    }
  `],
  host: {
    class: 'block w-full'
  }
})
export class ContainerComponent {
  private readonly router = inject(Router, { optional: true });
  private readonly destroyRef = inject(DestroyRef, { optional: true });

  readonly wide = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly size = input<'standard' | 'wide' | 'fixed' | string>('standard');

  readonly currentUrl = signal<string>(this.router?.url ?? '/');

  readonly isHomeRoute = computed(() => {
    const withoutQuery = this.currentUrl().split('?')[0] ?? '';
    const url = withoutQuery.split('#')[0] ?? '';
    return url === '' || url === '/';
  });

  readonly isWide = computed(() => this.wide() || this.size() === 'wide');
  readonly isFixed = computed(() => this.size() === 'fixed' || (this.isHomeRoute() && !this.isWide()));

  constructor() {
    if (this.router) {
      const sub = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.currentUrl.set(event.urlAfterRedirects || event.url);
        });
      this.destroyRef?.onDestroy(() => sub.unsubscribe());
    }
  }
}
