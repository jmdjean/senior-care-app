import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

type ConfigCard = {
  title: string;
  icon: string;
  route: string;
  requiredPermission: 'patients' | 'importExams' | 'report' | 'importPrescription';
};

@Component({
  selector: 'app-patient-configurator',
  templateUrl: './patient-configurator.component.html',
  styleUrl: './patient-configurator.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientConfiguratorComponent {
  private userService = inject(UserService);

  private allCards: ConfigCard[] = [
    {
      title: 'Pacientes',
      icon: 'feather icon-users',
      route: '/patient-configurator/patients',
      requiredPermission: 'patients'
    },
    {
      title: 'Importar exames',
      icon: 'feather icon-upload',
      route: '/patient-configurator/exams',
      requiredPermission: 'importExams'
    },
    {
      title: 'Relatório',
      icon: 'feather icon-file-text',
      route: '/patient-configurator/report',
      requiredPermission: 'report'
    },
    {
      title: 'Importar prescrição médica',
      icon: 'feather icon-upload',
      route: '/patient-configurator/medical-prescription',
      requiredPermission: 'importPrescription'
    }
  ];

  cards = computed(() => {
    return this.allCards.filter(card => {
      switch (card.requiredPermission) {
        case 'patients':
          return this.userService.canViewPatients();
        case 'importExams':
          return this.userService.canImportFiles();
        case 'report':
          return this.userService.canGenerateReport();
        case 'importPrescription':
          return this.userService.canImportFiles();
        default:
          return false;
      }
    });
  });
}
