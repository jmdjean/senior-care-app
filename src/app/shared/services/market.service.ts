import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Market = {
  id: number;
  fileUrl: string;
  value: number;
  purchaseDate: string;
  importDate: string;
  itemCount: number;
};

export type MarketCreatePayload = {
  file: File;
  value: number;
  purchaseDate: string;
};

type MarketsResponse = {
  markets: Market[];
};

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  constructor(private http: HttpClient) {}

  create(market: MarketCreatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('file', market.file);
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);

    return this.http.post<Market>(apiUrls.market, formData);
  }

  update(marketId: number, market: MarketCreatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('file', market.file);
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);

    return this.http.put<Market>(`${apiUrls.market}/${marketId}`, formData);
  }

  delete(marketId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.market}/${marketId}`);
  }

  getById(marketId: number): Observable<Market> {
    return this.http.get<Market>(`${apiUrls.market}/${marketId}`);
  }

  getAll(): Observable<Market[]> {
    return this.http.get<MarketsResponse>(apiUrls.market).pipe(
      map((response) => response.markets ?? [])
    );
  }
}
