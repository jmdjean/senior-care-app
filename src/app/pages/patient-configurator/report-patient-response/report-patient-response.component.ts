import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PatientReportResponse } from '../../../shared/services/patient-report.service';

type ReportSection = {
  title: string;
  items: string[];
  icon: string;
};

@Component({
  selector: 'app-report-patient-response',
  templateUrl: './report-patient-response.component.html',
  styleUrl: './report-patient-response.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportPatientResponseComponent implements OnInit {
  private router = inject(Router);

  report = signal<PatientReportResponse | null>(null);
  sections = signal<ReportSection[]>([]);

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state ?? history.state;

    if (state?.['report']) {
      const reportData = state['report'] as PatientReportResponse;
      this.report.set(reportData);
      this.buildSections(reportData);
    } else {
      this.router.navigate(['/patient-configurator/report']);
    }
  }

  private buildSections(data: PatientReportResponse): void {
    const sectionsList: ReportSection[] = [
      {
        title: 'Informações gerais',
        items: data.generalInformation ?? [],
        icon: 'feather icon-user'
      },
      {
        title: 'Observações',
        items: data.observations ?? [],
        icon: 'feather icon-eye'
      },
      {
        title: 'Cuidados',
        items: data.worries ?? [],
        icon: 'feather icon-alert-triangle'
      },
      {
        title: 'Doenças',
        items: data.diseases ?? [],
        icon: 'feather icon-activity'
      },
      {
        title: 'Remédios e dosagens',
        items: data.medicationDosages ?? [],
        icon: 'feather icon-package'
      }
    ];

    this.sections.set(sectionsList);
  }

  hasContent(items: string[]): boolean {
    return items && items.length > 0;
  }
}
