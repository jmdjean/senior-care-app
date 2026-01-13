import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ErrorLog, ErrorLogService } from '../../../shared/services/error-log.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-logs-list',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './logs-list.component.html',
  styleUrl: './logs-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsListComponent implements OnInit {
  private errorLogService = inject(ErrorLogService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private router = inject(Router);

  logs = signal<ErrorLog[]>([]);
  total = signal(0);
  page = signal(1);
  readonly pageSize = 20;
  totalPages = computed(() => {
    const pages = Math.ceil(this.total() / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  openLog(log: ErrorLog): void {
    this.router.navigate(['/logs', log.id]);
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    if (nextPage === this.page()) return;
    this.page.set(nextPage);
    this.loadLogs();
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  private loadLogs(): void {
    this.loadingService.track(this.errorLogService.getAll(this.page(), this.pageSize)).subscribe({
      next: (response) => {
        this.logs.set(response.items);
        this.total.set(response.total);
      },
      error: (error) => this.notificationHelper.showBackendError(error, 'Não foi possível carregar os logs de erro.')
    });
  }
}
