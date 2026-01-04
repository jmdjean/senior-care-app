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
}
