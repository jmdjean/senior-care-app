import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.get<Rent>(apiUrls.rent);
  }
}
