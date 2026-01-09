import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Rent = {
  id: number;
  value: number;
  createdAt: string;
};

export type RentCreatePayload = {
  value: number;
};

@Injectable({
  providedIn: 'root'
})
export class RentService {
  constructor(private http: HttpClient) {}

  create(rent: RentCreatePayload): Observable<Rent> {
    return this.http.post<Rent>(apiUrls.rent, rent);
  }

  get(): Observable<Rent> {
    return this.http.get<Record<string, unknown>>(apiUrls.rent).pipe(
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
