import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type EmployeeType = 'Enfermeiro' | 'Faxineiro' | 'Seguranças' | 'Cozinheiros';

export type Employee = {
  id: number;
  type: EmployeeType;
  name: string;
  cpf: string;
  fullName: string;
  sex: 'Homem' | 'Mulher';
  address: string;
  entryDate: string;
  phone: string;
  emergencyContact: string;
  weeklyHours: string;
  salary: number;
  salaryWithTaxes: number;
};

export type EmployeeCreatePayload = Omit<Employee, 'id'>;

type EmployeesResponse = {
  employees: Employee[];
};

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  create(employee: EmployeeCreatePayload): Observable<Employee> {
    return this.http.post<Employee>(apiUrls.employees, employee);
  }

  update(employeeId: number, employee: EmployeeCreatePayload): Observable<Employee> {
    return this.http.put<Employee>(`${apiUrls.employees}/${employeeId}`, employee);
  }

  delete(employeeId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.employees}/${employeeId}`);
  }

  getById(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(`${apiUrls.employees}/${employeeId}`);
  }

  getAll(): Observable<Employee[]> {
    return this.http.get<EmployeesResponse>(apiUrls.employees).pipe(
      map((response) => response.employees ?? [])
    );
  }
}
