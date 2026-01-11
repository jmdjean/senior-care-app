import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiUrls } from '../urls';
import { NotificationHelperService } from './notification-helper.service';

type TotalResponse = {
  total: number;
};

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(
    private http: HttpClient,
    private notificationHelper: NotificationHelperService
  ) {}

  // Busca total de pacientes e notifica erro amigável.
  // Encapsula tratamento de falha via snackbar.
  getTotalPatient(): Observable<TotalResponse> {
    return this.http.get<TotalResponse>(apiUrls.totalPatients).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o total de pacientes.')
      })
    );
  }

  // Retorna média de pacientes no plano Average.
  // Exibe snackbar quando a requisição falha.
  getPatientPlanAverage(): Observable<TotalResponse> {
    return this.http.get<TotalResponse>(apiUrls.totalPatientsAveragePlan).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o plano Average.')
      })
    );
  }

  // Retorna total de pacientes no plano Gold.
  // Em caso de erro informa usuário via snackbar.
  getPatientPlanGold(): Observable<TotalResponse> {
    return this.http.get<TotalResponse>(apiUrls.totalPatientsGoldPlan).pipe(
      tap({
        error: () =>
          this.notificationHelper.showError('Não foi possível carregar o plano Gold.')
      })
    );
  }
}
