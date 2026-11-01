import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { CommandCardComponent } from '../components/command-card/command-card.component';
import { CommandService } from '../../../core/services/command.service';
import { Command } from '../../../core/models/command.model';

@Component({
  selector: 'app-commands-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    EmptyStateComponent,
    SkeletonComponent,
    CommandCardComponent
  ],
  templateUrl: './commands-page.component.html',
  styleUrls: ['./commands-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly commandService = inject(CommandService);

  readonly commands = signal<Command[]>([]);
  readonly categories = signal<string[]>([]);
  readonly loading = signal<boolean>(true);
  readonly viewMode = signal<'table' | 'cards'>('table');
  readonly expandedCommandId = signal<string | null>(null);
  readonly copiedCommandId = signal<string | null>(null);

  // Filtros
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('todas');
  readonly selectedTopic = signal<string>('todos');

  readonly availableTopics = [
    { id: 'todos', label: 'Todos los temas' },
    { id: '101', label: 'Tema 101: Arquitectura del sistema' },
    { id: '102', label: 'Tema 102: Instalación de Linux y gestión de paquetes' },
    { id: '103', label: 'Tema 103: Comandos GNU y Unix' },
    { id: '104', label: 'Tema 104: Dispositivos, sistemas de archivos Linux y estándar FHS' },
    { id: '105', label: 'Tema 105: Shells y scripts de shell' },
    { id: '106', label: 'Tema 106: Interfaces de usuario y escritorios' },
    { id: '107', label: 'Tema 107: Tareas administrativas' },
    { id: '108', label: 'Tema 108: Servicios esenciales del sistema' },
    { id: '109', label: 'Tema 109: Fundamentos de redes' },
    { id: '110', label: 'Tema 110: Seguridad' }
  ];

  readonly totalCommands = computed(() => this.commands().length);

  readonly filteredCommands = computed(() => {
    return this.commandService.filterCommands(
      this.commands(),
      this.searchQuery(),
      this.selectedCategory(),
      this.selectedTopic()
    );
  });

  readonly filteredCount = computed(() => this.filteredCommands().length);

  readonly counterText = computed(() => {
    return `${this.filteredCount()} de ${this.totalCommands()} comandos`;
  });

  parseSubtopic(loc: string): string {
    const [sub] = loc.split('#');
    return sub || '105.1';
  }

  parseSlide(loc: string): number {
    const [, slide] = loc.split('#');
    return slide ? parseInt(slide, 10) : 1;
  }

  async ngOnInit(): Promise<void> {
    // Sincronización inicial desde query parameters de la URL
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      const cat = params.get('cat') ?? 'todas';
      const tema = params.get('tema') ?? 'todos';

      this.searchQuery.set(q);
      this.selectedCategory.set(cat);
      this.selectedTopic.set(tema);
    });

    try {
      const [cmds, cats] = await Promise.all([
        this.commandService.getCommands(),
        this.commandService.getCategories()
      ]);
      this.commands.set(cmds);
      this.categories.set(cats);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.syncUrlParams();
  }

  onCategorySelect(cat: string): void {
    this.selectedCategory.set(cat);
    this.syncUrlParams();
  }

  onTopicSelect(topic: string): void {
    this.selectedTopic.set(topic);
    this.syncUrlParams();
  }

  toggleViewMode(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  toggleExpand(cmdId: string): void {
    if (this.expandedCommandId() === cmdId) {
      this.expandedCommandId.set(null);
    } else {
      this.expandedCommandId.set(cmdId);
    }
  }

  async copyText(text: string, id: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Fallback silencioso
    }

    this.copiedCommandId.set(id);
    setTimeout(() => {
      if (this.copiedCommandId() === id) {
        this.copiedCommandId.set(null);
      }
    }, 2000);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('todas');
    this.selectedTopic.set('todos');
    this.syncUrlParams();
  }

  private syncUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery().trim() || null,
        cat: this.selectedCategory() !== 'todas' ? this.selectedCategory() : null,
        tema: this.selectedTopic() !== 'todos' ? this.selectedTopic() : null
      },
      queryParamsHandling: 'merge'
    });
  }
}

