import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';
import { environment } from '../../../environments/environment';
import { calendarMockAvailability, calendarMockEntries } from '../mocks/calendar.mocks';

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
  private mockEntries: CalendarEntry[] = calendarMockEntries.map((entry) => ({ ...entry }));
  private mockAvailability: CalendarAvailabilitySlot[] = calendarMockAvailability.map((slot) => ({ ...slot }));
  private nextMockId = this.mockEntries.length + 1;

  // Lista registros futuros do calendario, aplicando filtro de sede quando houver.
  getEntries(): Observable<CalendarEntry[]> {
    if (environment.useCalendarMock) {
      const entries = this.applyHeadquarterFilter(this.mockEntries);
      return of(entries.map((entry) => ({ ...entry })));
    }

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
    if (environment.useCalendarMock) {
      return of(this.mockAvailability.map((slot) => ({ ...slot })));
    }

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
    if (environment.useCalendarMock) {
      const entry = this.mockEntries.find((item) => item.id === id);
      if (entry) {
        return of({ ...entry });
      }
      return throwError(() => new Error('Mock: compromisso nao encontrado.'));
    }

    return this.http
      .get<Record<string, unknown>>(`${apiUrls.calendarEntries}/${id}`)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  // Cria novo registro.
  create(payload: CalendarPayload): Observable<CalendarEntry> {
    if (environment.useCalendarMock) {
      const newEntry: CalendarEntry = {
        id: this.nextMockId++,
        type: payload.type,
        date: payload.date,
        time: payload.allDay ? null : payload.time,
        allDay: payload.allDay,
        name: payload.name,
        phone: payload.phone,
        headquarterId: payload.headquarterId,
        headquarterName: this.resolveHeadquarterName(payload.headquarterId),
        observation: payload.observation,
        createdAt: new Date().toISOString()
      };

      this.mockEntries = [...this.mockEntries, newEntry];
      return of({ ...newEntry });
    }

    return this.http
      .post<Record<string, unknown>>(apiUrls.calendarEntries, payload)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  // Atualiza registro existente.
  update(id: number, payload: CalendarPayload): Observable<CalendarEntry> {
    if (environment.useCalendarMock) {
      const index = this.mockEntries.findIndex((item) => item.id === id);
      if (index === -1) {
        return throwError(() => new Error('Mock: compromisso nao encontrado.'));
      }

      const previous = this.mockEntries[index];
      const updated: CalendarEntry = {
        ...previous,
        ...payload,
        time: payload.allDay ? null : payload.time,
        headquarterId: payload.headquarterId,
        headquarterName: this.resolveHeadquarterName(payload.headquarterId) ?? previous.headquarterName,
        observation: payload.observation
      };

      this.mockEntries = [
        ...this.mockEntries.slice(0, index),
        updated,
        ...this.mockEntries.slice(index + 1)
      ];

      return of({ ...updated });
    }

    return this.http
      .put<Record<string, unknown>>(`${apiUrls.calendarEntries}/${id}`, payload)
      .pipe(map((data) => this.normalizeEntry(data)));
  }

  private applyHeadquarterFilter(entries: CalendarEntry[]): CalendarEntry[] {
    const selectedHeadquarterId = this.headquarterSelection.selectedHeadquarterId();
    if (selectedHeadquarterId === null) {
      return [...entries];
    }
    return entries.filter((entry) => entry.headquarterId === selectedHeadquarterId);
  }

  private resolveHeadquarterName(headquarterId: number): string | undefined {
    const headquarters = this.headquarterSelection.headquarters();
    const match = headquarters.find((item) => item.id === headquarterId);
    if (match) {
      return match.name;
    }

    const selected = this.headquarterSelection.selectedHeadquarter();
    if (selected?.id === headquarterId) {
      return selected.name;
    }
    return undefined;
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
