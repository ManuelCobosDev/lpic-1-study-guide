import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPageComponent {
  private readonly contentService = inject(ContentService);

  readonly appVersion = '0.1.0';
  readonly manifestVersion = signal<string>('1.0.0');
  readonly lpiVersion = '5.0';

  constructor() {
    this.contentService.getManifest().then((m: CurriculumManifest) => {
      this.manifestVersion.set(m.version);
    }).catch((err: unknown) => {
      console.warn('No se pudo cargar la versión del manifiesto', err);
    });
  }
}

