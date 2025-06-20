import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ct-logo',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent {
  public readonly type = input<'button' | 'link'>('button');
  public readonly routerLinkPath = input<string>('/home');
  public readonly label = input<string>('NgCats');

  public logoClick = output<MouseEvent>();
}
