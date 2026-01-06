import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type PatientExam = {
  patientName: string;
  examType: string;
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
      map((response) => response.exams ?? [])
    );
  }
}
