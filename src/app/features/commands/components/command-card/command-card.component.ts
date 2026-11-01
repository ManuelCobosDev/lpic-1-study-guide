import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Command } from '../../../../core/models/command.model';

@Component({
  selector: 'app-command-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './command-card.component.html',
  styleUrls: ['./command-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandCardComponent {
  @Input({ required: true }) command!: Command;
  @Input() isExpanded = false;
  @Input() copiedTargetId: string | null = null;

  @Output() toggleExpand = new EventEmitter<string>();
  @Output() copyCommand = new EventEmitter<{ text: string; id: string }>();

  onToggle(): void {
    this.toggleExpand.emit(this.command.id);
  }

  onCopy(text: string, id: string): void {
    this.copyCommand.emit({ text, id });
  }

  parseSubtopic(loc: string): string {
    const [sub] = loc.split('#');
    return sub || '105.1';
  }

  parseSlide(loc: string): number {
    const [, slide] = loc.split('#');
    return slide ? parseInt(slide, 10) : 1;
  }
}
