import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

@Injectable({
  providedIn: 'root'
})
export class MarketOverviewService {
  constructor(private http: HttpClient) {}

  getMonthlyFoodTotal(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(apiUrls.marketFoodTotal);
  }

  getMonthlyCleaningTotal(): Observable<{ value: number }> {
    return this.http.get<{ value: number }>(apiUrls.marketCleaningTotal);
  }
}
