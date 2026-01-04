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
  planId: number;
  createdAt: string;
  planName: string;
  diseases: string[];
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

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(apiUrls.patients, patient);
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<PatientsResponse>(apiUrls.patients).pipe(
      map((response) => response.patients ?? [])
    );
  }

  getNames(): Observable<PatientName[]> {
    return this.http.get<PatientName[]>(apiUrls.patientNames);
  }
}
