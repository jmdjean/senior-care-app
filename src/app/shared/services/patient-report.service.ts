import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type PatientReportData = {
  generalInformation: string[];
  observations: string[];
  worries: string[];
  diseases: string[];
  medicationDosages: string[];
};

export type PatientReportResponse = {
  report: PatientReportData;
  createdAt: string;
};

type ApiResponse = {
  report: PatientReportData;
  createdAt: string;
};

@Injectable({
  providedIn: 'root'
})
export class PatientReportService {
  private http = inject(HttpClient);

  // Gera relatório textual do paciente via API.
  // Normaliza resposta preservando dados do relatório e criação.
  generateReport(patientId: number): Observable<PatientReportResponse> {
    return this.http.post<ApiResponse>(apiUrls.patientReport, { patientId }).pipe(
      map((response) => ({
        report: response.report,
        createdAt: response.createdAt
      }))
    );
  }
}
