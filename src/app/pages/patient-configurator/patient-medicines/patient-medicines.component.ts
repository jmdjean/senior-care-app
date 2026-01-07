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

  goBack(): void {
    this.router.navigate(['/patient-configurator/patients']);
  }
}
