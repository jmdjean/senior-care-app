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
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

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

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
