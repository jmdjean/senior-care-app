import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

export type Plan = {
  id: number;
  name: string;
};

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(apiUrls.plans);
  }
}
