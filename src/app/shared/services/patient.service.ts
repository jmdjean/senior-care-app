import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<Patient>(`${apiUrls.patients}/${patientId}`);
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
