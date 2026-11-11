import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContainerComponent } from '../../ui/container/container.component';
import { APP_VERSION } from '../../../core/constants/version';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="w-full border-t border-[var(--border)] bg-[var(--surface)] py-8 mt-auto text-sm text-[var(--text-muted)]">
      <app-container>
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Aviso legal LPI -->
          <p class="text-xs text-center md:text-left max-w-xl">
            Guía de apoyo visual no oficial para preparar LPIC-1, basada en los LPI Learning Materials del Linux Professional Institute. No es una web oficial ni está afiliada al LPI.
          </p>

          <!-- Enlaces de utilidad -->
          <div class="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a routerLink="/acerca-de" class="hover:text-[var(--text)] transition-colors">Acerca de</a>
            <a routerLink="/legal" class="hover:text-[var(--text)] transition-colors">Aviso Legal y Privacidad</a>
            <a routerLink="/erratas" class="hover:text-[var(--text)] transition-colors">Erratas</a>
            <a routerLink="/ajustes" class="hover:text-[var(--text)] transition-colors">Ajustes</a>
            <span class="text-[var(--text-subtle)]">v{{ appVersion }}</span>
          </div>
        </div>
      </app-container>
    </footer>
  `
})
export class FooterComponent {
  readonly appVersion = APP_VERSION;
}

