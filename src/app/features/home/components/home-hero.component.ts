import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ContainerComponent,
  ProgressBarComponent,
  ProgressRingComponent
} from '../../../shared/ui';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [
    RouterLink,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    ProgressBarComponent,
    ProgressRingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero-section" aria-label="Introducción al curso">
      <app-container>
        <div class="hero-grid">
          <div class="hero-text-col">
            <div class="hero-eyebrow">
              <span class="hero-badge">GUÍA DE APOYO VISUAL · NO OFICIAL · LPIC-1 (101 Y 102)</span>
            </div>

            <h1 class="hero-title">
              Prepara el LPIC-1 a tu ritmo, sin cuentas ni registros
            </h1>

            <p class="hero-desc">
              Guía de apoyo visual interactiva con el contenido completo de los exámenes 101-500 y 102-500. Diapositivas interactivas,
              laboratorios guiados con terminal y simulador de examen real guardados solo en tu navegador.
            </p>

            <div class="hero-cta-group">
              <app-button
                variant="primary"
                size="lg"
                [routerLink]="primaryCtaLink()"
              >
                {{ primaryCtaText() }}
              </app-button>

              <app-button
                variant="secondary"
                size="lg"
                routerLink="/temario"
              >
                Explorar temario
              </app-button>
            </div>
          </div>

          <!-- Tarjeta de progreso en Hero -->
          <div class="hero-card-col">
            <app-card>
              <div class="progress-card-inner">
                <div class="progress-card-header">
                  <div>
                    <h3 class="progress-card-title">Tu progreso de estudio</h3>
                    <p class="progress-card-subtitle">Examen 101-500 · Administrador Linux</p>
                  </div>
                  <app-badge [variant]="exam101Progress() > 0 ? 'primary' : 'neutral'">
                    {{ exam101Progress() > 0 ? 'En curso' : 'Sin empezar' }}
                  </app-badge>
                </div>

                <div class="progress-ring-row">
                  <app-progress-ring
                    [value]="exam101Progress()"
                    [size]="96"
                    subtitle="Objetivos"
                  />
                  <div class="progress-bars-col">
                    <div class="prog-bar-item">
                      <div class="prog-bar-label">
                        <span>Examen 101 (Temas 101–104)</span>
                        <span class="font-mono">{{ exam101Progress() }}%</span>
                      </div>
                      <app-progress-bar [value]="exam101Progress()" variant="primary" />
                    </div>

                    <div class="prog-bar-item">
                      <div class="prog-bar-label">
                        <span>Examen 102 (Temas 105–110)</span>
                        <span class="font-mono">{{ exam102Progress() }}%</span>
                      </div>
                      <app-progress-bar [value]="exam102Progress()" variant="warning" />
                    </div>
                  </div>
                </div>

                <div class="progress-card-footer">
                  <span class="streak-text">Racha: 1 día · 0 h estudiadas</span>
                  @if (exam101Progress() === 0) {
                    <span class="text-xs text-[var(--text-subtle)]">Todo listo para empezar</span>
                  } @else {
                    <a [routerLink]="primaryCtaLink()" class="resume-link">Continuar lección →</a>
                  }
                </div>
              </div>
            </app-card>
          </div>
        </div>
      </app-container>
    </section>
  `,
  styles: [`
    .hero-section {
      padding: 64px 0 48px 0;
      border-bottom: 1px solid var(--border);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }

    @media (min-width: 1024px) {
      .hero-grid {
        grid-template-columns: 7fr 5fr;
      }
    }

    .hero-eyebrow {
      margin-bottom: 12px;
    }

    .hero-badge {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-text);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .hero-title {
      font-size: 32px;
      line-height: 40px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    @media (min-width: 640px) {
      .hero-title {
        font-size: 40px;
        line-height: 48px;
      }
    }

    @media (min-width: 1024px) {
      .hero-title {
        font-size: 48px;
        line-height: 56px;
      }
    }

    .hero-desc {
      font-size: 16px;
      line-height: 26px;
      color: var(--text-muted);
      margin-bottom: 32px;
      max-width: 580px;
    }

    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .progress-card-inner {
      padding: 4px;
    }

    .progress-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .progress-card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 2px;
    }

    .progress-card-subtitle {
      font-size: 13px;
      color: var(--text-muted);
    }

    .progress-ring-row {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      margin-bottom: 24px;
    }

    @media (min-width: 480px) {
      .progress-ring-row {
        flex-direction: row;
        align-items: center;
      }
    }

    .progress-bars-col {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .prog-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .progress-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 12px;
    }

    .streak-text {
      color: var(--text-muted);
    }

    .resume-link {
      color: var(--primary-text);
      font-weight: 600;
      text-decoration: none;
    }

    .resume-link:hover {
      text-decoration: underline;
    }
  `]
})
export class HomeHeroComponent {
  readonly primaryCtaLink = input.required<string>();
  readonly primaryCtaText = input.required<string>();
  readonly exam101Progress = input.required<number>();
  readonly exam102Progress = input.required<number>();
}

