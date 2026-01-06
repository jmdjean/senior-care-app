import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  NotificationSnackBarComponent,
  type NotificationKind
} from '../components/notification-snackbar/notification-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationHelperService {
  constructor(private snackBar: MatSnackBar) {}

  showError(message: string): void {
    this.open(message, 'error');
  }

  showBackendError(error: unknown, fallback: string): void {
    this.open(this.getBackendErrorMessage(error, fallback), 'error');
  }

  showSuccess(message: string): void {
    this.open(message, 'success');
  }

  showWarning(message: string): void {
    this.open(message, 'warning');
  }

  private open(message: string, kind: NotificationKind): void {
    this.snackBar.openFromComponent(NotificationSnackBarComponent, {
      data: { message, kind },
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  private getBackendErrorMessage(error: unknown, fallback: string): string {
    if (typeof (error as { error?: string } | null)?.error === 'string') {
      return (error as { error: string }).error.trim() || fallback;
    }
    if (typeof (error as { error?: { error?: string } } | null)?.error?.error === 'string') {
      return (error as { error: { error: string } }).error.error.trim() || fallback;
    }
    return fallback;
  }
}
