import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { PatientReportResponse, PatientReportService } from '../../../shared/services/patient-report.service';
import { PatientName, PatientService } from '../../../shared/services/patient.service';

@Component({
  selector: 'app-patient-report',
  templateUrl: './patient-report.component.html',
  styleUrl: './patient-report.component.scss',
  imports: [
    RouterLink,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientReportComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);
  private patientReportService = inject(PatientReportService);
  private router = inject(Router);

  patients = signal<PatientName[]>([]);
  selectedPatientId = signal('');
  searchTerm = signal('');

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.patients();
    }
    return this.patients().filter(patient =>
      patient.name.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.resetForm();
    this.loadPatients();
  }

  onSubmit(): void {
    if (!this.selectedPatientId()) {
      this.notificationHelper.showWarning('Selecione um paciente para gerar o relatório.');
      return;
    }

    const patientIdValue = Number(this.selectedPatientId());
    if (Number.isNaN(patientIdValue)) {
      this.notificationHelper.showWarning('Informe um ID de paciente válido.');
      return;
    }

    this.loadingService
      .track(this.patientReportService.generateReport(patientIdValue))
      .subscribe({
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

  private resetForm(): void {
    this.selectedPatientId.set('');
    this.searchTerm.set('');
  }

  private loadPatients(): void {
    this.loadingService.track(this.patientService.getNames()).subscribe({
      next: (patients) => {
        this.patients.set(Array.isArray(patients) ? patients : []);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os pacientes.');
      }
    });
  }
}
