import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { apiUrls } from '../urls';
import { NotificationHelperService } from './notification-helper.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(
    private http: HttpClient,
    private notificationHelper: NotificationHelperService
  ) {}

  getTotalPatient(): Observable<number> {
    return this.http.get<number>(apiUrls.totalPatients).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o total de pacientes.')
      })
    );
  }

  getPatientPlanAverage(): Observable<number> {
    return this.http.get<number>(apiUrls.totalPatientsAveragePlan).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o plano Average.')
      })
    );
  }

  getPatientPlanGold(): Observable<number> {
    return this.http.get<number>(apiUrls.totalPatientsGoldPlan).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o plano Gold.')
      })
    );
  }
}
