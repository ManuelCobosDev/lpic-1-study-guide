import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent {}

