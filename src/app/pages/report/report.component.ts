import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../shared/services/loading.service';
import { Patient, PatientService } from '../../shared/services/patient.service';
import { ReportService } from '../../shared/services/report.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';

@Component({
  selector: 'app-report',
  imports: [RouterLink, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  standalone: true
})
export class ReportComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private patientService = inject(PatientService);
  private reportService = inject(ReportService);
  private notificationHelper = inject(NotificationHelperService);
  private router = inject(Router);

  patients: Patient[] = [];
  selectedPatientId = '';

  ngOnInit(): void {
    this.loadPatients();
  }

  onSubmit(): void {
    if (!this.selectedPatientId) {
      this.notificationHelper.showWarning('Selecione um paciente para gerar o relatório.');
      return;
    }

    const patientId = Number(this.selectedPatientId);
    if (Number.isNaN(patientId)) {
      this.notificationHelper.showWarning('Selecione um paciente válido.');
      return;
    }

    this.loadingService.track(this.reportService.createReport(patientId)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Relatório gerado com sucesso.');
        this.router.navigate(['/home']);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível gerar o relatório.');
      }
    });
  }

  private loadPatients(): void {
    this.loadingService.track(this.patientService.getAll()).subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os pacientes.');
      }
    });
  }
}