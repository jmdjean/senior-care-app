import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { Rent, RentService } from '../../../shared/services/rent.service';

@Component({
  selector: 'app-rent',
  imports: [RouterLink, CurrencyBrlPipe],
  templateUrl: './rent.component.html',
  styleUrl: './rent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentComponent implements OnInit {
  private rentService = inject(RentService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private headquarterSelection = inject(HeadquarterSelectionService);

  currentRent = signal<Rent | null>(null);
  formattedRent = signal<string>('');

  private readonly loadRentEffect = effect(() => {
    this.loadRent();
  });

  ngOnInit(): void {
    this.inicializarCarregamentoDeSedes();
  }

  // Garante que a lista de sedes esteja disponível antes de buscar o aluguel vinculado.
  // Exibe mensagem clara caso o carregamento falhe para evitar chamadas inválidas.
  private inicializarCarregamentoDeSedes(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Busca o valor de aluguel configurado para a sede atual e formata para exibição.
  // Atualiza o estado reativo e mostra erro amigável se a API falhar.
  private loadRent(): void {
    this.loadingService.track(this.rentService.get()).subscribe({
      next: (rent) => {
        this.currentRent.set(rent);
        const value = rent?.value ?? 0;
        this.formattedRent.set(value ? this.formatCurrency(value) : 'R$ 0,00');
      },
      error: () => {
        this.notificationHelper.showError('Erro ao carregar valor do aluguel.');
      }
    });
  }

  // Converte um número para formato monetário pt-BR para ser exibido no card.
  // Mantém consistência visual com demais valores financeiros da aplicação.
  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
