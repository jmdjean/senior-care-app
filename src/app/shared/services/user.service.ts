import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type UserRole = 'Admin' | 'Manager' | 'Nurse';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  headquarterId?: number;
  headquarterName?: string;
  createdAt?: string;
};

export type UserCreatePayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  headquarterId?: number;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  headquarterId?: number;
  headquarterName?: string;
};

type UsersResponse = {
  users: User[];
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private headquarterSelection = inject(HeadquarterSelectionService);

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

    if (user.role !== 'Admin' && user.headquarterId) {
      this.headquarterSelection.setSelectedHeadquarter(user.headquarterId);
    }
  }

  loadUserFromStorage(): void {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as CurrentUser;
        this.currentUser.set(user);
        if (user.role !== 'Admin' && user.headquarterId) {
          this.headquarterSelection.setSelectedHeadquarter(user.headquarterId);
        }
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
    const params = this.headquarterSelection.buildParams();
    return this.http.get<UsersResponse | User[]>(apiUrls.users, { params }).pipe(
      map((response) => {
        const users = Array.isArray(response) ? response : response.users ?? [];
        return users.map((user) => this.normalizeUser(user as Record<string, unknown>));
      })
    );
  }

  getById(userId: number): Observable<User> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.users}/${userId}`).pipe(
      map((user) => this.normalizeUser(user))
    );
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

  private normalizeUser(data: Record<string, unknown>): User {
    return {
      id: (data['id'] as number) ?? 0,
      name: (data['name'] as string) ?? '',
      email: (data['email'] as string) ?? '',
      role: (data['role'] as UserRole) ?? 'Nurse',
      headquarterId: (data['headquarter_id'] ?? data['headquarterId']) as number | undefined,
      headquarterName: (data['headquarter_name'] ?? data['headquarterName']) as string | undefined,
      createdAt: (data['created_at'] ?? data['createdAt']) as string | undefined
    };
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
