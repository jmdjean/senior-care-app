import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CalendarPayload } from '../../../shared/services/calendar.service';
import { CalendarFormComponent } from './calendar-form.component';

export type CalendarFormDialogData = {
  initialData?: Partial<CalendarPayload & { id?: number }>;
};

export type CalendarFormDialogResult = {
  saved: boolean;
};

@Component({
  selector: 'app-calendar-form-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, CalendarFormComponent],
  templateUrl: './calendar-form-dialog.component.html',
  styleUrl: './calendar-form-dialog.component.scss'
})
export class CalendarFormDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CalendarFormDialogComponent, CalendarFormDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CalendarFormDialogData
  ) {}

  onSaved(): void {
    this.dialogRef.close({ saved: true });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
