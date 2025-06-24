import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CatApiService } from 'app/core/api/cat-api.service';
import { Cat } from 'app/core/models/cat.model';
import { ctActionState } from 'app/core/utils/ct-state.util';
import { Observable, Subject, take } from 'rxjs';

@Component({
  selector: 'ct-cat',
  templateUrl: './cat.component.html',
  styleUrl: './cat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatComponent {
  private readonly catApiService = inject(CatApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly catId = input.required<string | undefined>();
  private readonly trigger = new Subject<string | undefined>();

  protected readonly catState = ctActionState<Cat, string | undefined, Error>({
    request: (catId: string | undefined) =>
      this.getCat(catId).pipe(take(1), takeUntilDestroyed(this.destroyRef)),
    onSuccess: (response: Cat) => this.appendQueryParam(response.id),
    trigger: this.trigger.asObservable(),
    transferStateKey: 'cat'
  });

  constructor() {
    const effectRef = effect(() => {
      this.triggerUpdate(this.catId());
      effectRef.destroy();
    });
  }

  protected triggerUpdate(catId?: string): void {
    this.trigger.next(catId);
  }

  private getCat(catId?: string): Observable<Cat> {
    return catId ? this.catApiService.getCatById(catId) : this.catApiService.getRandomCat();
  }

  private appendQueryParam(catId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.navigate(['/cat'], {
      replaceUrl: true,
      queryParams: { catId }
    });
  }
}
