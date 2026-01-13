import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { TraceabilityRecord, TraceabilityService } from '../../../shared/services/traceability.service';

@Component({
  selector: 'app-traceability-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './traceability-list.component.html',
  styleUrl: './traceability-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraceabilityListComponent implements OnInit {
  private traceabilityService = inject(TraceabilityService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private router = inject(Router);

  records = signal<TraceabilityRecord[]>([]);
  total = signal(0);
  page = signal(1);
  readonly pageSize = 20;
  totalPages = computed(() => {
    const pages = Math.ceil(this.total() / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  openRecord(record: TraceabilityRecord): void {
    this.router.navigate(['/rastreabilidade', record.id]);
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    if (nextPage === this.page()) return;
    this.page.set(nextPage);
    this.loadRecords();
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  private loadRecords(): void {
    this.loadingService.track(this.traceabilityService.getAll(this.page(), this.pageSize)).subscribe({
      next: (response) => {
        this.records.set(response.items);
        this.total.set(response.total);
      },
      error: (error) => this.notificationHelper.showBackendError(error, 'Não foi possível carregar a rastreabilidade.')
    });
  }
}
