import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Patient = {
  id: number;
  name: string;
  birthday: string;
  closerContact: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  height?: number;
  weight?: number;
  planId: number;
  createdAt: string;
  planName: string;
  diseases: string[];
  diseaseIds?: number[];
  cpf?: string;
  rg?: string;
  customValue?: number;
  observation?: string;
};

export type PatientCreatePayload = {
  name: string;
  birthday: string;
  closerContact: string;
  sex: string;
  height: number;
  weight: number;
  planId: number;
  diseaseIds: number[];
  cpf?: string;
  rg?: string;
  customValue?: number;
  observation?: string;
};

export type PatientName = {
  id: number;
  name: string;
};

type PatientsResponse = {
  patients: Patient[];
};

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private http: HttpClient) {}

  create(patient: PatientCreatePayload): Observable<Patient> {
    return this.http.post<Patient>(apiUrls.patients, patient);
  }

  update(patientId: number, patient: PatientCreatePayload): Observable<Patient> {
    return this.http.put<Patient>(`${apiUrls.patients}/${patientId}`, patient);
  }

  delete(patientId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.patients}/${patientId}`);
  }

  getById(patientId: number): Observable<Patient> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.patients}/${patientId}`).pipe(
      map((response) => {
        // Handle both snake_case and camelCase responses from API
        const data: Record<string, unknown> = (response['patient'] as Record<string, unknown>) ?? response;
        return {
          id: (data['id'] as number) ?? 0,
          name: (data['name'] as string) ?? '',
          birthday: (data['birthday'] as string) ?? '',
          closerContact: (data['closer_contact'] ?? data['closerContact'] ?? '') as string,
          sex: (data['sex'] as string) ?? '',
          heightCm: String(data['height_cm'] ?? data['heightCm'] ?? data['height'] ?? ''),
          weightKg: String(data['weight_kg'] ?? data['weightKg'] ?? data['weight'] ?? ''),
          height: (data['height'] as number) ?? undefined,
          weight: (data['weight'] as number) ?? undefined,
          planId: (data['plan_id'] ?? data['planId'] ?? 0) as number,
          createdAt: (data['created_at'] ?? data['createdAt'] ?? '') as string,
          planName: (data['plan_name'] ?? data['planName'] ?? '') as string,
          diseases: (data['diseases'] as string[]) ?? [],
          diseaseIds: (data['disease_ids'] ?? data['diseaseIds']) as number[] | undefined,
          cpf: (data['cpf'] as string) ?? undefined,
          rg: (data['rg'] as string) ?? undefined,
          customValue: (data['custom_value'] ?? data['customValue']) as number | undefined,
          observation: (data['observation'] as string) ?? undefined
        };
      })
    );
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<PatientsResponse>(apiUrls.patients).pipe(
      map((response) => response.patients ?? [])
    );
  }

  getNames(): Observable<PatientName[]> {
    return this.http.get<PatientName[] | { patients?: PatientName[] }>(apiUrls.patientNames).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.patients ?? [];
      })
    );
  }
}
