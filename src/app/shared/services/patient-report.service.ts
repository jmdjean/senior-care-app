import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

export type PatientReportResponse = {
  generalInformation: string[];
  observations: string[];
  worries: string[];
  diseases: string[];
  medicationDosages: string[];
};

@Injectable({
  providedIn: 'root'
})
export class PatientReportService {
  private http = inject(HttpClient);

  generateReport(patientId: number): Observable<PatientReportResponse> {
    return this.http.post<PatientReportResponse>(apiUrls.patientReport, { patientId });
  }
}
