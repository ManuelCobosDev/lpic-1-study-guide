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
import { AlphaIndexComponent } from '../components/alpha-index/alpha-index.component';
import { GlossaryService } from '../../../core/services/glossary.service';
import { GlossaryTerm } from '../../../core/models/glossary.model';

@Component({
  selector: 'app-glossary-page',
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
    AlphaIndexComponent
  ],
  templateUrl: './glossary-page.component.html',
  styleUrls: ['./glossary-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlossaryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly glossaryService = inject(GlossaryService);

  readonly allTerms = signal<GlossaryTerm[]>([]);
  readonly loading = signal<boolean>(true);
  readonly searchQuery = signal<string>('');
  readonly activeLetter = signal<string | null>(null);

  readonly totalCount = computed(() => this.allTerms().length);

  readonly filteredTerms = computed(() => {
    return this.glossaryService.filterTerms(this.allTerms(), this.searchQuery());
  });

  readonly filteredCount = computed(() => this.filteredTerms().length);

  readonly alphaIndex = computed(() => {
    return this.glossaryService.getAlphabetIndex(this.filteredTerms());
  });

  readonly groupedTerms = computed(() => {
    return this.glossaryService.groupTermsByLetter(this.filteredTerms());
  });

  readonly availableLetters = computed(() => {
    return Object.keys(this.groupedTerms()).sort((a, b) => a.localeCompare(b, 'es'));
  });

  readonly counterText = computed(() => {
    if (this.searchQuery().trim()) {
      return `${this.filteredCount()} de ${this.totalCount()} términos`;
    }
    return `${this.totalCount()} términos técnicos`;
  });

  async ngOnInit(): Promise<void> {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.searchQuery.set(q);
    });

    try {
      const terms = await this.glossaryService.getTerms();
      this.allTerms.set(terms);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value.trim() || null },
      queryParamsHandling: 'merge'
    });
  }

  scrollToLetter(letter: string): void {
    this.activeLetter.set(letter);
    if (typeof document !== 'undefined') {
      const target = document.getElementById(`letter-${letter}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  scrollToTerm(termName: string): void {
    if (typeof document !== 'undefined') {
      const target = document.getElementById(`term-${termName}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight-flash');
        setTimeout(() => target.classList.remove('highlight-flash'), 2000);
      }
    }
  }

  resetSearch(): void {
    this.onSearchInput('');
  }
}

