import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

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
  constructor(private http: HttpClient) {}

  getGeneralBalance(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/general-balance`);
  }

  getMonthlyExpenses(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-expenses`);
  }

  getMonthlyMarket(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-market`);
  }

  getEmployees(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/employees`);
  }

  getRent(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/rent`);
  }

  getPatientsTotal(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(apiUrls.financialPatientsTotal);
  }

  getEmployeesTotalByType(type: string): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(apiUrls.financialEmployeesByType(type));
  }
}
