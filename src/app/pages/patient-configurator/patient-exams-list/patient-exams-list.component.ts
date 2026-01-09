import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PatientExam } from '../../../shared/services/exam.service';

@Component({
  selector: 'app-patient-exams-list',
  imports: [DatePipe],
  templateUrl: './patient-exams-list.component.html',
  styleUrl: './patient-exams-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientExamsListComponent {
  exams = input<PatientExam[]>([]);
}
