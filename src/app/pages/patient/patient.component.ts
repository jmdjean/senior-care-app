import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { PhoneMaskPipe } from '../../shared/pipes/phone-mask.pipe';
import { HeadquarterSelectionService } from '../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { PatientReportResponse, PatientReportService } from '../../shared/services/patient-report.service';
import { Patient, PatientService } from '../../shared/services/patient.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-patient',
  imports: [RouterLink, DatePipe, NgClass, AgePipe, PhoneMaskPipe, MatDialogModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private patientService = inject(PatientService);
  private notificationHelper = inject(NotificationHelperService);
  private patientReportService = inject(PatientReportService);
  private userService = inject(UserService);
  private router = inject(Router);
  private headquarterSelection = inject(HeadquarterSelectionService);

  patients = signal<Patient[]>([]);
  openMenuId = signal<number | null>(null);

  private readonly loadPatientsEffect = effect(() => {
    this.loadPatients();
  });

  readonly canManagePatients = this.userService.canManagePatients;
  readonly isAdmin = this.userService.isAdmin;
  readonly canSendExams = this.userService.canSendExams;
  readonly canSendPrescriptions = this.userService.canSendPrescriptions;
  readonly canGenerateReport = this.userService.canGenerateReport;
  readonly canViewExams = this.userService.canViewExams;
  readonly canViewPrescriptions = this.userService.canViewPrescriptions;

  ngOnInit(): void {
    this.inicializarCarregamentoDeSedes();
  }

  // Garante que as sedes estejam carregadas antes de listar pacientes ligados a elas.
  // Exibe mensagem clara de erro para evitar operações inconsistentes quando a busca falha.
  private inicializarCarregamentoDeSedes(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Busca todos os pacientes da sede atual e atualiza a lista exibida na tela.
  // Em caso de falha, notifica o usuário e evita estado parcialmente carregado.
  private loadPatients(): void {
    this.loadingService.track(this.patientService.getAll()).subscribe({
      next: (patients) => {
        this.patients.set(patients);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar os pacientes.');
      }
    });
  }

  // Abre diálogo de confirmação e, ao confirmar, exclui o paciente e recarrega a lista.
  // Reporta mensagens claras de sucesso ou de erro retornado pelo backend.
  confirmDelete(patient: Patient): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir paciente',
        message: `Deseja excluir o paciente ${patient.name}?`,
        actionButtonText: 'Excluir'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.loadingService.track(this.patientService.delete(patient.id)).subscribe({
        next: () => {
          this.notificationHelper.showSuccess('Paciente excluído com sucesso.');
          this.loadPatients();
        },
        error: (error) => {
          this.notificationHelper.showBackendError(
            error,
            'Não foi possível excluir o paciente.'
          );
        }
      });
    });
  }

  // Alterna o menu de ações do paciente específico e impede propagação do clique.
  // Fecha o menu se ele já estiver aberto, abrindo apenas um por vez.
  toggleMenu(patientId: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId() === patientId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(patientId);
    }
  }

  // Fecha qualquer menu de contexto aberto na lista de pacientes.
  // Usado antes de navegar ou executar outras ações para evitar menus pendentes.
  closeMenu(): void {
    this.openMenuId.set(null);
  }

  // Redireciona para edição do paciente selecionado e fecha o menu de contexto.
  // Usa rota configurada do configurador de pacientes.
  editPatient(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id]);
  }

  // Abre a visualização somente leitura do paciente escolhido e fecha o menu.
  // Envia query param para sinalizar modo de visualização.
  viewPatient(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id], {
      queryParams: { view: 'true' }
    });
  }

  // Navega para a lista de medicamentos do paciente selecionado e fecha o menu.
  // Mantém a UX consistente evitando menus abertos após a navegação.
  openMedicines(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id, 'medicines']);
  }

  // Navega para a área de exames do paciente selecionado e fecha o menu de contexto.
  // Mantém o estado limpo antes da troca de rota.
  openExams(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id, 'exams']);
  }

  // Gera relatório do paciente e navega para a tela de resposta ao concluir.
  // Notifica erros específicos retornados pela API de relatório.
  openReport(patient: Patient): void {
    this.closeMenu();
    this.loadingService.track(this.patientReportService.generateReport(patient.id)).subscribe({
      next: (report: PatientReportResponse) => {
        this.router.navigate(['/patient-configurator/report/response'], {
          state: { report }
        });
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível gerar o relatório.');
      }
    });
  }

  // Normaliza e devolve o sexo em formato amigável ou hífen quando ausente.
  // Garante consistência textual na tabela de pacientes.
  formatSex(sex: string): string {
    const normalized = sex?.toLowerCase() ?? '';
    if (normalized === 'masculino') {
      return 'Masculino';
    }
    if (normalized === 'feminino') {
      return 'Feminino';
    }
    return '-';
  }

  // Define a classe da badge do plano com base no nome, distinguindo Gold e Average.
  // Retorna classe neutra quando o plano não é reconhecido.
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
