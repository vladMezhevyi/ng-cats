import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'ct-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  protected readonly apiUrl: string = environment.apiUrl;
  protected readonly githubUrl: string = environment.githubUrl;
  protected readonly currentYear: number = new Date().getFullYear();
}
