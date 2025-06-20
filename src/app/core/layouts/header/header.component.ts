import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'ct-header',
  imports: [MatToolbarModule, MatButtonModule, MatButtonModule, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {}
