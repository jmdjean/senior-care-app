import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { traceabilityMock } from '../mocks/traceability.mocks';
import { apiUrls } from '../urls';

export type TraceabilityRecord = {
  id: number;
  dataHoraAcao: string;
  nomeUsuario: string;
  sede: string;
  acao: string;
  requisicao: unknown;
};

export type TraceabilityListResponse = {
  items: TraceabilityRecord[];
  total?: number;
};

export type TraceabilityPage = {
  items: TraceabilityRecord[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable({
  providedIn: 'root'
})
export class TraceabilityService {
  private http = inject(HttpClient);
  private mockData: TraceabilityRecord[] = traceabilityMock.map((item) => ({ ...item }));

  getAll(page = 1, pageSize = 20): Observable<TraceabilityPage> {
    if (environment.useTraceabilityMock) {
      const start = (page - 1) * pageSize;
      const paged = this.mockData.slice(start, start + pageSize);
      return of({ items: paged.map((item) => ({ ...item })), total: this.mockData.length, page, pageSize });
    }

    return this.http.get<TraceabilityListResponse | TraceabilityRecord[]>(apiUrls.traceabilities).pipe(
      map((response) => this.mapPage(response, page, pageSize))
    );
  }

  getById(id: number): Observable<TraceabilityRecord> {
    if (environment.useTraceabilityMock) {
      const found = this.mockData.find((item) => item.id === id);
      if (found) return of({ ...found });
      return throwError(() => new Error('Registro de rastreabilidade nao encontrado.'));
    }

    return this.http.get<TraceabilityRecord>(`${apiUrls.traceabilities}/${id}`).pipe(
      map((item) => this.normalize(item))
    );
  }

  private mapPage(
    response: TraceabilityListResponse | TraceabilityRecord[] | null | undefined,
    page: number,
    pageSize: number
  ): TraceabilityPage {
    const items = Array.isArray(response) ? response : response?.items ?? [];
    const normalized = items.map((item) => this.normalize(item));
    const total = Array.isArray(response) ? response.length : response?.total ?? normalized.length;
    return { items: normalized, total, page, pageSize };
  }

  private normalize(item: Partial<TraceabilityRecord>): TraceabilityRecord {
    return {
      id: (item.id as number) ?? 0,
      dataHoraAcao: (item.dataHoraAcao as string) ?? '',
      nomeUsuario: (item.nomeUsuario as string) ?? '',
      sede: (item.sede as string) ?? '',
      acao: (item.acao as string) ?? '',
      requisicao: item.requisicao ?? null
    };
  }
}
