import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private http: HttpClient) {}

  // Solicita geração de relatório PDF/Excel para paciente.
  // Encaminha apenas o id na requisição.
  createReport(patientId: number): Observable<void> {
    return this.http.post<void>(apiUrls.reports, { patientId });
  }
}
