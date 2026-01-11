import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

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
  headquarterId?: number;
  headquarterName?: string;
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
  headquarterId?: number;
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
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  // Cria paciente com dados clínicos e vínculo de sede opcional.
  // Encaminha payload direto em JSON.
  create(patient: PatientCreatePayload): Observable<Patient> {
    return this.http.post<Patient>(apiUrls.patients, patient);
  }

  // Atualiza paciente existente mantendo estrutura do payload.
  // Rota parametrizada pelo id do paciente.
  update(patientId: number, patient: PatientCreatePayload): Observable<Patient> {
    return this.http.put<Patient>(`${apiUrls.patients}/${patientId}`, patient);
  }

  // Remove paciente pelo id.
  // Retorna Observable vazio para encadear operações.
  delete(patientId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.patients}/${patientId}`);
  }

  // Busca paciente por id e normaliza campos snake/camel.
  // Aceita resposta com wrapper `patient` ou objeto plano.
  getById(patientId: number): Observable<Patient> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.patients}/${patientId}`).pipe(
      map((response) => {
        // Handle both snake_case and camelCase responses from API
        const data: Record<string, unknown> = (response['patient'] as Record<string, unknown>) ?? response;
        return this.normalizePatient(data);
      })
    );
  }

  // Lista pacientes aplicando filtro opcional de sede.
  // Normaliza cada item para o modelo interno.
  getAll(): Observable<Patient[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<PatientsResponse | Patient[]>(apiUrls.patients, { params }).pipe(
      map((response) => {
        const patients = Array.isArray(response) ? response : response.patients ?? [];
        return patients.map((data) => this.normalizePatient(data as Record<string, unknown>));
      })
    );
  }

  // Recupera apenas ids e nomes de pacientes.
  // Suporta resposta como array simples ou objeto com `patients`.
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

  // Converte payloads diversos em `Patient` consistente.
  // Ajusta números e alias para campos usados na aplicação.
  private normalizePatient(data: Record<string, unknown>): Patient {
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
      headquarterId: (data['headquarter_id'] ?? data['headquarterId']) as number | undefined,
      headquarterName: (data['headquarter_name'] ?? data['headquarterName']) as string | undefined,
      cpf: (data['cpf'] as string) ?? undefined,
      rg: (data['rg'] as string) ?? undefined,
      customValue: (data['custom_value'] ?? data['customValue']) as number | undefined,
      observation: (data['observation'] as string) ?? undefined
    };
  }
}
