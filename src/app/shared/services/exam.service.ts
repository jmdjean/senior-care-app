import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type PatientExamAiMetric = {
  name?: string;
  unit?: string;
  value?: string;
  reference?: string;
};

export type PatientExamAiPayload = {
  risks?: string[];
  metrics?: PatientExamAiMetric[];
  patient?: {
    sex?: string;
    name?: string;
    birthDate?: string | null;
  };
  summary?: string;
  examType?: string;
  findings?: string[];
  diagnoses?: string[];
  performedAt?: string;
  recommendations?: string[];
};

export type PatientExam = {
  patientName: string;
  examType: string;
  performedAt?: string;
  aiPayload?: PatientExamAiPayload;
};

type PatientExamsResponse = {
  exams: PatientExam[];
};

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private http = inject(HttpClient);

  uploadExam(patientId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(apiUrls.patientExams(patientId), formData);
  }

  getByPatientId(patientId: number): Observable<PatientExam[]> {
    return this.http.get<PatientExamsResponse>(apiUrls.patientExams(patientId)).pipe(
      map((response) =>
        (response.exams ?? []).map((exam: any) => ({
          patientName: exam?.patientName ?? exam?.patient_name ?? exam?.patient?.name ?? '',
          examType: exam?.examType ?? exam?.exam_type ?? exam?.examName ?? '',
          performedAt: exam?.performedAt ?? exam?.performed_at ?? exam?.performedDate ?? exam?.date,
          aiPayload: (exam?.ai_payload ?? exam?.aiPayload ?? null) || undefined
        }))
      )
    );
  }
}
