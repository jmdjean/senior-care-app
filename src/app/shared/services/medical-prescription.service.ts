import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type MedicalPrescriptionPayload = {
  patientId: number;
  observation: string;
  medicalPrescription: File | null;
};

export type PatientMedicines = {
  medicines: string[];
};

@Injectable({
  providedIn: 'root'
})
export class MedicalPrescriptionService {
  private http = inject(HttpClient);

  create(payload: MedicalPrescriptionPayload): Observable<void> {
    const formData = new FormData();
    formData.append('patientId', payload.patientId.toString());
    formData.append('observation', payload.observation);
    
    if (payload.medicalPrescription) {
      formData.append('medicalPrescription', payload.medicalPrescription);
    }

    return this.http.post<void>(apiUrls.medicalPrescription, formData);
  }

  getByPatientId(patientId: number): Observable<PatientMedicines> {
    return this.http.get<PatientMedicines>(apiUrls.medicalPrescriptionByPatient(patientId)).pipe(
      map((response) => ({
        medicines: response.medicines ?? []
      }))
    );
  }
}
