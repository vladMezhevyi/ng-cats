import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { take } from 'rxjs';
import { CatService } from './cat/services/cat.service';

@Component({
  selector: 'ct-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  private readonly catService = inject(CatService);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.catService
      .getRandomCat()
      .pipe(take(1))
      .subscribe((response) => {
        console.log('Response: ', response);
      });
  }
}
