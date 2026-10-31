import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContainerComponent } from '../../ui/container/container.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ContainerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <app-container>
        <div class="flex h-16 items-center justify-between gap-4">
          <!-- Logo & Marca -->
          <div class="flex items-center gap-6">
            <a routerLink="/" class="flex items-center gap-2 text-decoration-none group">
              <svg
                class="w-7 h-7 text-[var(--primary)] shrink-0"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect width="28" height="28" rx="6" fill="currentColor" fill-opacity="0.12" />
                <path d="M7 20L14 7L21 20H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span class="font-bold text-lg text-[var(--text)] tracking-tight">LPIC-1 Aula</span>
            </a>

            <!-- Navegacion escritorio -->
            <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              <a
                routerLink="/temario"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Temario</a>
              <a
                routerLink="/laboratorios"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Laboratorios</a>
              <a
                routerLink="/simulador"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Simulador</a>
              <a
                routerLink="/comandos"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Comandos</a>
              <a
                routerLink="/glosario"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Glosario</a>
              <a
                routerLink="/flashcards"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Flashcards</a>
              <a
                routerLink="/mapa-mental"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Mapa mental</a>
              <a
                routerLink="/progreso"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >Progreso</a>
            </nav>
          </div>

          <!-- Acciones Derecha -->
          <div class="flex items-center gap-2">
            <app-button
              variant="secondary"
              size="sm"
              routerLink="/buscar"
            >
              <span class="hidden sm:inline">Buscar…</span>
              <kbd class="ml-1 text-[11px] px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]">Ctrl K</kbd>
            </app-button>

            <!-- Theme Toggle -->
            <app-button
              variant="ghost"
              size="icon"
              ariaLabel="Cambiar tema claro u oscuro"
              (btnClick)="toggleTheme()"
            >
              @if (themeService.isDark()) {
                <!-- Icono Sol -->
                <svg class="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <!-- Icono Luna -->
                <svg class="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </app-button>

            <app-button
              variant="ghost"
              size="icon"
              routerLink="/ajustes"
              ariaLabel="Ajustes de la aplicación"
            >
              <svg class="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </app-button>

            <!-- Menu Movil Toggle -->
            <button
              type="button"
              class="md:hidden flex items-center justify-center w-10 h-10 rounded border border-[var(--border)] text-[var(--text)]"
              aria-label="Abrir menú de navegación"
              (click)="toggleMobileMenu()"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu movil desplegado -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-[var(--border)] py-4 space-y-2">
            <a routerLink="/temario" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Temario</a>
            <a routerLink="/laboratorios" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Laboratorios</a>
            <a routerLink="/simulador" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Simulador</a>
            <a routerLink="/comandos" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Comandos</a>
            <a routerLink="/glosario" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Glosario</a>
            <a routerLink="/flashcards" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Flashcards</a>
            <a routerLink="/mapa-mental" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Mapa mental</a>
            <a routerLink="/progreso" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Progreso</a>
          </div>
        }
      </app-container>
    </header>
  `,
  styles: [`
    .nav-link {
      padding: 6px 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: color var(--transition-fast), background-color var(--transition-fast);
    }
    .nav-link:hover {
      color: var(--text);
      background-color: var(--surface-muted);
    }
    .nav-link-active {
      color: var(--primary-text);
      font-weight: 600;
      border-bottom: 2px solid var(--primary);
      border-radius: 0;
    }
  `]
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly mobileMenuOpen = signal(false);

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

