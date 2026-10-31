import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeatmapDay {
  dateStr: string;
  displayDate: string;
  minutes: number;
  level: 0 | 1 | 2 | 3;
}

export interface HeatmapWeek {
  weekNumber: number;
  monthLabel?: string;
  days: HeatmapDay[];
}

@Component({
  selector: 'app-activity-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-heatmap.component.html',
  styleUrls: ['./activity-heatmap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityHeatmapComponent {
  @Input() set activityData(data: Record<string, number> | null | undefined) {
    this.rawActivity.set(data ?? {});
  }

  readonly rawActivity = signal<Record<string, number>>({});
  readonly hoveredDay = signal<HeatmapDay | null>(null);

  readonly weeks = computed<HeatmapWeek[]>(() => {
    const activity = this.rawActivity();
    const today = new Date();
    // 26 semanas atrás redondeadas al lunes previo
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 26 * 7);
    const dayOfWeek = (startDate.getDay() + 6) % 7; // Lunes=0, Domingo=6
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const result: HeatmapWeek[] = [];
    const currentDate = new Date(startDate);
    let lastMonth = -1;

    for (let w = 0; w < 26; w++) {
      const days: HeatmapDay[] = [];
      let monthLabel: string | undefined;

      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const minutes = activity[dateStr] || 0;
        let level: 0 | 1 | 2 | 3 = 0;
        if (minutes > 45) level = 3;
        else if (minutes > 15) level = 2;
        else if (minutes > 0) level = 1;

        const currentMonth = currentDate.getMonth();
        if (d === 0 && currentMonth !== lastMonth) {
          lastMonth = currentMonth;
          monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'short' });
        }

        days.push({
          dateStr,
          displayDate: currentDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          minutes,
          level
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      result.push({
        weekNumber: w,
        monthLabel,
        days
      });
    }

    return result;
  });

  onDayHover(day: HeatmapDay | null): void {
    this.hoveredDay.set(day);
  }
}

