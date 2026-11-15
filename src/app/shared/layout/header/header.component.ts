import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ContainerComponent } from '../../ui/container/container.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchService } from '../../../core/services/search.service';
import { TourService } from '../../../core/services/tour.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ContainerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <app-container>
        <div class="flex h-16 items-center justify-between gap-2 sm:gap-3 xl:gap-4 header-content">
          <!-- Logo & Marca -->
          <div class="flex items-center shrink-0">
            <a routerLink="/" class="flex items-center gap-2 text-decoration-none group shrink-0">
              <svg
                class="w-7 h-7 text-[var(--primary)] shrink-0 transition-transform group-hover:scale-105"
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
              <span class="flex flex-col leading-none">
                <span class="font-bold text-base lg:text-sm xl:text-lg text-[var(--text)] tracking-tight whitespace-nowrap"><span class="sm:hidden">LPIC-1</span><span class="hidden sm:inline">LPIC-1 Study Guide</span></span>
                <span class="hidden sm:inline lg:hidden xl:inline text-[10px] font-medium text-[var(--text-muted)] tracking-tight whitespace-nowrap mt-0.5">Guía de apoyo visual · No oficial</span>
              </span>
            </a>
          </div>

          <!-- Navegación escritorio con separación fluida y expansible -->
          <nav
            class="hidden lg:flex items-center main-nav"
            [class.nav-home]="isHome()"
            [class.nav-wide]="!isHome()"
            aria-label="Navegación principal"
          >
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

          <!-- Acciones Derecha (Buscador expandible + Tema + Ajustes) -->
          <div class="flex items-center gap-1 sm:gap-2.5 shrink-0 justify-end header-actions">
            <!-- Disparador del Buscador tipo Command Palette con expansión transicionada -->
            <button
              type="button"
              class="search-trigger group flex items-center justify-between h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/70 hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)] px-2 sm:px-3 text-xs sm:text-sm cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 select-none"
              [class.search-home]="isHome()"
              [class.search-wide]="!isHome()"
              (click)="openSearchPalette($event)"
              aria-label="Buscar en la guía LPIC-1 (Ctrl + K)"
            >
              <div class="flex items-center gap-2 truncate min-w-0">
                <svg
                  class="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] shrink-0 transition-colors"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="truncate font-normal hidden sm:inline">
                  @if (isHome()) {
                    Buscar en la guía...
                  } @else {
                    <span class="inline xl:hidden">Buscar en la guía...</span>
                    <span class="hidden xl:inline">Buscar temas, comandos, glosario, preguntas...</span>
                  }
                </span>
                <span class="sm:hidden font-normal text-[11px]">Buscar...</span>
              </div>
              <kbd class="hidden xl:inline-flex items-center ml-2 text-[10px] xl:text-[11px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shrink-0 shadow-2xs">Ctrl K</kbd>
            </button>

            <!-- Botón de Tour Guiado (visible en >= sm; en < sm vive en el menú móvil) -->
            <span class="hidden sm:inline-flex">
              <app-button
                variant="ghost"
                size="sm"
                ariaLabel="Iniciar tour guiado por la aplicación"
                data-testid="header-start-tour-btn"
                (btnClick)="startTour()"
              >
                <svg
                  class="w-4 h-4 text-[var(--primary)] shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span class="hidden text-xs font-semibold" [class.2xl:inline]="!isHome()">Tour</span>
              </app-button>
            </span>

            <!-- Theme Toggle -->
            <app-button
              variant="ghost"
              size="icon"
              ariaLabel="Cambiar tema claro u oscuro"
              (btnClick)="toggleTheme()"
            >
              @if (themeService.isDark()) {
                <svg class="w-5 h-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
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
              class="lg:hidden flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
              [attr.aria-expanded]="mobileMenuOpen()"
              [attr.aria-label]="mobileMenuOpen() ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'"
              (click)="toggleMobileMenu()"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu movil desplegado -->
        @if (mobileMenuOpen()) {
          <div class="lg:hidden border-t border-[var(--border)] py-4 space-y-2">
            <a routerLink="/temario" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Temario</a>
            <a routerLink="/laboratorios" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Laboratorios</a>
            <a routerLink="/simulador" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Simulador</a>
            <a routerLink="/comandos" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Comandos</a>
            <a routerLink="/glosario" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Glosario</a>
            <a routerLink="/flashcards" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Flashcards</a>
            <a routerLink="/mapa-mental" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Mapa mental</a>
            <a routerLink="/progreso" (click)="closeMobileMenu()" class="block px-3 py-2 rounded text-[var(--text)] hover:bg-[var(--surface-muted)]">Progreso</a>
            <div class="pt-2 mt-2 border-t border-[var(--border)]">
              <button
                type="button"
                data-testid="mobile-start-tour-btn"
                (click)="startTourFromMobile()"
                class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-[var(--primary-text)] bg-[var(--primary-soft)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <svg
                  class="w-4 h-4 shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>Empezar tour guiado (~1 min)</span>
              </button>
            </div>
          </div>
        }
      </app-container>
    </header>
  `,
  styles: [`
    .header-content {
      transition: gap 450ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .main-nav {
      transition: gap 450ms cubic-bezier(0.16, 1, 0.3, 1), margin 450ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-home {
      gap: 2px;
      margin-left: 0.25rem;
    }
    @media (min-width: 1280px) {
      .nav-home {
        gap: 4px;
        margin-left: 0.75rem;
      }
    }
    .nav-wide {
      gap: 2px;
      margin-left: 0.25rem;
    }
    @media (min-width: 1280px) {
      .nav-wide {
        gap: 6px;
        margin-left: 1rem;
      }
    }
    @media (min-width: 1536px) {
      .nav-wide {
        gap: 14px;
        margin-left: 1.5rem;
      }
    }
    @media (min-width: 1920px) {
      .nav-wide {
        gap: 24px;
        margin-left: 2.5rem;
      }
    }
    .nav-link {
      padding: 5px 6px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      text-decoration: none;
      white-space: nowrap;
      transition: color var(--transition-fast), background-color var(--transition-fast), padding 450ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    @media (min-width: 1280px) {
      .nav-link {
        padding: 6px 8px;
        font-size: 13px;
      }
    }
    @media (min-width: 1536px) {
      .nav-wide .nav-link {
        padding: 6px 12px;
        font-size: 14px;
      }
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

    .search-trigger {
      transition: width 450ms cubic-bezier(0.16, 1, 0.3, 1), max-width 450ms cubic-bezier(0.16, 1, 0.3, 1), background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    }
    .search-home {
      width: clamp(88px, 26vw, 130px);
    }
    @media (min-width: 640px) {
      .search-home {
        width: 168px;
      }
    }
    @media (min-width: 1024px) {
      .search-home {
        width: 112px;
      }
    }
    @media (min-width: 1280px) {
      .search-home {
        width: 196px;
      }
    }
    .search-wide {
      width: clamp(88px, 26vw, 130px);
    }
    @media (min-width: 640px) {
      .search-wide {
        width: 168px;
      }
    }
    @media (min-width: 1024px) {
      .search-wide {
        width: 112px;
      }
    }
    @media (min-width: 1280px) {
      .search-wide {
        width: 240px;
      }
    }
    @media (min-width: 1400px) {
      .search-wide {
        width: 270px;
      }
    }
    @media (min-width: 1536px) {
      .search-wide {
        width: 360px;
      }
    }
    @media (min-width: 1920px) {
      .search-wide {
        width: 520px;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly router = inject(Router, { optional: true });
  private readonly destroyRef = inject(DestroyRef, { optional: true });

  protected readonly themeService = inject(ThemeService);
  protected readonly searchService = inject(SearchService);
  private readonly tourService = inject(TourService);
  protected readonly mobileMenuOpen = signal(false);

  readonly currentUrl = signal<string>(this.router?.url ?? '/');

  readonly isHome = computed(() => {
    const withoutQuery = (this.currentUrl().split('?')[0] ?? '').split('#')[0] ?? '';
    return withoutQuery === '' || withoutQuery === '/';
  });

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

  openSearchPalette(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    this.searchService.openPalette();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  startTour(): void {
    void this.tourService.startTour();
  }

  startTourFromMobile(): void {
    this.closeMobileMenu();
    void this.tourService.startTour();
  }
}
