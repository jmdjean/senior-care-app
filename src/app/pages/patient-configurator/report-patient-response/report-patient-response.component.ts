import { DatePipe } from '@angular/common';
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
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportPatientResponseComponent implements OnInit {
  private router = inject(Router);

  report = signal<PatientReportResponse | null>(null);
  sections = signal<ReportSection[]>([]);
  createdAt = signal<string>('');

  ngOnInit(): void {
    this.inicializarRelatorio();
  }

  // Recupera o relatório da navegação; constrói se houver dados, redireciona se faltar estado.
  // Evita exibir tela vazia quando o acesso ocorre sem contexto válido.
  private inicializarRelatorio(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state ?? history.state;

    if (state?.['report']) {
      const reportData = state['report'] as PatientReportResponse;
      this.report.set(reportData);
      this.createdAt.set(reportData.createdAt ?? '');
      this.buildSections(reportData);
    } else {
      this.router.navigate(['/patient-configurator/report']);
    }
  }

  // Monta as seções do relatório com títulos, itens e ícones para exibição.
  // Usa dados retornados pela API para preencher listas de cada bloco.
  private buildSections(data: PatientReportResponse): void {
    const reportContent = data.report;
    const sectionsList: ReportSection[] = [
      {
        title: 'Informações gerais',
        items: reportContent.generalInformation ?? [],
        icon: 'feather icon-user'
      },
      {
        title: 'Observações',
        items: reportContent.observations ?? [],
        icon: 'feather icon-eye'
      },
      {
        title: 'Cuidados',
        items: reportContent.worries ?? [],
        icon: 'feather icon-alert-triangle'
      },
      {
        title: 'Doenças',
        items: reportContent.diseases ?? [],
        icon: 'feather icon-activity'
      },
      {
        title: 'Remédios e dosagens',
        items: reportContent.medicationDosages ?? [],
        icon: 'feather icon-package'
      }
    ];

    this.sections.set(sectionsList);
  }

  // Indica se a seção possui conteúdo para controle de renderização.
  // Retorna falso quando a lista é vazia ou indefinida.
  hasContent(items: string[]): boolean {
    return items && items.length > 0;
  }
}
