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

  getMonthlyFoodTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.marketFoodTotal, { params });
  }

  getMonthlyCleaningTotal(): Observable<{ value: number }> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<{ value: number }>(apiUrls.marketCleaningTotal, { params });
  }
}
