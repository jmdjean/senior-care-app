import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export type NotificationKind = 'error' | 'success' | 'warning';

export type NotificationSnackBarData = {
  message: string;
  kind: NotificationKind;
};

@Component({
  selector: 'app-notification-snackbar',
  template: `
    <div class="snackbar">
      <mat-icon class="snackbar-icon">{{ icon }}</mat-icon>
      <span class="snackbar-message">{{ data.message }}</span>
    </div>
  `,
  styles: [
    `
      .snackbar {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .snackbar-icon {
        font-size: 20px;
      }

      .snackbar-message {
        line-height: 1.3;
      }
    `
  ],
  standalone: true,
  imports: [MatIconModule]
})
export class NotificationSnackBarComponent {
  readonly icon: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: NotificationSnackBarData) {
    this.icon = this.resolveIcon(data.kind);
  }

  private resolveIcon(kind: NotificationKind): string {
    switch (kind) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      default:
        return 'error';
    }
  }
}
