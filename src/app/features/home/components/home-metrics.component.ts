import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContainerComponent } from '../../../shared/ui';

@Component({
  selector: 'app-home-metrics',
  standalone: true,
  imports: [RouterLink, ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="metrics-section" aria-label="Métricas del curso">
      <app-container>
        <div class="metrics-grid">
          <a [routerLink]="primaryCtaLink()" class="metric-card" title="Ir a la lección actual">
            <span class="metric-number font-mono">{{ totalSlides() }}</span>
            <span class="metric-label">Diapositivas</span>
          </a>

          <a routerLink="/temario" class="metric-card">
            <span class="metric-number font-mono">{{ totalSubtopics() }}</span>
            <span class="metric-label">Subtemas</span>
          </a>

          <a routerLink="/laboratorios" class="metric-card">
            <span class="metric-number font-mono">{{ totalLabs() }}</span>
            <span class="metric-label">Prácticas</span>
          </a>

          <a routerLink="/comandos" class="metric-card">
            <span class="metric-number font-mono">{{ totalCommands() }}</span>
            <span class="metric-label">Comandos</span>
          </a>

          <a routerLink="/glosario" class="metric-card">
            <span class="metric-number font-mono">{{ totalTerms() }}</span>
            <span class="metric-label">Términos</span>
          </a>
        </div>
      </app-container>
    </section>
  `,
  styles: [`
    .metrics-section {
      padding: 32px 0;
      background-color: var(--surface-muted);
      border-bottom: 1px solid var(--border);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (min-width: 640px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 24px;
      }
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      border-radius: var(--radius-md);
      background-color: var(--surface);
      border: 1px solid var(--border);
      text-decoration: none;
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      cursor: pointer;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .metric-card:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }

    .metric-number {
      font-size: 28px;
      line-height: 32px;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 4px;
    }

    @media (min-width: 640px) {
      .metric-number {
        font-size: 32px;
        line-height: 36px;
      }
    }

    .metric-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }
  `]
})
export class HomeMetricsComponent {
  readonly primaryCtaLink = input.required<string>();
  readonly totalSlides = input.required<number>();
  readonly totalSubtopics = input.required<number>();
  readonly totalLabs = input.required<number>();
  readonly totalCommands = input.required<number>();
  readonly totalTerms = input.required<number>();
}

