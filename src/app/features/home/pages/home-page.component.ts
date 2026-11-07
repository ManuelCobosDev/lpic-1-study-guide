import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { selectExamProgress, selectNextRecommendedSubtopic } from '../../../core/selectors/progress.selectors';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ChipComponent,
  ContainerComponent
} from '../../../shared/ui';
import { HomeHeroComponent } from '../components/home-hero.component';
import { HomeMetricsComponent } from '../components/home-metrics.component';
import { HomeFaqComponent } from '../components/home-faq.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    ChipComponent,
    HomeHeroComponent,
    HomeMetricsComponent,
    HomeFaqComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  readonly manifest = this.contentService.manifest;
  readonly progress = this.progressService.progress;

  readonly openFaqs = signal<Record<string, boolean>>({
    faq1: true
  });

  readonly exam101Progress = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return 0;
    return selectExamProgress('101', p, m.topics, m.subtopics);
  });

  readonly exam102Progress = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return 0;
    return selectExamProgress('102', p, m.topics, m.subtopics);
  });

  readonly nextSubtopic = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return null;
    return selectNextRecommendedSubtopic(p, m.subtopics);
  });

  readonly primaryCtaText = computed(() => {
    const p = this.progress();
    if (p.lastVisited) {
      return 'Continuar donde lo dejaste →';
    }
    if (this.exam101Progress() > 0) {
      return 'Continuar con el Tema 101 →';
    }
    return 'Empezar por el Tema 101 →';
  });

  readonly primaryCtaLink = computed(() => {
    const p = this.progress();
    if (p.lastVisited?.path) {
      return p.lastVisited.path;
    }
    const next = this.nextSubtopic();
    if (next) {
      return `/estudiar/${next.id}`;
    }
    return '/estudiar/101.1';
  });

  readonly topics = computed(() => this.manifest()?.topics ?? []);

  // Métricas dinámicas calculadas desde el manifiesto
  readonly totalSlides = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalSlidesReal + m.stats.totalSlidesPlaceholder;
  });

  readonly totalSubtopics = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalSubtopics : 0;
  });

  readonly totalLabs = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalLabsReal + m.stats.totalLabsPlaceholder;
  });

  readonly totalQuestions = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalQuestionsReal + m.stats.totalQuestionsPlaceholder;
  });

  readonly totalCommands = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalCommands : 0;
  });

  readonly totalTerms = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalTerms : 0;
  });

  readonly totalFlashcards = computed(() => {
    const m = this.manifest();
    return m ? (m.stats.totalFlashcards ?? 0) : 0;
  });

  async ngOnInit(): Promise<void> {
    if (!this.manifest()) {
      try {
        await this.contentService.getManifest();
      } catch {
        // El servicio ya gestiona el error
      }
    }
  }

  isFaqOpen(id: string): boolean {
    return !!this.openFaqs()[id];
  }

  toggleFaq(id: string): void {
    const current = this.isFaqOpen(id);
    this.openFaqs.update((prev) => ({
      ...prev,
      [id]: !current
    }));
  }
}
