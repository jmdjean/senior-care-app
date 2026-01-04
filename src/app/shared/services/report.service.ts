import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private http: HttpClient) {}

  createReport(patientId: number): Observable<void> {
    return this.http.post<void>(apiUrls.reports, { patientId });
  }
}
