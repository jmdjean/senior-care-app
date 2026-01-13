import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type CalendarType = 'Visita' | 'Horario fechado';

export type CalendarEntry = {
  id: number;
  type: CalendarType;
  date: string;
  time: string | null;
  allDay: boolean;
  name?: string;
  phone?: string;
  headquarterId: number;
  headquarterName?: string;
  observation?: string;
  createdAt?: string;
};

export type CalendarAvailabilitySlot = {
  date: string;
  time: string;
};

export type CalendarPayload = {
  type: CalendarType;
  date: string;
  time: string | null;
  allDay: boolean;
  name?: string;
  phone?: string;
  headquarterId: number;
  observation?: string;
};

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private http = inject(HttpClient);
  private headquarterSelection = inject(HeadquarterSelectionService);

  // Lista registros futuros do calendario, aplicando filtro de sede quando houver.
  getEntries(): Observable<CalendarEntry[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<CalendarEntry[] | { items: unknown[] }>(apiUrls.calendarEntries, { params }).pipe(
      map((response) => {
        const raw = Array.isArray(response) ? response : response?.items ?? [];
        return raw.map((item) => this.normalizeEntry(item));
      })
    );
  }

  // Retorna janelas livres para auxiliar no agendamento.
  getAvailability(): Observable<CalendarAvailabilitySlot[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http
      .get<CalendarAvailabilitySlot[] | { slots: CalendarAvailabilitySlot[] }>(apiUrls.calendarAvailability, {
        params
      })
      .pipe(
        map((response) => {
          if (Array.isArray(response)) return response;
          return response?.slots ?? [];
        })
      );
  }

  // Busca registro individual por id.
  getById(id: number): Observable<CalendarEntry> {
    return this.http
      .get<Record<string, unknown>>(`${apiUrls.calendarEntries}/${id}`)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  // Cria novo registro.
  create(payload: CalendarPayload): Observable<CalendarEntry> {
    return this.http
      .post<Record<string, unknown>>(apiUrls.calendarEntries, payload)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  // Atualiza registro existente.
  update(id: number, payload: CalendarPayload): Observable<CalendarEntry> {
    return this.http
      .put<Record<string, unknown>>(`${apiUrls.calendarEntries}/${id}`, payload)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  // Normaliza diferentes formatos vindos da API.
  private normalizeEntry(data: unknown): CalendarEntry {
    const record = (data ?? {}) as Record<string, unknown>;
    const type = (record['type'] ?? record['tipo'] ?? 'Visita') as CalendarType;
    const time = (record['time'] ?? record['hora']) as string | undefined | null;
    const headquarterIdValue = record['headquarterId'] ?? record['headquarter_id'];
    const headquarterId = typeof headquarterIdValue === 'number'
      ? headquarterIdValue
      : Number(headquarterIdValue ?? 0);

    return {
      id: (record['id'] as number) ?? 0,
      type,
      date: (record['date'] ?? record['data'] ?? '') as string,
      time: time === undefined ? null : (time as string | null),
      allDay: (record['allDay'] ?? record['fecharDiaTodo'] ?? !time) as boolean,
      name: (record['name'] ?? record['nome']) as string | undefined,
      phone: (record['phone'] ?? record['celular']) as string | undefined,
      headquarterId: Number.isFinite(headquarterId) ? headquarterId : 0,
      headquarterName: (record['headquarterName'] ?? record['headquarter_name']) as string | undefined,
      observation: (record['observation'] ?? record['observacao']) as string | undefined,
      createdAt: (record['createdAt'] ?? record['created_at']) as string | undefined
    };
  }
}
