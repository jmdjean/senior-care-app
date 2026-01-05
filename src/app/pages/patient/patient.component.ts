import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { PhoneMaskPipe } from '../../shared/pipes/phone-mask.pipe';
import { LoadingService } from '../../shared/services/loading.service';
import { Patient, PatientService } from '../../shared/services/patient.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';

@Component({
  selector: 'app-patient',
  imports: [RouterLink, DatePipe, AgePipe, PhoneMaskPipe],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss',
  standalone: true
})
export class PatientComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private patientService = inject(PatientService);
  private notificationHelper = inject(NotificationHelperService);

  patients: Patient[] = [];

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.loadingService.track(this.patientService.getAll()).subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar os pacientes.');
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
}
