import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ct-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
