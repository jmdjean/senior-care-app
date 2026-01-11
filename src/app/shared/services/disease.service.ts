import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

export type Disease = {
  id: number;
  name: string;
};

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  constructor(private http: HttpClient) {}

  // Retorna lista de doenças disponíveis.
  // Usa endpoint simples sem filtros.
  getAll(): Observable<Disease[]> {
    return this.http.get<Disease[]>(apiUrls.disease);
  }
}
