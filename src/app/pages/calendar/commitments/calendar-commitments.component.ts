import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CalendarAvailabilitySlot, CalendarEntry, CalendarPayload, CalendarService } from '../../../shared/services/calendar.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';
import { CalendarFormDialogComponent, CalendarFormDialogData } from '../form/calendar-form-dialog.component';

@Component({
  selector: 'app-calendar-commitments',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, MatDialogModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './calendar-commitments.component.html',
  styleUrl: './calendar-commitments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarCommitmentsComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly headquarterSelection = inject(HeadquarterSelectionService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationHelper = inject(NotificationHelperService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  entries = signal<CalendarEntry[]>([]);
  availability = signal<CalendarAvailabilitySlot[]>([]);

  readonly canManageCalendar = this.userService.isAdmin() || this.userService.isManager();
  readonly selectedHeadquarter = this.headquarterSelection.selectedHeadquarter;

  ngOnInit(): void {
    if (!this.canManageCalendar) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      next: () => {
        this.loadEntries();
        this.loadAvailability();
      },
      error: () => this.notificationHelper.showError('Nao foi possivel carregar sedes.')
    });
  }

  private loadEntries(): void {
    this.loadingService.track(this.calendarService.getEntries()).subscribe({
      next: (entries) => this.entries.set(entries),
      error: () => this.notificationHelper.showError('Nao foi possivel carregar os compromissos.')
    });
  }

  private loadAvailability(): void {
    this.loadingService.track(this.calendarService.getAvailability()).subscribe({
      next: (slots) => this.availability.set(slots),
      error: () => this.notificationHelper.showError('Nao foi possivel carregar os horarios livres.')
    });
  }

  openCreate(initialData?: Partial<CalendarPayload & { id?: number }>): void {
    const data: CalendarFormDialogData = { initialData: { type: 'Visita', ...(initialData ?? {}) } };

    this.dialog
      .open(CalendarFormDialogComponent, {
        width: '780px',
        maxWidth: '95vw',
        data,
        autoFocus: false,
        disableClose: true
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.saved) {
          this.loadEntries();
          this.loadAvailability();
        }
      });
  }

  openFromAvailability(slot: CalendarAvailabilitySlot): void {
    this.openCreate({
      type: 'Visita',
      date: slot.date,
      time: slot.time ?? null,
      allDay: false
    });
  }

  openEdit(id: number): void {
    this.loadingService.track(this.calendarService.getById(id)).subscribe({
      next: (entry) => {
        const timeForInput = entry.time ? entry.time.slice(0, 5) : null;
        this.openCreate({
          id: entry.id,
          type: entry.type,
          name: entry.name ?? '',
          phone: entry.phone ?? '',
          date: entry.date,
          time: entry.allDay ? null : timeForInput,
          allDay: entry.allDay,
          headquarterId: entry.headquarterId,
          observation: entry.observation ?? ''
        });
      },
      error: () => this.notificationHelper.showError('Nao foi possivel carregar o compromisso para edicao.')
    });
  }

  getInitials(name?: string | null): string {
    const safe = (name ?? '').trim();
    if (!safe) return '??';
    const parts = safe.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || safe[0].toUpperCase();
  }

  getTypeBadgeClass(type: CalendarEntry['type']): string {
    return type === 'Visita' ? 'badge-visit' : 'badge-blocked';
  }

  getTypeDotClass(type: CalendarEntry['type']): string {
    return type === 'Visita' ? 'dot-green' : 'dot-red';
  }

  getHeadquarterBadgeClass(entry: CalendarEntry): string {
    const id = entry.headquarterId;
    const name = (entry.headquarterName ?? '').toLowerCase();

    if (id === 1 || name === 'a1') return 'badge-hq-a1';
    if (id === 2 || name === 'b2') return 'badge-hq-b2';

    return 'badge-hq-default';
  }
}
