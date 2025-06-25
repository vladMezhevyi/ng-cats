import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cat } from '../models/cat.model';

@Injectable({
  providedIn: 'root'
})
export class CatApiService {
  private readonly http = inject(HttpClient);

  public getRandomCat(): Observable<Cat> {
    return this.http.get<Cat>('/cat');
  }

  public getCatById(catId: string): Observable<Cat> {
    return this.http.get<Cat>(`/cat/${catId}`);
  }
}
