import { inject, Injectable } from '@angular/core';
import { CatApiService } from '../api/cat.api';
import { Observable } from 'rxjs';
import { Cat } from '../api/types/cat.interface';

@Injectable({
  providedIn: 'root',
})
export class CatService {
  private readonly api = inject(CatApiService);

  constructor() {}

  public getRandomCat(): Observable<Cat> {
    return this.api.getRandomCat();
  }
}
