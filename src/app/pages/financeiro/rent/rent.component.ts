import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { Rent, RentService } from '../../../shared/services/rent.service';

@Component({
  selector: 'app-rent',
  imports: [RouterLink, FormsModule, CurrencyBrlPipe],
  templateUrl: './rent.component.html',
  styleUrl: './rent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentComponent implements OnInit {
  private rentService = inject(RentService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);

  rentValue = signal('');
  currentRent = signal<Rent | null>(null);

  ngOnInit(): void {
    this.loadRent();
  }

  private loadRent(): void {
    this.loadingService.track(this.rentService.get()).subscribe({
      next: (rent) => {
        this.currentRent.set(rent);
        this.rentValue.set(rent.value.toString());
      },
      error: () => {
        this.notificationHelper.showError('Erro ao carregar valor do aluguel.');
      }
    });
  }

  onSubmit(): void {
    if (!this.rentValue()) {
      this.notificationHelper.showError('Preencha o valor do aluguel.');
      return;
    }

    const value = parseFloat(this.rentValue().replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      this.notificationHelper.showError('Valor inválido.');
      return;
    }

    this.loadingService.track(this.rentService.create({ value })).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Valor do aluguel atualizado com sucesso.');
        this.loadRent();
      },
      error: () => {
        this.notificationHelper.showError('Erro ao atualizar valor do aluguel.');
      }
    });
  }
}
