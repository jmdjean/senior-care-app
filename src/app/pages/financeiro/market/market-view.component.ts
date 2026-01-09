import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { LoadingService } from '../../../shared/services/loading.service';
import { Market, MarketService } from '../../../shared/services/market.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-market-view',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, CurrencyBrlPipe],
  templateUrl: './market-view.component.html',
  styleUrl: './market-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketViewComponent implements OnInit {
  private marketService = inject(MarketService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  market = signal<Market | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (!idParam) {
      this.notificationHelper.showError('Mercado não encontrado.');
      this.router.navigate(['/mercado/list']);
      return;
    }
    const id = Number(idParam);
    this.loadMarket(id);
  }

  private loadMarket(id: number): void {
    this.loadingService.track(this.marketService.getById(id)).subscribe({
      next: (market) => this.market.set(market),
      error: () => {
        this.notificationHelper.showError('Erro ao carregar mercado.');
        this.router.navigate(['/mercado/list']);
      }
    });
  }

  get hasItems(): boolean {
    const items = this.market()?.items;
    return Array.isArray(items) && items.length > 0;
  }
}
