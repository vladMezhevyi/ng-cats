import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ct-skeleton',
  template: '',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    '[style.width]': 'width()',
    '[style.height]': 'height()'
  }
})
export class SkeletonComponent {
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
}
