import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Headquarter = {
  id: number;
  name: string;
  rent?: number;
  address?: string;
  phone?: string;
  observation?: string;
  createdAt?: string;
};

export type HeadquarterCreatePayload = {
  name: string;
  rent?: number;
  address?: string;
  phone?: string;
  observation?: string;
};

type HeadquartersResponse = {
  headquarters: Headquarter[];
};

@Injectable({
  providedIn: 'root'
})
export class HeadquarterService {
  constructor(private http: HttpClient) {}

  // Lista sedes disponíveis, aceitando resposta com wrapper ou array direto.
  // Normaliza campos antes de devolver.
  getAll(): Observable<Headquarter[]> {
    return this.http.get<HeadquartersResponse | Headquarter[]>(apiUrls.headquarters).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response.map((item) => this.normalizeHeadquarter(item));
        }
        return (response?.headquarters ?? []).map((item) => this.normalizeHeadquarter(item));
      })
    );
  }

  // Cria nova sede e já normaliza dados retornados.
  // Aceita valores numéricos em formato string.
  create(payload: HeadquarterCreatePayload): Observable<Headquarter> {
    return this.http
      .post<Headquarter>(apiUrls.headquarters, payload)
      .pipe(map((created) => this.normalizeHeadquarter(created)));
  }

  // Converte payloads heterogêneos em `Headquarter` consistente.
  // Lida com números em string e alias de nomes.
  private normalizeHeadquarter(data: Partial<Headquarter>): Headquarter {
    const toNumber = (value: unknown): number | undefined => {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value.replace(',', '.');
        const parsed = parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    const record = data as Record<string, unknown>;

    return {
      id: (record['id'] as number) ?? 0,
      name: (record['name'] ?? record['nome'] ?? '') as string,
      rent: toNumber(record['rent'] ?? record['aluguel']),
      address: (record['address'] ?? record['endereco']) as string | undefined,
      phone: (record['phone'] ?? record['telefone']) as string | undefined,
      observation: (record['observation'] ?? record['observacao']) as string | undefined,
      createdAt: (record['created_at'] ?? record['createdAt']) as string | undefined
    };
  }
}
