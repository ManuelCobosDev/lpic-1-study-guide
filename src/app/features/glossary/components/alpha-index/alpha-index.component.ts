import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphaIndexItem } from '../../../../core/services/glossary.service';

@Component({
  selector: 'app-alpha-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alpha-index.component.html',
  styleUrls: ['./alpha-index.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlphaIndexComponent {
  readonly items = input.required<AlphaIndexItem[]>();
  readonly activeLetter = input<string | null>(null);
  readonly letterClick = output<string>();

  onSelect(letter: string, hasTerms: boolean): void {
    if (!hasTerms) return;
    this.letterClick.emit(letter);
  }
}

