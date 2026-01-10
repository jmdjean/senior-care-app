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
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

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

  toggleMenu(contractId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === contractId ? null : contractId);
  }

  editContract(contract: Contract): void {
    this.router.navigate(['/financeiro/contracts', contract.id]);
  }

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
