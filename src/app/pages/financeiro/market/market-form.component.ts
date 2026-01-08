import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { LoadingService } from '../../../shared/services/loading.service';
import { MarketCreatePayload, MarketService } from '../../../shared/services/market.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-market-form',
  imports: [RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, CurrencyBrlPipe],
  templateUrl: './market-form.component.html',
  styleUrl: './market-form.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketFormComponent implements OnInit {
  private marketService = inject(MarketService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedFile = signal<File | null>(null);
  value = signal('');
  purchaseDate = signal('');
  purchaseTime = signal('');
  isEdit = signal(false);
  marketId = signal<number | null>(null);

  ngOnInit(): void {
    this.resetForm();
    this.checkIfEdit();
  }

  private checkIfEdit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.marketId.set(+id);
      // Load market data if edit
      this.loadingService.track(this.marketService.getById(+id)).subscribe({
        next: (market) => {
          this.value.set(market.value.toString());
          const date = new Date(market.purchaseDate);
          this.purchaseDate.set(date.toISOString().split('T')[0]);
          this.purchaseTime.set(date.toTimeString().slice(0, 5));
        },
        error: () => {
          this.notificationHelper.showError('Erro ao carregar mercado.');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (!this.value() || !this.purchaseDate() || !this.purchaseTime() || (!this.selectedFile() && !this.isEdit())) {
      this.notificationHelper.showError('Preencha todos os campos obrigatórios.');
      return;
    }

    const value = parseFloat(this.value().replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      this.notificationHelper.showError('Valor inválido.');
      return;
    }

    const purchaseDateTime = `${this.purchaseDate()}T${this.purchaseTime()}:00`;

    const payload: MarketCreatePayload = {
      file: this.selectedFile()!,
      value,
      purchaseDate: purchaseDateTime
    };

    const request = this.isEdit()
      ? this.marketService.update(this.marketId()!, payload)
      : this.marketService.create(payload);

    this.loadingService.track(request).subscribe({
      next: () => {
        this.notificationHelper.showSuccess(
          this.isEdit() ? 'Mercado atualizado com sucesso.' : 'Mercado criado com sucesso.'
        );
        this.router.navigate(['/financeiro/market']);
      },
      error: () => {
        this.notificationHelper.showError(
          this.isEdit() ? 'Erro ao atualizar mercado.' : 'Erro ao criar mercado.'
        );
      }
    });
  }

  private resetForm(): void {
    this.selectedFile.set(null);
    this.value.set('');
    this.purchaseDate.set('');
    this.purchaseTime.set('');
  }
}
