import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type SnackbarType = 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private readonly snackbar = inject(MatSnackBar);

  private readonly _config: MatSnackBarConfig = {
    duration: 3000,
    verticalPosition: 'top'
  };

  get config(): MatSnackBarConfig {
    return this._config;
  }

  open(message: string, type: SnackbarType, action?: string, config?: MatSnackBarConfig): void {
    const snackbarConfig: MatSnackBarConfig = {
      ...this._config,
      ...config,
      panelClass: this.getPanelClass(type)
    };
    this.snackbar.open(message, action, snackbarConfig);
  }

  dismiss(): void {
    this.snackbar.dismiss();
  }

  private getPanelClass(type: SnackbarType): string {
    switch (type) {
      case 'success': {
        return 'success-snackbar';
      }
      case 'error': {
        return 'error-snackbar';
      }
    }
  }
}
