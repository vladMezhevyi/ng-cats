import {
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  StateKey,
  TransferState
} from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Cat } from '../models/cat.model';
import { isPlatformServer } from '@angular/common';
import { CatApiService } from '../api/cat-api.service';

const RANDOM_CAT_STATE_KEY: StateKey<Cat | null> = makeStateKey<Cat | null>('cat');

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private readonly api = inject(CatApiService);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  getRandomCat(): Observable<Cat> {
    if (isPlatformServer(this.platformId)) {
      return this.api
        .getRandomCat()
        .pipe(tap((response) => this.transferState.set(RANDOM_CAT_STATE_KEY, response)));
    }

    const cat: Cat | null = this.transferState.get(RANDOM_CAT_STATE_KEY, null);

    if (cat) {
      this.transferState.remove(RANDOM_CAT_STATE_KEY);
      return of(cat);
    }

    return this.api.getRandomCat();
  }
}
