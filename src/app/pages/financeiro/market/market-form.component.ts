import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { MarketCreatePayload, MarketService, MarketUpdatePayload } from '../../../shared/services/market.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-market-form',
  imports: [RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule],
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
          const parsedValue = market?.value ?? 0;
          this.value.set(parsedValue ? this.formatCurrencyInput(parsedValue) : '');
          const isoDate = market?.purchaseDate ?? '';
          const date = isoDate ? new Date(isoDate) : null;
          if (date && !isNaN(date.getTime())) {
            this.purchaseDate.set(date.toISOString().split('T')[0]);
            this.purchaseTime.set(date.toTimeString().slice(0, 5));
          }
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
    if (!this.purchaseDate() || !this.purchaseTime() || (!this.selectedFile() && !this.isEdit())) {
      this.notificationHelper.showError('Preencha todos os campos obrigatórios.');
      return;
    }

    const valueSanitized = this.value()
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const value = valueSanitized ? parseFloat(valueSanitized) : 0;
    if (isNaN(value) || value < 0) {
      this.notificationHelper.showError('Valor inválido.');
      return;
    }

    const purchaseDateTime = `${this.purchaseDate()}T${this.purchaseTime()}:00`;

    if (this.isEdit()) {
      const file = this.selectedFile();
      const payload: MarketUpdatePayload = {
        value,
        purchaseDate: purchaseDateTime,
        ...(file ? { file } : {})
      };

      this.loadingService.track(this.marketService.update(this.marketId()!, payload)).subscribe({
        next: () => {
          this.notificationHelper.showSuccess('Mercado atualizado com sucesso.');
          this.router.navigate(['/mercado/list']);
        },
        error: () => {
          this.notificationHelper.showError('Erro ao atualizar mercado.');
        }
      });
      return;
    }

    const payload: MarketCreatePayload = { file: this.selectedFile()!, value, purchaseDate: purchaseDateTime };

    this.loadingService.track(this.marketService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Mercado criado com sucesso.');
        this.router.navigate(['/mercado/list']);
      },
      error: () => {
        this.notificationHelper.showError('Erro ao criar mercado.');
      }
    });
  }

  private resetForm(): void {
    const now = new Date();
    const date = [
      now.getFullYear(),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0')
    ].join('-');
    const time = [now.getHours().toString().padStart(2, '0'), now.getMinutes().toString().padStart(2, '0')].join(':');

    this.selectedFile.set(null);
    this.value.set('');
    this.purchaseDate.set(date);
    this.purchaseTime.set(time);
  }

  private formatCurrencyInput(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
