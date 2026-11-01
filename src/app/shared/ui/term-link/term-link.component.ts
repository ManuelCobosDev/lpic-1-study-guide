import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WikiRefService } from '../../../core/services/wiki-ref.service';

@Component({
  selector: 'app-term-link',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      #linkAnchor
      [routerLink]="routerLinkTarget()"
      [queryParams]="queryParamsTarget()"
      [attr.data-term-ref]="ref()"
      [attr.data-cmd]="isCommand() ? termId() : null"
      [attr.data-term]="!isCommand() ? termId() : null"
      class="term-link wiki-ref inline-flex items-center gap-1 font-semibold border-b border-dotted cursor-pointer transition-opacity hover:opacity-80 focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 rounded-xs"
      [class.font-mono]="isCommand()"
      [class.text-[var(--primary-text)]]="isCommand()"
      [class.border-[var(--primary-text)]]="isCommand()"
      [class.text-[var(--info-text)]]="!isCommand()"
      [class.border-[var(--info-text)]]="!isCommand()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (focus)="onFocus()"
      (blur)="onBlur()"
      (keydown.escape)="onEscape()"
    >
      <span aria-hidden="true">{{ isCommand() ? '💻' : '📖' }}</span>
      <ng-content>{{ label() || termId() }}</ng-content>
    </a>
  `,
  styles: [`
    :host {
      display: inline;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermLinkComponent {
  private readonly wikiRefService = inject(WikiRefService);

  readonly ref = input.required<string>(); // ej: 'cmd:chmod' o 'term:stdin'
  readonly label = input<string>('');

  readonly linkAnchor = viewChild<ElementRef<HTMLAnchorElement>>('linkAnchor');

  isCommand(): boolean {
    return this.ref().startsWith('cmd:');
  }

  termId(): string {
    const raw = this.ref();
    const colonIdx = raw.indexOf(':');
    return colonIdx >= 0 ? raw.substring(colonIdx + 1) : raw;
  }

  routerLinkTarget(): string[] {
    return this.isCommand() ? ['/comandos'] : ['/glosario'];
  }

  queryParamsTarget(): Record<string, string> {
    return { q: this.termId() };
  }

  onMouseEnter(): void {
    const el = this.linkAnchor()?.nativeElement;
    if (el) {
      this.wikiRefService.onTargetEnter(el);
    }
  }

  onMouseLeave(): void {
    this.wikiRefService.onTargetLeave();
  }

  onFocus(): void {
    const el = this.linkAnchor()?.nativeElement;
    if (el) {
      this.wikiRefService.openImmediately(el);
    }
  }

  onBlur(): void {
    this.wikiRefService.onTargetLeave();
  }

  onEscape(): void {
    this.wikiRefService.closePopover();
  }
}

