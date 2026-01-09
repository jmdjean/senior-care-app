import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
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
  private readonly marketBasePath = '/mercado';

  markets = signal<Market[]>([]);
  openMenuId = signal<number | null>(null);

  readonly canManageMarkets = this.userService.isAdmin || this.userService.isManager;

  ngOnInit(): void {
    this.loadMarkets();
  }

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

  toggleMenu(marketId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === marketId ? null : marketId);
  }

  viewMarket(market: Market): void {
    this.router.navigate([this.marketBasePath, market.id, 'view']);
  }

  editMarket(market: Market): void {
    this.router.navigate([this.marketBasePath, market.id]);
  }

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

  getPurchaseDateTime(market: Market): string {
    const date = new Date(market.purchaseDate);
    return date.toLocaleString('pt-BR');
  }
}
