import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type UserRole = 'Admin' | 'Manager' | 'Nurse';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type UserCreatePayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

type UsersResponse = {
  users: User[];
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private currentUser = signal<CurrentUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  readonly isManager = computed(() => this.currentUser()?.role === 'Manager');
  readonly isNurse = computed(() => this.currentUser()?.role === 'Nurse');

  readonly canManagePatients = computed(() => this.isAdmin());
  readonly canSendExams = computed(() => this.isAdmin() || this.isManager());
  readonly canSendPrescriptions = computed(() => this.isAdmin() || this.isManager());
  readonly canGenerateReport = computed(() => this.isAdmin() || this.isManager() || this.isNurse());
  readonly canViewPatients = computed(() => this.currentUser() !== null);
  readonly canManageUsers = computed(() => this.isAdmin());
  readonly canViewExams = computed(() => this.isAdmin() || this.isManager() || this.isNurse());
  readonly canViewPrescriptions = computed(() => this.isAdmin() || this.isManager() || this.isNurse());
  readonly canImportFiles = computed(() => this.isAdmin() || this.isManager());

  setCurrentUser(user: CurrentUser): void {
    this.currentUser.set(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadUserFromStorage(): void {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as CurrentUser;
        this.currentUser.set(user);
      } catch {
        this.clearCurrentUser();
      }
    }
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem('currentUser');
  }

  getAll(): Observable<User[]> {
    return this.http.get<UsersResponse>(apiUrls.users).pipe(
      map((response) => response.users ?? [])
    );
  }

  getById(userId: number): Observable<User> {
    return this.http.get<User>(`${apiUrls.users}/${userId}`);
  }

  create(payload: UserCreatePayload): Observable<User> {
    return this.http.post<User>(apiUrls.user, payload);
  }

  update(userId: number, payload: Partial<UserCreatePayload>): Observable<User> {
    return this.http.put<User>(`${apiUrls.users}/${userId}`, payload);
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.users}/${userId}`);
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'Admin':
        return 'badge-admin';
      case 'Manager':
        return 'badge-manager';
      case 'Nurse':
        return 'badge-nurse';
      default:
        return '';
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'Admin':
        return 'Administrador';
      case 'Manager':
        return 'Gerente';
      case 'Nurse':
        return 'Enfermeiro(a)';
      default:
        return role;
    }
  }
}
