import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Contract, ContractService } from '../../../shared/services/contract.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-contracts',
  imports: [RouterLink, DatePipe, MatDialogModule, NgClass],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private contractService = inject(ContractService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private router = inject(Router);
  private headquarterSelection = inject(HeadquarterSelectionService);

  contracts = signal<Contract[]>([]);
  openMenuId = signal<number | null>(null);

  private readonly loadContractsEffect = effect(() => {
    this.loadContracts();
  });

  readonly canManageContracts = this.userService.canManagePatients; // Assuming similar permission

  ngOnInit(): void {
    this.inicializarCarregamentoDeSedes();
  }

  // Garante que as sedes estejam carregadas antes de listar ou alterar contratos.
  // Evita operações inválidas e mostra erro claro caso a busca falhe.
  private inicializarCarregamentoDeSedes(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Busca todos os contratos da sede atual e atualiza a lista visível.
  // Em caso de falha, exibe notificação para orientar o usuário.
  private loadContracts(): void {
    this.loadingService.track(this.contractService.getAll()).subscribe({
      next: (contracts) => {
        this.contracts.set(contracts);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os contratos.');
      }
    });
  }

  // Controla o menu contextual de ações por contrato, evitando propagação de clique.
  // Permite alternar entre abrir e fechar o menu de forma simples.
  toggleMenu(contractId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === contractId ? null : contractId);
  }

  // Navega para o formulário de edição do contrato selecionado.
  // Usa rota fixa para manter consistência na navegação de contratos.
  editContract(contract: Contract): void {
    this.router.navigate(['/financeiro/contracts', contract.id]);
  }

  // Pede confirmação e, ao confirmar, remove o contrato e recarrega a lista.
  // Mostra mensagens de sucesso ou erro conforme o resultado da exclusão.
  deleteContract(contract: Contract): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Contrato',
        message: `Tem certeza que deseja excluir o contrato de ${contract.patientName}?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.track(this.contractService.delete(contract.id)).subscribe({
          next: () => {
            this.notificationHelper.showSuccess('Contrato excluído com sucesso.');
            this.loadContracts();
          },
          error: () => {
            this.notificationHelper.showError('Erro ao excluir contrato.');
          }
        });
      }
    });
  }

  // Retorna a classe CSS da badge do plano com base no nome normalizado.
  // Garante cores distintas para planos Gold, Average e demais.
  getPlanBadgeClass(planName: string | null | undefined): string {
    const normalized = (planName ?? '').trim().toLowerCase();
    if (normalized === 'avarage' || normalized === 'average') {
      return 'bg-info';
    }
    if (normalized === 'gold') {
      return 'bg-warning';
    }
    return 'bg-secondary';
  }
}
