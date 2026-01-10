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
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  getGeneralBalance(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/general-balance`, { params });
  }

  getMonthlyExpenses(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-expenses`, { params });
  }

  getMonthlyMarket(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/monthly-market`, { params });
  }

  getEmployees(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/employees`, { params });
  }

  getRent(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(`${apiUrls.financialOverview}/rent`, { params });
  }

  getPatientsTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.financialPatientsTotal, { params });
  }

  getEmployeesTotalByType(type: string): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.financialEmployeesByType(type), { params });
  }
}
