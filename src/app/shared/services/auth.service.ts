import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiUrls } from '../urls';
import { NotificationHelperService } from './notification-helper.service';
import { CurrentUser, UserRole, UserService } from './user.service';

type LoginResponse = {
  userId?: number | string;
  id?: number | string;
  name?: string;
  email?: string;
  role?: UserRole;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    role?: UserRole;
  };
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userIdKey = 'userId';
  private http = inject(HttpClient);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);

  // Efetua login via API, guarda o id do usuário e popula o usuário atual.
  // Exibe mensagens de sucesso ou erro conforme a resposta do backend.
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(apiUrls.login, { email, password })
      .pipe(
        tap({
          next: (response) => {
            const userData = response?.user ?? response;
            const userId = userData?.id ?? response?.userId;
            
            if (userId !== undefined && userId !== null) {
              this.setUserId(String(userId));
            }

            const currentUser: CurrentUser = {
              id: Number(userId) || 0,
              name: userData?.name ?? 'Usuário',
              email: userData?.email ?? email,
              role: userData?.role ?? 'Nurse'
            };
            
            this.userService.setCurrentUser(currentUser);
            this.notificationHelper.showSuccess('Login realizado com sucesso.');
          },
          error: (error) =>
            this.notificationHelper.showBackendError(error, 'E-mail ou senha inválidos.')
        })
      );
  }

  // Cria uma nova conta de usuário usando a API pública.
  // Retorna sucesso ou mostra erro amigável em caso de falha.
  createUser(payload: SignupPayload): Observable<void> {
    return this.http.post<void>(apiUrls.user, payload).pipe(
      tap({
        next: () => this.notificationHelper.showSuccess('Conta criada com sucesso.'),
        error: (error) =>
          this.notificationHelper.showBackendError(error, 'Não foi possível criar a conta.')
      })
    );
  }

  // Recupera o id de usuário armazenado em sessão.
  // Retorna null quando não existe sessão ativa.
  getUserId(): string | null {
    return sessionStorage.getItem(this.userIdKey);
  }

  // Salva o id do usuário logado na sessão atual.
  // Usa sessionStorage para escopo de aba.
  setUserId(userId: string): void {
    sessionStorage.setItem(this.userIdKey, userId);
  }

  // Remove o id do usuário da sessão atual.
  // Limpa somente a chave utilizada pelo serviço.
  clearUserId(): void {
    sessionStorage.removeItem(this.userIdKey);
  }

  // Informa se há um usuário autenticado com id em sessão.
  // Retorna booleano simples para uso em guards.
  isAuthenticated(): boolean {
    return !!this.getUserId();
  }

  // Encerra a sessão local, limpa caches e remove usuário atual.
  // Ideal para logout completo ou timeout de sessão.
  logout(): void {
    this.clearUserId();
    this.userService.clearCurrentUser();
    localStorage.clear();
    sessionStorage.clear();

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  }

  // Inicializa usuário atual lendo dados persistidos na sessão.
  // Deve ser chamado no bootstrap para restaurar contexto de login.
  initializeUser(): void {
    this.userService.loadUserFromStorage();
  }
}

