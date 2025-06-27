import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardMdImage, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ct-page-not-found',
  imports: [MatCardModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundComponent {}
