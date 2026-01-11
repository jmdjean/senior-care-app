import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

  // Lista planos disponíveis para associação de pacientes.
  // Endpoint simples sem filtros.
  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(apiUrls.plans);
  }
}
