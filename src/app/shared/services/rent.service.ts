import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type Rent = {
  id: number;
  value: number;
  createdAt: string;
};

export type RentCreatePayload = {
  value: number;
  headquarterId: number;
};

@Injectable({
  providedIn: 'root'
})
export class RentService {
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  create(rent: RentCreatePayload): Observable<Rent> {
    return this.http.post<Rent>(apiUrls.rent, rent);
  }

  get(): Observable<Rent> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<Record<string, unknown>>(apiUrls.financialOverviewRent, { params }).pipe(
      map((response) => {
        const data: Record<string, unknown> = (response['rent'] as Record<string, unknown>) ?? response;
        return {
          id: (data['id'] as number) ?? 0,
          value: typeof data['value'] === 'string' ? parseFloat(data['value']) : (data['value'] as number) ?? 0,
          createdAt: (data['created_at'] ?? data['createdAt'] ?? '') as string
        };
      })
    );
  }
}
