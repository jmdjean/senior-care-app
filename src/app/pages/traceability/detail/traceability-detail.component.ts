import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { TraceabilityRecord, TraceabilityService } from '../../../shared/services/traceability.service';

@Component({
  selector: 'app-traceability-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, JsonPipe],
  templateUrl: './traceability-detail.component.html',
  styleUrl: './traceability-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraceabilityDetailComponent implements OnInit {
  private traceabilityService = inject(TraceabilityService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  record = signal<TraceabilityRecord | null>(null);
  formattedJson = computed(() => {
    const data = this.record()?.requisicao;
    if (data === null || data === undefined) return 'Nenhuma requisição registrada.';
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
      this.router.navigate(['/rastreabilidade']);
      return;
    }

    this.loadRecord(id);
  }

  private loadRecord(id: number): void {
    this.loadingService.track(this.traceabilityService.getById(id)).subscribe({
      next: (record) => this.record.set(record),
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível carregar a rastreabilidade.');
        this.router.navigate(['/rastreabilidade']);
      }
    });
  }
}
