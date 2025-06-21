import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ct-cat',
  imports: [],
  templateUrl: './cat.component.html',
  styleUrl: './cat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatComponent {}
