import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type EmployeeType = 'Enfermeiro' | 'Faxineiro' | 'Segurança' | 'Cozinheiro';

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
    return this.http.get<Record<string, unknown>>(`${apiUrls.employees}/${employeeId}`).pipe(
      map((response) => {
        const data: Record<string, unknown> = (response['employee'] as Record<string, unknown>) ?? response;
        const toNumber = (value: unknown) =>
          typeof value === 'string' ? parseFloat(value) : (value as number) ?? 0;
        const weeklyRaw = data['weekly_hours'] ?? data['weeklyHours'];
        const weeklyHours =
          typeof weeklyRaw === 'number'
            ? `${weeklyRaw.toString().padStart(2, '0')}:00`
            : (weeklyRaw as string) ?? '';

        return {
          id: (data['id'] as number) ?? 0,
          type: (data['type'] ?? data['employee_type'] ?? data['employeeType'] ?? '') as EmployeeType,
          name: (data['name'] as string) ?? '',
          cpf: (data['cpf'] as string) ?? '',
          fullName: (data['full_name'] ?? data['fullName'] ?? '') as string,
          sex: ((data['sex'] as string) ?? 'Homem') as 'Homem' | 'Mulher',
          address: (data['address'] as string) ?? '',
          entryDate: (data['entry_date'] ?? data['entryDate'] ?? '') as string,
          phone: (data['phone'] as string) ?? '',
          emergencyContact: (data['emergency_contact'] ?? data['emergencyContact'] ?? '') as string,
          weeklyHours,
          salary: toNumber(data['salary']),
          salaryWithTaxes: toNumber(data['salary_with_taxes'] ?? data['salaryWithTaxes'])
        };
      })
    );
  }

  getAll(): Observable<Employee[]> {
    return this.http.get<EmployeesResponse>(apiUrls.employees).pipe(
      map((response) => response.employees ?? [])
    );
  }
}
