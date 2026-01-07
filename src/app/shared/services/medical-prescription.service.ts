import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type MedicalPrescriptionPayload = {
  patientId: number;
  observation: string;
  medicalPrescription: File | null;
};

export type Prescription = {
  id: number;
  patientId: number;
  fileName: string;
  fileType: string;
  sentAt: string;
  rawText: string;
  observation: string | null;
  aiPayload: {
    medicalPrescription: string[];
  };
};

export type PrescriptionsResponse = {
  prescriptions: Prescription[];
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

  getByPatientId(patientId: number): Observable<Prescription[]> {
    return this.http.get<PrescriptionsResponse>(apiUrls.medicalPrescriptionByPatient(patientId)).pipe(
      map((response) => {
        const prescriptions = response.prescriptions ?? [];
        return prescriptions.map((p: Record<string, unknown>) => ({
          id: p['id'] as number,
          patientId: p['patient_id'] as number,
          fileName: p['file_name'] as string,
          fileType: p['file_type'] as string,
          sentAt: p['sent_at'] as string,
          rawText: p['raw_text'] as string,
          observation: p['observation'] as string | null,
          aiPayload: p['ai_payload'] as { medicalPrescription: string[] }
        }));
      })
    );
  }
}
