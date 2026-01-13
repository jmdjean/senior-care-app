import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CalendarEntry, CalendarService } from '../../../shared/services/calendar.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-calendar',
  imports: [RouterLink, DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private headquarterSelection = inject(HeadquarterSelectionService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private router = inject(Router);

  entries = signal<CalendarEntry[]>([]);
  openMenuId = signal<number | null>(null);

  readonly canManageCalendar = computed(() => this.userService.isAdmin() || this.userService.isManager());
  readonly selectedHeadquarter = this.headquarterSelection.selectedHeadquarter;

  ngOnInit(): void {
    if (!this.canManageCalendar()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      next: () => this.refresh(),
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar sedes.');
      }
    });
  }

  refresh(): void {
    this.loadEntries();
  }

  addEntry(): void {
    this.router.navigate(['/calendario/novo']);
  }

  editEntry(entry: CalendarEntry): void {
    this.closeMenu();
    this.router.navigate(['/calendario', entry.id]);
  }

  toggleMenu(entryId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === entryId ? null : entryId);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  private loadEntries(): void {
    this.loadingService.track(this.calendarService.getEntries()).subscribe({
      next: (entries) => {
        this.entries.set(entries);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar o calendário.');
      }
    });
  }

}
