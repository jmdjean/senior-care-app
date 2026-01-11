import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService, PatientExam } from '../../../shared/services/exam.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { PatientExamsListComponent } from '../patient-exams-list/patient-exams-list.component';

@Component({
  selector: 'app-patient-exams',
  templateUrl: './patient-exams.component.html',
  styleUrl: './patient-exams.component.scss',
  imports: [RouterLink, PatientExamsListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientExamsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private examService = inject(ExamService);

  exams = signal<PatientExam[]>([]);
  patientId = signal<number | null>(null);
  showResults = signal(false);

  ngOnInit(): void {
    this.inicializarTela();
  }

  // Resolve o id do paciente pela rota e dispara a carga de exames válidos.
  // Redireciona para a lista caso o parâmetro esteja ausente ou inválido.
  private inicializarTela(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!Number.isNaN(parsedId)) {
        this.patientId.set(parsedId);
        this.loadExams(parsedId);
      } else {
        this.router.navigate(['/patient-configurator/patients']);
      }
    } else {
      this.router.navigate(['/patient-configurator/patients']);
    }
  }

  // Busca exames do paciente informado e exibe os resultados ao concluir.
  // Mostra erro detalhado se a API retornar falha.
  private loadExams(patientId: number): void {
    this.loadingService.track(this.examService.getByPatientId(patientId)).subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.showResults.set(true);
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível carregar os exames.');
      }
    });
  }

  // Retorna para a listagem de pacientes do configurador.
  // Usa navegação direta para manter fluxo consistente.
  goBack(): void {
    this.router.navigate(['/patient-configurator/patients']);
  }
}
