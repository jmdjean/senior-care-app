import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

@Injectable({
  providedIn: 'root'
})
export class MarketOverviewService {
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  // Soma mensal de gastos com alimentação, respeitando sede selecionada.
  // Reaproveita params gerados pelo seletor de sedes.
  getMonthlyFoodTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.marketFoodTotal, { params });
  }

  // Soma mensal de gastos com limpeza por sede.
  // Compartilha construção de params para consistência.
  getMonthlyCleaningTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.marketCleaningTotal, { params });
  }
}
