import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../shared/services/exam.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { PatientName, PatientService } from '../../shared/services/patient.service';

@Component({
  selector: 'app-exam',
  imports: [RouterLink, FormsModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.scss',
  standalone: true
})
export class ExamComponent implements OnInit {
  private examService = inject(ExamService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);

  patients: PatientName[] = [];
  selectedPatientId = '';
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.resetForm();
    this.loadPatients();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
  }

  onSubmit(): void {
    if (!this.selectedPatientId) {
      this.notificationHelper.showWarning('Informe o paciente para enviar o exame.');
      return;
    }

    if (!this.selectedFile) {
      this.notificationHelper.showWarning('Selecione um arquivo para enviar.');
      return;
    }

    if (!this.isAllowedFile(this.selectedFile)) {
      this.notificationHelper.showWarning('Arquivo inválido. Use PDF, TXT ou Word.');
      return;
    }

    const patientIdValue = Number(this.selectedPatientId);
    if (Number.isNaN(patientIdValue)) {
      this.notificationHelper.showWarning('Informe um ID de paciente válido.');
      return;
    }

    this.loadingService
      .track(this.examService.uploadExam(patientIdValue, this.selectedFile))
      .subscribe({
        next: () => {
          this.notificationHelper.showSuccess('Exame enviado com sucesso.');
          this.resetForm();
        },
        error: () => {
          this.notificationHelper.showError('Não foi possível enviar o exame.');
        }
      });
  }

  private resetForm(): void {
    this.selectedPatientId = '';
    this.selectedFile = null;
  }

  private isAllowedFile(file: File): boolean {
    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => lowerName.endsWith(ext));
  }

  private loadPatients(): void {
    this.loadingService.track(this.patientService.getNames()).subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os pacientes.');
      }
    });
  }
}