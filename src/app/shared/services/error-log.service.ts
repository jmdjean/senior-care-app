import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { errorLogsMock } from '../mocks/error-logs.mocks';
import { apiUrls } from '../urls';

export type ErrorLog = {
  id: number;
  dataHoraTransacao: string;
  urlRequisicao: string;
  corpoRequisicao: unknown;
  erro: string;
  statusRequisicao: number;
  metodo: string;
};

export type ErrorLogListResponse = {
  items: ErrorLog[];
  total?: number;
};

export type ErrorLogPage = {
  items: ErrorLog[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateErrorLogPayload = {
  dataHoraTransacao: string;
  urlRequisicao: string;
  corpoRequisicao: unknown;
  erro: string;
  statusRequisicao: number;
  metodo: string;
};

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private http = inject(HttpClient);
  private mockData: ErrorLog[] = errorLogsMock.map((item) => ({ ...item }));

  getAll(page = 1, pageSize = 20): Observable<ErrorLogPage> {
    if (environment.useErrorLogMock) {
      const start = (page - 1) * pageSize;
      const paged = this.mockData.slice(start, start + pageSize);
      return of({ items: paged.map((item) => ({ ...item })), total: this.mockData.length, page, pageSize });
    }

    return this.http
      .get<ErrorLogListResponse | ErrorLog[]>(apiUrls.errorLogs, { params: { page, pageSize } })
      .pipe(map((response) => this.mapPage(response, page, pageSize)));
  }

  getById(id: number): Observable<ErrorLog> {
    if (environment.useErrorLogMock) {
      const found = this.mockData.find((item) => item.id === id);
      if (found) return of({ ...found });
      return throwError(() => new Error('Log de erro não encontrado.'));
    }

    return this.http.get<ErrorLog>(`${apiUrls.errorLogs}/${id}`).pipe(map((item) => this.normalize(item)));
  }

  create(payload: CreateErrorLogPayload): Observable<void> {
    if (environment.useErrorLogMock) {
      this.mockData = [
        { ...payload, id: this.mockData.length ? Math.max(...this.mockData.map((i) => i.id)) + 1 : 1 },
        ...this.mockData
      ];
      return of(void 0);
    }

    return this.http.post<void>(apiUrls.errorLogs, payload);
  }

  private mapList(response: ErrorLogListResponse | ErrorLog[] | null | undefined): ErrorLog[] {
    const items = Array.isArray(response) ? response : response?.items ?? [];
    return items.map((item) => this.normalize(item));
  }

  private mapPage(
    response: ErrorLogListResponse | ErrorLog[] | null | undefined,
    page: number,
    pageSize: number
  ): ErrorLogPage {
    const items = this.mapList(response);
    const total = Array.isArray(response) ? response.length : response?.total ?? items.length;
    return { items, total, page, pageSize };
  }

  private normalize(item: Partial<ErrorLog> | null | undefined): ErrorLog {
    return {
      id: item?.id ?? 0,
      dataHoraTransacao: item?.dataHoraTransacao ?? '',
      urlRequisicao: item?.urlRequisicao ?? '',
      corpoRequisicao: item?.corpoRequisicao ?? null,
      erro: item?.erro ?? '',
      statusRequisicao: item?.statusRequisicao ?? 0,
      metodo: item?.metodo ?? ''
    };
  }
}
