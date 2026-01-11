import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type FinancialOverview = {
  generalBalance: number;
  monthlyExpenses: number;
  monthlyMarket: number;
  employees: number;
  rent: number;
  patientsTotal: number;
};

@Injectable({
  providedIn: 'root'
})
export class FinancialOverviewService {
  private readonly headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private readonly http: HttpClient) {}

  // Recupera saldo geral considerando sede selecionada.
  // Reaproveita HttpParams construídos pelo seletor.
  getGeneralBalance(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/general-balance`, { params });
  }

  // Retorna despesas mensais filtradas pela sede atual.
  // Usa endpoint dedicado de overview financeiro.
  getMonthlyExpenses(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-expenses`, { params });
  }

  // Obtém total mensal de mercado para a sede ativa.
  // Mantém consistência de params entre chamadas.
  getMonthlyMarket(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-market`, { params });
  }

  // Conta funcionários considerando filtro de sede.
  // Retorna objeto com valor numérico.
  getEmployees(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/employees`, { params });
  }

  // Busca custo de aluguel por sede selecionada.
  // Endpoint dedicado ao indicador de aluguel.
  getRent(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/rent`, { params });
  }

  // Retorna total de pacientes aplicando filtro de sede quando houver.
  // Usa rota específica de pacientes no overview.
  getPatientsTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.financialPatientsTotal, { params });
  }

  // Conta funcionários por tipo, respeitando sede selecionada.
  // Recebe tipo como parâmetro da rota.
  getEmployeesTotalByType(type: string): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.financialEmployeesByType(type), { params });
  }
}
