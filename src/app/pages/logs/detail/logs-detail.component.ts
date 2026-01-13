import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorLog, ErrorLogService } from '../../../shared/services/error-log.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-logs-detail',
  imports: [CommonModule, RouterLink, DatePipe, JsonPipe],
  templateUrl: './logs-detail.component.html',
  styleUrl: './logs-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsDetailComponent implements OnInit {
  private errorLogService = inject(ErrorLogService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  log = signal<ErrorLog | null>(null);

  formattedRequestBody = computed(() => {
    const data = this.log()?.corpoRequisicao;
    if (data === null || data === undefined) return 'Nenhum corpo de requisição registrado.';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(id)) {
      this.router.navigate(['/logs']);
      return;
    }

    this.loadLog(id);
  }

  private loadLog(id: number): void {
    this.loadingService.track(this.errorLogService.getById(id)).subscribe({
      next: (log) => this.log.set(log),
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível carregar o log de erro.');
        this.router.navigate(['/logs']);
      }
    });
  }
}
