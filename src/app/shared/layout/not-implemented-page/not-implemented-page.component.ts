import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerComponent } from '../../ui/container/container.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-not-implemented-page',
  standalone: true,
  imports: [ContainerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-container>
      <div class="py-16 flex flex-col items-center justify-center text-center">
        <!-- Badge identificador de Stub -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--warning-soft)] text-[var(--warning-text)] border border-[var(--warning)]/20 mb-6">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Stub no implementado (Fase 0)</span>
        </div>

        <h1 id="page-title" class="text-3xl font-bold tracking-tight text-[var(--text)] mb-3">
          {{ pageTitle() }}
        </h1>

        <p class="text-sm font-mono text-[var(--text-muted)] bg-[var(--surface-muted)] px-3 py-1 rounded border border-[var(--border)] mb-4">
          {{ currentUrl() }}
        </p>

        <p class="text-sm text-[var(--text-muted)] max-w-md mb-8">
          Esta pantalla se implementará en la <strong>{{ targetPhase() }}</strong> según la especificación del proyecto.
        </p>

        <div class="flex items-center gap-3">
          <app-button variant="primary" routerLink="/">
            Volver al Inicio
          </app-button>
          <app-button variant="secondary" routerLink="/temario">
            Ver Temario
          </app-button>
        </div>
      </div>
    </app-container>
  `
})
export class NotImplementedPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly currentUrl = computed(() => this.router.url);

  readonly pageTitle = computed(() => {
    return (this.route.snapshot.data['title'] as string | undefined) ??
           (this.route.snapshot.title as string | undefined) ??
           'Página en desarrollo';
  });

  readonly targetPhase = computed(() => {
    return (this.route.snapshot.data['phase'] as string | undefined) ?? 'Fase posterior';
  });
}

