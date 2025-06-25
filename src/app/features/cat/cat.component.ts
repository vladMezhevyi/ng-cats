import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { from, Observable, Subject, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'app/core/services/snackbar.service';

@Component({
  selector: 'ct-cat',
  templateUrl: './cat.component.html',
  styleUrl: './cat.component.scss',
  imports: [MatCardModule, SkeletonComponent, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatComponent {
  private readonly catApiService = inject(CatApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackbarService = inject(SnackbarService);

  public readonly catId = input.required<string | undefined>();
  private readonly trigger = new Subject<string | undefined>();

  protected readonly catState = ctActionState<Cat, string | undefined, Error>({
    request: (catId: string | undefined) =>
      this.getCat(catId).pipe(take(1), takeUntilDestroyed(this.destroyRef)),
    onSuccess: (response: Cat) => this.appendQueryParam(response.id),
    trigger: this.trigger.asObservable(),
    transferStateKey: 'cat'
  });

  protected readonly currentCatId = computed<string | undefined>(() => this.catState().data?.id);

  constructor() {
    const effectRef = effect(() => {
      this.triggerUpdate(this.catId());
      effectRef.destroy();
    });
  }

  protected triggerUpdate(catId?: string): void {
    this.trigger.next(catId);
  }

  protected share(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const url: string = this.getCurrentUrl();

    from(navigator.clipboard.writeText(url))
      .pipe(take(1))
      .subscribe({
        next: () => this.snackbarService.open('Copied to clipboard!', 'success', 'Close'),
        error: () => this.snackbarService.open('Failed to copy text', 'error', 'Close')
      });
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

  private getCurrentUrl(): string {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get('catId')
      ? window.location.href
      : `${window.location.href}?catId=${this.currentCatId()}`;
  }
}
