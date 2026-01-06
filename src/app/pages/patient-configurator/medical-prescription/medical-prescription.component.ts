import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { MedicalPrescriptionService } from '../../../shared/services/medical-prescription.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { PatientName, PatientService } from '../../../shared/services/patient.service';

@Component({
  selector: 'app-medical-prescription',
  templateUrl: './medical-prescription.component.html',
  styleUrl: './medical-prescription.component.scss',
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
export class MedicalPrescriptionComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);
  private medicalPrescriptionService = inject(MedicalPrescriptionService);

  patients = signal<PatientName[]>([]);
  selectedPatientId = signal('');
  selectedFile = signal<File | null>(null);
  searchTerm = signal('');
  observation = signal('');

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (!this.selectedPatientId()) {
      this.notificationHelper.showWarning('Informe o paciente para enviar a prescrição médica.');
      return;
    }

    const hasFile = this.selectedFile() !== null;
    const hasObservation = this.observation().trim().length > 0;

    if (!hasFile && !hasObservation) {
      this.notificationHelper.showWarning('Informe a observação ou selecione um arquivo de prescrição médica.');
      return;
    }

    if (hasFile && !this.isAllowedFile(this.selectedFile()!)) {
      this.notificationHelper.showWarning('Arquivo inválido. Use PDF, TXT ou Word.');
      return;
    }

    const patientIdValue = Number(this.selectedPatientId());
    if (Number.isNaN(patientIdValue)) {
      this.notificationHelper.showWarning('Informe um ID de paciente válido.');
      return;
    }

    this.loadingService
      .track(
        this.medicalPrescriptionService.create({
          patientId: patientIdValue,
          observation: this.observation().trim(),
          medicalPrescription: this.selectedFile()
        })
      )
      .subscribe({
        next: () => {
          this.notificationHelper.showSuccess('Prescrição médica enviada com sucesso.');
          this.resetForm();
        },
        error: (error) => {
          this.notificationHelper.showBackendError(error, 'Não foi possível enviar a prescrição médica.');
        }
      });
  }

  private resetForm(): void {
    this.selectedPatientId.set('');
    this.selectedFile.set(null);
    this.searchTerm.set('');
    this.observation.set('');
  }

  private isAllowedFile(file: File): boolean {
    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => lowerName.endsWith(ext));
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
