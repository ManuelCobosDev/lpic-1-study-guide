import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { FooterComponent } from '../footer/footer.component';
import { ContainerComponent } from '../../ui/container/container.component';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent, BreadcrumbsComponent, FooterComponent, ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Skip-link para accesibilidad -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-[var(--color-slate-0)] focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
    >
      Saltar al contenido
    </a>

    <div class="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <!-- Header -->
      <app-header />

      <!-- Breadcrumbs -->
      <app-breadcrumbs />

      <!-- Banner de privacidad descartable -->
      @if (showPrivacyBanner()) {
        <aside aria-label="Aviso de privacidad" class="border-b border-[var(--border)] bg-[var(--info-soft)] text-[var(--info-text)] py-2 text-xs">
          <app-container>
            <div class="flex items-center justify-between gap-4">
              <p>
                Tu progreso se guarda solo en este navegador. Puedes exportar una copia de seguridad en
                <a routerLink="/ajustes" class="underline font-semibold hover:opacity-80">Ajustes</a>.
              </p>
              <button
                type="button"
                class="px-2 py-0.5 rounded border border-current font-medium hover:bg-black/5"
                (click)="dismissPrivacyBanner()"
              >
                Entendido
              </button>
            </div>
          </app-container>
        </aside>
      }

      <!-- Main Content -->
      <main id="main-content" tabindex="-1" class="flex-1 focus:outline-none">
        <router-outlet />
      </main>

      <!-- Footer -->
      <app-footer />
    </div>
  `
})
export class AppShellComponent {
  private readonly storage = inject(StorageService);
  private readonly BANNER_KEY = 'privacy_banner_dismissed';

  readonly showPrivacyBanner = signal<boolean>(!this.storage.getItem(this.BANNER_KEY));

  dismissPrivacyBanner(): void {
    this.storage.setItem(this.BANNER_KEY, 'true');
    this.showPrivacyBanner.set(false);
  }
}

