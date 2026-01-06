import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ConfigCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-patient-configurator',
  templateUrl: './patient-configurator.component.html',
  styleUrl: './patient-configurator.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientConfiguratorComponent {
  cards: ConfigCard[] = [
    {
      title: 'Pacientes',
      icon: 'feather icon-users',
      route: '/patient-configurator/patients'
    },
    {
      title: 'Importar exames',
      icon: 'feather icon-activity',
      route: '/patient-configurator/exams'
    },
    {
      title: 'Relatório',
      icon: 'feather icon-file-text',
      route: '/patient-configurator/report'
    },
    {
      title: 'Importar prescrição médica',
      icon: 'feather icon-clipboard',
      route: '/patient-configurator/medical-prescription'
    }
  ];
}
