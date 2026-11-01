import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamAttempt } from '../../../../core/models/attempt.model';

export interface ChartPoint {
  id: string;
  x: number;
  y: number;
  score: number;
  dateStr: string;
  passed: boolean;
  timeSpentSeconds: number;
}

@Component({
  selector: 'app-score-chart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreChartComponent {
  @Input() set attempts(items: ExamAttempt[] | null | undefined) {
    this.rawAttempts.set(items ?? []);
  }

  readonly rawAttempts = signal<ExamAttempt[]>([]);
  readonly hoveredPoint = signal<ChartPoint | null>(null);

  readonly width = 500;
  readonly height = 200;
  readonly padding = { top: 20, right: 30, bottom: 30, left: 45 };

  readonly chartPoints = computed<ChartPoint[]>(() => {
    const list = [...this.rawAttempts()]
      .filter((att) => att.score !== undefined)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    if (list.length === 0) {
      return [];
    }

    const plotWidth = this.width - this.padding.left - this.padding.right;
    const plotHeight = this.height - this.padding.top - this.padding.bottom;

    // Escala Y: 200 a 800
    const minY = 200;
    const maxY = 800;

    return list.map((att, index) => {
      const x =
        list.length === 1
          ? this.padding.left + plotWidth / 2
          : this.padding.left + (index / (list.length - 1)) * plotWidth;

      const score = att.score ?? 200;
      // Invertir Y (800 arriba, 200 abajo)
      const ratio = Math.max(0, Math.min(1, (score - minY) / (maxY - minY)));
      const y = this.padding.top + (1 - ratio) * plotHeight;
      const timeSpent = Math.max(0, att.durationSeconds - (att.timeRemainingSeconds ?? 0));

      return {
        id: att.id,
        x,
        y,
        score,
        dateStr: new Date(att.startedAt).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        }),
        passed: att.passed ?? false,
        timeSpentSeconds: timeSpent
      };
    });
  });

  readonly polylinePoints = computed<string>(() => {
    const pts = this.chartPoints();
    if (pts.length < 2) return '';
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  readonly passingY = computed<number>(() => {
    const plotHeight = this.height - this.padding.top - this.padding.bottom;
    // 500 en escala 200..800 -> ratio = 300 / 600 = 0.5
    return this.padding.top + 0.5 * plotHeight;
  });

  onPointHover(pt: ChartPoint | null): void {
    this.hoveredPoint.set(pt);
  }
}
