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

  // Define o usuário atual na sessão e persiste no sessionStorage.
  // Ajusta sede selecionada para perfis não admin com sede vinculada.
  setCurrentUser(user: CurrentUser): void {
    this.currentUser.set(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    if (user.role !== 'Admin' && user.headquarterId) {
      this.headquarterSelection.setSelectedHeadquarter(user.headquarterId);
    }
  }

  // Restaura o usuário atual a partir do sessionStorage, se existir.
  // Se houver dados inválidos, limpa o estado para evitar erros.
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

  // Limpa o usuário atual e remove o registro persistido.
  // Use em logout ou quando os dados salvos estiverem corrompidos.
  clearCurrentUser(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem('currentUser');
  }

  // Busca todos os usuários respeitando filtro de sede selecionada.
  // Normaliza resposta para formato consistente na aplicação.
  getAll(): Observable<User[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<UsersResponse | User[]>(apiUrls.users, { params }).pipe(
      map((response) => {
        const users = Array.isArray(response) ? response : response.users ?? [];
        return users.map((user) => this.normalizeUser(user as Record<string, unknown>));
      })
    );
  }

  // Recupera usuário específico por id e normaliza o resultado.
  // Útil para formulários de edição ou detalhes.
  getById(userId: number): Observable<User> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.users}/${userId}`).pipe(
      map((user) => this.normalizeUser(user))
    );
  }

  // Cria um novo usuário via API com payload tipado.
  // Retorna o usuário criado para uso imediato.
  create(payload: UserCreatePayload): Observable<User> {
    return this.http.post<User>(apiUrls.user, payload);
  }

  // Atualiza dados de um usuário existente com campos parciais.
  // Retorna o usuário atualizado vindo do backend.
  update(userId: number, payload: Partial<UserCreatePayload>): Observable<User> {
    return this.http.put<User>(`${apiUrls.users}/${userId}`, payload);
  }

  // Remove um usuário pelo id informado.
  // Não retorna corpo; use para recarregar listas após sucesso.
  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.users}/${userId}`);
  }

  // Converte resposta da API para o modelo User usado na aplicação.
  // Aceita tanto snake_case quanto camelCase vindos do backend.
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

  // Retorna a classe CSS de badge para um papel de usuário.
  // Mantém mapeamento centralizado para uso em listas e detalhes.
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

  // Retorna rótulo amigável do papel do usuário para exibição.
  // Garante consistência de textos em toda a aplicação.
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
