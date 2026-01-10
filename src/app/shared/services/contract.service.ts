import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type Contract = {
  id: number;
  patientId: number;
  patientName: string;
  contractDate: string;
  headquarterId?: number;
  headquarterName?: string;
  planId?: number;
  planName?: string;
  value?: number;
  fileUrl?: string;
};

export type ContractCreatePayload = {
  patientId: number;
  contractDate: string;
  file: File;
  headquarterId?: number;
  planId?: number;
  value?: number;
};

export type ContractUpdatePayload = {
  patientId: number;
  contractDate: string;
  file?: File;
  headquarterId?: number;
  planId?: number;
  value?: number;
};

type ContractsResponse = {
  contracts: Contract[];
};

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  create(contract: ContractCreatePayload): Observable<Contract> {
    const formData = new FormData();
    formData.append('patientId', contract.patientId.toString());
    formData.append('contractDate', contract.contractDate);
    if (contract.headquarterId) {
      formData.append('headquarterId', contract.headquarterId.toString());
    }
    if (contract.planId) {
      formData.append('planId', contract.planId.toString());
    }
    if (typeof contract.value === 'number') {
      formData.append('value', contract.value.toString());
    }
    formData.append('file', contract.file);

    return this.http.post<Contract>(apiUrls.contracts, formData);
  }

  update(contractId: number, contract: ContractUpdatePayload): Observable<Contract> {
    const formData = new FormData();
    formData.append('patientId', contract.patientId.toString());
    formData.append('contractDate', contract.contractDate);
    if (contract.headquarterId) {
      formData.append('headquarterId', contract.headquarterId.toString());
    }
    if (contract.planId) {
      formData.append('planId', contract.planId.toString());
    }
    if (typeof contract.value === 'number') {
      formData.append('value', contract.value.toString());
    }
    if (contract.file) {
      formData.append('file', contract.file);
    }

    return this.http.put<Contract>(`${apiUrls.contracts}/${contractId}`, formData);
  }

  delete(contractId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.contracts}/${contractId}`);
  }

  getById(contractId: number): Observable<Contract> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.contracts}/${contractId}`).pipe(
      map((response) => {
        const data: Record<string, unknown> = (response['contract'] as Record<string, unknown>) ?? response;
        return this.normalizeContract(data);
      })
    );
  }

  getAll(): Observable<Contract[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<ContractsResponse | Contract[]>(apiUrls.contracts, { params }).pipe(
      map((response) => {
        const contracts = Array.isArray(response) ? response : response.contracts ?? [];
        return contracts.map((data) => this.normalizeContract(data as Record<string, unknown>));
      })
    );
  }

  private normalizeContract(data: Record<string, unknown>): Contract {
    return {
      id: (data['id'] as number) ?? 0,
      patientId: (data['patient_id'] ?? data['patientId'] ?? 0) as number,
      patientName: (data['patient_name'] ?? data['patientName'] ?? '') as string,
      contractDate: (data['contract_date'] ?? data['contractDate'] ?? '') as string,
      headquarterId: (data['headquarter_id'] ?? data['headquarterId']) as number | undefined,
      headquarterName: (data['headquarter_name'] ?? data['headquarterName']) as string | undefined,
      planId: (data['plan_id'] ?? data['planId']) as number | undefined,
      planName: (data['plan_name'] ?? data['planName']) as string | undefined,
      value: (typeof data['value'] === 'number' ? data['value'] : Number(data['value'])) || undefined,
      fileUrl: (data['file_url'] ?? data['fileUrl']) as string | undefined
    };
  }
}
