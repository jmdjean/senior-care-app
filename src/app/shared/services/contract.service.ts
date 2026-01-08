import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Contract = {
  id: number;
  patientId: number;
  patientName: string;
  contractDate: string;
  fileUrl?: string;
};

export type ContractCreatePayload = {
  patientId: number;
  contractDate: string;
  file: File;
};

type ContractsResponse = {
  contracts: Contract[];
};

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(private http: HttpClient) {}

  create(contract: ContractCreatePayload): Observable<Contract> {
    const formData = new FormData();
    formData.append('patientId', contract.patientId.toString());
    formData.append('contractDate', contract.contractDate);
    formData.append('file', contract.file);

    return this.http.post<Contract>(apiUrls.contracts, formData);
  }

  update(contractId: number, contract: ContractCreatePayload): Observable<Contract> {
    const formData = new FormData();
    formData.append('patientId', contract.patientId.toString());
    formData.append('contractDate', contract.contractDate);
    formData.append('file', contract.file);

    return this.http.put<Contract>(`${apiUrls.contracts}/${contractId}`, formData);
  }

  delete(contractId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.contracts}/${contractId}`);
  }

  getById(contractId: number): Observable<Contract> {
    return this.http.get<Contract>(`${apiUrls.contracts}/${contractId}`);
  }

  getAll(): Observable<Contract[]> {
    return this.http.get<ContractsResponse>(apiUrls.contracts).pipe(
      map((response) => response.contracts ?? [])
    );
  }
}
