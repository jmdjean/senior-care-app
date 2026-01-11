import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { Market, MarketService } from '../../../shared/services/market.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-market',
  imports: [RouterLink, DatePipe, MatDialogModule, CurrencyBrlPipe],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private marketService = inject(MarketService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private router = inject(Router);
  private headquarterSelection = inject(HeadquarterSelectionService);
  private readonly marketBasePath = '/mercado';

  markets = signal<Market[]>([]);
  openMenuId = signal<number | null>(null);

  private readonly loadMarketsEffect = effect(() => {
    this.loadMarkets();
  });

  readonly canManageMarkets = this.userService.isAdmin || this.userService.isManager;

  ngOnInit(): void {
    this.inicializarCarregamentoDeSedes();
  }

  // Garante que as sedes estejam carregadas antes de listar mercados vinculados.
  // Evita navegação com sede ausente e mostra erro claro em caso de falha.
  private inicializarCarregamentoDeSedes(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Obtém todos os mercados da sede atual e atualiza o estado reativo da lista.
  // Em caso de erro, exibe notificação para o usuário tentar novamente.
  private loadMarkets(): void {
    this.loadingService.track(this.marketService.getAll()).subscribe({
      next: (markets) => {
        this.markets.set(markets);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os mercados.');
      }
    });
  }

  // Alterna a abertura do menu contextual de ações para um mercado específico.
  // Impede propagação do evento para evitar cliques indesejados na linha.
  toggleMenu(marketId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === marketId ? null : marketId);
  }

  // Navega para a página de detalhes do mercado selecionado.
  // Usa rota base configurada para manter consistência de URLs.
  viewMarket(market: Market): void {
    this.router.navigate([this.marketBasePath, market.id, 'view']);
  }

  // Navega para o formulário de edição do mercado selecionado.
  // Reaproveita rota base e o id para abrir o modo de edição.
  editMarket(market: Market): void {
    this.router.navigate([this.marketBasePath, market.id]);
  }

  // Solicita confirmação e, ao confirmar, exclui o mercado e recarrega a lista.
  // Mostra mensagens de sucesso ou erro conforme o resultado da operação.
  deleteMarket(market: Market): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Mercado',
        message: `Tem certeza que deseja excluir este mercado?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.track(this.marketService.delete(market.id)).subscribe({
          next: () => {
            this.notificationHelper.showSuccess('Mercado excluído com sucesso.');
            this.loadMarkets();
          },
          error: () => {
            this.notificationHelper.showError('Erro ao excluir mercado.');
          }
        });
      }
    });
  }

  // Converte a data de compra do mercado para string localizada pt-BR.
  // Ajuda a exibir data e hora no mesmo campo de forma legível.
  getPurchaseDateTime(market: Market): string {
    const date = new Date(market.purchaseDate);
    return date.toLocaleString('pt-BR');
  }
}
