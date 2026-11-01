import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { Errata } from '../../../core/models/errata.model';

@Component({
  selector: 'app-errata-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './errata-page.component.html',
  styleUrls: ['./errata-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrataPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);

  readonly rawErrata = signal<Errata[]>([]);
  readonly isLoading = signal<boolean>(true);

  readonly selectedSeverity = signal<string>('all');
  readonly selectedStatus = signal<string>('all');
  readonly searchQuery = signal<string>('');

  readonly githubIssuesUrl = 'https://github.com/usuario/lpic-1-study-guide/issues';

  async ngOnInit(): Promise<void> {
    try {
      const items = await this.contentService.getErrata();
      this.rawErrata.set(items);
    } catch {
      this.rawErrata.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  readonly filteredErrata = computed<Errata[]>(() => {
    let list = this.rawErrata();
    const sev = this.selectedSeverity();
    const st = this.selectedStatus();
    const q = this.searchQuery().trim().toLowerCase();

    if (sev !== 'all') {
      list = list.filter((e) => e.severity === sev);
    }

    if (st !== 'all') {
      if (st === 'fixed') {
        list = list.filter((e) => !!e.fixedAt);
      } else if (st === 'open') {
        list = list.filter((e) => !e.fixedAt);
      }
    }

    if (q) {
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.correction.toLowerCase().includes(q) ||
          e.page.toLowerCase().includes(q) ||
          (e.subtopicId && e.subtopicId.toLowerCase().includes(q))
      );
    }

    return list;
  });

  readonly stats = computed(() => {
    const list = this.rawErrata();
    const total = list.length;
    const fixed = list.filter((e) => !!e.fixedAt).length;
    const open = total - fixed;
    return { total, fixed, open };
  });

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  setSeverity(sev: string): void {
    this.selectedSeverity.set(sev);
  }

  setStatus(st: string): void {
    this.selectedStatus.set(st);
  }
}

