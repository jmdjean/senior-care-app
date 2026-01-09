import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { LoadingService } from '../../../shared/services/loading.service';
import { MarketOverviewService } from '../../../shared/services/market-overview.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-overview-market',
  standalone: true,
  imports: [RouterLink, CurrencyBrlPipe],
  templateUrl: './overview-market.component.html',
  styleUrl: './overview-market.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewMarketComponent implements OnInit {
  private marketOverviewService = inject(MarketOverviewService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);

  foodTotal = signal<number | null>(null);
  cleaningTotal = signal<number | null>(null);

  ngOnInit(): void {
    this.loadOverview();
  }

  private loadOverview(): void {
    this.loadingService.track(this.marketOverviewService.getMonthlyFoodTotal()).subscribe({
      next: (res) => this.foodTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de alimentos do mês.')
    });

    this.loadingService.track(this.marketOverviewService.getMonthlyCleaningTotal()).subscribe({
      next: (res) => this.cleaningTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de limpeza do mês.')
    });
  }
}
