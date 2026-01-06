import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PatientExam } from '../../../shared/services/exam.service';

@Component({
  selector: 'app-patient-exams-list',
  templateUrl: './patient-exams-list.component.html',
  styleUrl: './patient-exams-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientExamsListComponent {
  exams = input<PatientExam[]>([]);
}
