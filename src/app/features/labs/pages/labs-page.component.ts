import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../../shared/ui/progress-bar/progress-bar.component';
import { LabsService } from '../../../core/services/labs.service';
import { LabDifficulty, LabStatus, LabSummary } from '../../../core/models/lab.model';

export interface LabCardViewModel extends LabSummary {
  status: LabStatus;
  completedStepCount: number;
  progressPercent: number;
}

@Component({
  selector: 'app-labs-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    EmptyStateComponent,
    ProgressBarComponent
  ],
  templateUrl: './labs-page.component.html',
  styleUrls: ['./labs-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly labsService = inject(LabsService);

  readonly rawLabs = signal<LabSummary[]>([]);
  readonly loading = signal<boolean>(true);

  readonly query = signal<string>('');
  readonly selectedTopic = signal<string>('all');
  readonly selectedDifficulty = signal<string>('all');
  readonly selectedStatus = signal<string>('all');

  readonly topics = [
    { id: 'all', label: 'Todos los temas' },
    { id: '101', label: 'Tema 101: Arquitectura del sistema' },
    { id: '102', label: 'Tema 102: Instalación de Linux y paquetes' },
    { id: '103', label: 'Tema 103: Comandos GNU y Unix' },
    { id: '104', label: 'Tema 104: Dispositivos y sistemas de archivos' },
    { id: '105', label: 'Tema 105: Shells y scripting' },
    { id: '106', label: 'Tema 106: Interfaces de usuario' },
    { id: '107', label: 'Tema 107: Tareas administrativas' },
    { id: '108', label: 'Tema 108: Servicios esenciales del sistema' },
    { id: '109', label: 'Tema 109: Fundamentos de redes' },
    { id: '110', label: 'Tema 110: Seguridad básica' }
  ];

  readonly difficulties: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas las dificultades' },
    { id: 'basic', label: 'Básica' },
    { id: 'intermediate', label: 'Intermedia' },
    { id: 'advanced', label: 'Avanzada' }
  ];

  readonly statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los estados' },
    { id: 'pending', label: 'Pendiente' },
    { id: 'in_progress', label: 'En curso' },
    { id: 'completed', label: 'Completada' }
  ];

  readonly labsWithStatus = computed<LabCardViewModel[]>(() => {
    // Declaramos dependencia reactiva del store de labs
    this.labsService.state();
    const labs = this.rawLabs();

    return labs.map((lab) => {
      const completedSteps = this.labsService.getCompletedSteps(lab.id);
      const status = this.labsService.getLabStatus(lab.id, lab.stepCount);
      const progressPercent = lab.stepCount > 0
        ? Math.round((completedSteps.length / lab.stepCount) * 100)
        : 0;

      return {
        ...lab,
        status,
        completedStepCount: completedSteps.length,
        progressPercent
      };
    });
  });

  readonly filteredLabs = computed<LabCardViewModel[]>(() => {
    const all = this.labsWithStatus();
    const q = this.query().toLowerCase().trim();
    const topic = this.selectedTopic();
    const diff = this.selectedDifficulty();
    const status = this.selectedStatus();

    return all.filter((item) => {
      // Filtro de búsqueda
      if (q) {
        const matchesQuery =
          item.subtopicId.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Filtro por Tema
      if (topic !== 'all' && item.topicId !== topic) {
        return false;
      }

      // Filtro por Dificultad
      if (diff !== 'all' && item.difficulty !== diff) {
        return false;
      }

      // Filtro por Estado
      if (status !== 'all' && item.status !== status) {
        return false;
      }

      return true;
    });
  });

  // Estadísticas globales del catálogo
  readonly totalCompleted = computed(() =>
    this.labsWithStatus().filter((l) => l.status === 'completed').length
  );

  readonly totalInProgress = computed(() =>
    this.labsWithStatus().filter((l) => l.status === 'in_progress').length
  );

  readonly totalPending = computed(() =>
    this.labsWithStatus().filter((l) => l.status === 'pending').length
  );

  constructor() {
    this.loadCatalog();

    // Sincronización desde los query params de la URL
    this.route.queryParamMap.subscribe((params) => {
      this.selectedTopic.set(params.get('tema') || 'all');
      this.selectedDifficulty.set(params.get('dificultad') || 'all');
      this.selectedStatus.set(params.get('estado') || 'all');
      this.query.set(params.get('q') || '');
    });
  }

  async loadCatalog(): Promise<void> {
    try {
      this.loading.set(true);
      const list = await this.labsService.getLabsCatalog();
      this.rawLabs.set(list);
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tema: this.selectedTopic() !== 'all' ? this.selectedTopic() : null,
        dificultad: this.selectedDifficulty() !== 'all' ? this.selectedDifficulty() : null,
        estado: this.selectedStatus() !== 'all' ? this.selectedStatus() : null,
        q: this.query().trim() || null
      },
      queryParamsHandling: 'merge'
    });
  }

  clearFilters(): void {
    this.selectedTopic.set('all');
    this.selectedDifficulty.set('all');
    this.selectedStatus.set('all');
    this.query.set('');
    this.onFilterChange();
  }

  getDifficultyLabel(diff: LabDifficulty): string {
    switch (diff) {
      case 'basic':
        return 'Básica';
      case 'intermediate':
        return 'Intermedia';
      case 'advanced':
        return 'Avanzada';
    }
  }

  getDifficultyBadgeVariant(diff: LabDifficulty): BadgeVariant {
    switch (diff) {
      case 'basic':
        return 'info';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'danger';
    }
  }

  getStatusLabel(status: LabStatus): string {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En curso';
      case 'pending':
        return 'Pendiente';
    }
  }

  getStatusBadgeVariant(status: LabStatus): BadgeVariant {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'neutral';
    }
  }
}

