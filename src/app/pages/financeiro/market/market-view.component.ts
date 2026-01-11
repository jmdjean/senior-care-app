import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    this.inicializarCarregamentoDoMercado();
  }

  // Resolve o id da rota, valida e inicia o carregamento do mercado; redireciona se faltar id.
  // Evita estado inconsistente quando a rota é acessada sem parâmetro válido.
  private inicializarCarregamentoDoMercado(): void {
    const idParam = this.route.snapshot.params['id'];
    if (!idParam) {
      this.notificationHelper.showError('Mercado não encontrado.');
      this.router.navigate(['/mercado/list']);
      return;
    }
    const id = Number(idParam);
    this.loadMarket(id);
  }

  // Busca um mercado pelo id e atualiza o estado; redireciona em caso de falha.
  // Garante feedback de erro ao usuário e evita tela quebrada sem dados.
  private loadMarket(id: number): void {
    this.loadingService.track(this.marketService.getById(id)).subscribe({
      next: (market) => this.market.set(market),
      error: () => {
        this.notificationHelper.showError('Erro ao carregar mercado.');
        this.router.navigate(['/mercado/list']);
      }
    });
  }

  // Indica se há itens no mercado carregado para controlar renderização condicional.
  // Retorna falso quando não há dados ou a lista está vazia.
  get hasItems(): boolean {
    const items = this.market()?.items;
    return Array.isArray(items) && items.length > 0;
  }
}
