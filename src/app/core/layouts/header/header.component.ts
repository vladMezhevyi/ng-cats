import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'ct-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatButtonModule,
    LogoComponent,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public readonly navItems = input<NavItem[]>([{ path: '/cat', label: 'Cat' }]);
}
