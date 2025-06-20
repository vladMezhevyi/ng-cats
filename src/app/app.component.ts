import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layouts/header/header.component';
import { FooterComponent } from './core/layouts/footer/footer.component';

@Component({
  selector: 'ct-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
}
