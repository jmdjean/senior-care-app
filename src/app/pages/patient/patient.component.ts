import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { PhoneMaskPipe } from '../../shared/pipes/phone-mask.pipe';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { PatientReportResponse, PatientReportService } from '../../shared/services/patient-report.service';
import { Patient, PatientService } from '../../shared/services/patient.service';

@Component({
  selector: 'app-patient',
  imports: [RouterLink, DatePipe, NgClass, AgePipe, PhoneMaskPipe, MatDialogModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private patientService = inject(PatientService);
  private notificationHelper = inject(NotificationHelperService);
  private patientReportService = inject(PatientReportService);
  private router = inject(Router);

  patients = signal<Patient[]>([]);
  openMenuId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPatients();
  }

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

  toggleMenu(patientId: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId() === patientId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(patientId);
    }
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  editPatient(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id]);
  }

  viewPatient(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id], {
      queryParams: { view: 'true' }
    });
  }

  openMedicines(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id, 'medicines']);
  }

  openExams(patient: Patient): void {
    this.closeMenu();
    this.router.navigate(['/patient-configurator/patients', patient.id, 'exams']);
  }

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
