import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { MedicalPrescriptionService, Prescription } from '../../../shared/services/medical-prescription.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-patient-medicines',
  templateUrl: './patient-medicines.component.html',
  styleUrl: './patient-medicines.component.scss',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientMedicinesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private medicalPrescriptionService = inject(MedicalPrescriptionService);

  prescriptions = signal<Prescription[]>([]);
  patientId = signal<number | null>(null);

  ngOnInit(): void {
    this.inicializarTela();
  }

  // Obtém o id do paciente pela rota e inicia a carga das prescrições.
  // Redireciona para a lista caso o parâmetro seja inválido ou ausente.
  private inicializarTela(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!Number.isNaN(parsedId)) {
        this.patientId.set(parsedId);
        this.loadPrescriptions(parsedId);
      } else {
        this.router.navigate(['/patient-configurator/patients']);
      }
    } else {
      this.router.navigate(['/patient-configurator/patients']);
    }
  }

  // Busca prescrições do paciente e atualiza a lista exibida.
  // Em caso de erro, apresenta mensagem detalhada vinda do backend.
  private loadPrescriptions(patientId: number): void {
    this.loadingService.track(this.medicalPrescriptionService.getByPatientId(patientId)).subscribe({
      next: (prescriptions) => {
        this.prescriptions.set(prescriptions);
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível carregar as prescrições médicas.');
      }
    });
  }

  // Retorna para a tela de pacientes dentro do configurador.
  // Mantém a navegação consistente com as demais seções.
  goBack(): void {
    this.router.navigate(['/patient-configurator/patients']);
  }
}
