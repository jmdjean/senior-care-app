import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    NotificationSnackBarComponent,
    type NotificationKind
} from '../components/notification-snackbar/notification-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationHelperService {
  constructor(private snackBar: MatSnackBar) {}

  // Exibe snackbar de erro com mensagem direta.
  // Útil para falhas conhecidas ou mensagens já tratadas.
  showError(message: string): void {
    this.open(message, 'error');
  }

  // Traduz erros de backend para mensagem amigável com fallback.
  // Evita expor mensagens vazias ou formatos inesperados.
  showBackendError(error: unknown, fallback: string): void {
    this.open(this.getBackendErrorMessage(error, fallback), 'error');
  }

  // Exibe snackbar de sucesso padrão.
  // Usado para feedback positivo simples.
  showSuccess(message: string): void {
    this.open(message, 'success');
  }

  // Exibe snackbar de aviso para mensagens não críticas.
  // Ajuda a comunicar alertas sem bloquear fluxo.
  showWarning(message: string): void {
    this.open(message, 'warning');
  }

  // Abre snackbar customizado com componente próprio e metadados.
  // Centraliza configuração de duração e posicionamento.
  private open(message: string, kind: NotificationKind): void {
    this.snackBar.openFromComponent(NotificationSnackBarComponent, {
      data: { message, kind },
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  // Extrai mensagem de erro vinda do backend em diferentes formatos.
  // Retorna fallback quando não encontrar texto válido.
  private getBackendErrorMessage(error: unknown, fallback: string): string {
    if (typeof (error as { error?: string } | null)?.error === 'string') {
      return (error as { error: string }).error.trim() || fallback;
    }
    if (typeof (error as { error?: { error?: string } } | null)?.error?.error === 'string') {
      return (error as { error: { error: string } }).error.error.trim() || fallback;
    }
    return fallback;
  }
}
