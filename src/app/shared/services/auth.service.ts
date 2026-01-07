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

  createUser(payload: SignupPayload): Observable<void> {
    return this.http.post<void>(apiUrls.user, payload).pipe(
      tap({
        next: () => this.notificationHelper.showSuccess('Conta criada com sucesso.'),
        error: (error) =>
          this.notificationHelper.showBackendError(error, 'Não foi possível criar a conta.')
      })
    );
  }

  getUserId(): string | null {
    return sessionStorage.getItem(this.userIdKey);
  }

  setUserId(userId: string): void {
    sessionStorage.setItem(this.userIdKey, userId);
  }

  clearUserId(): void {
    sessionStorage.removeItem(this.userIdKey);
  }

  isAuthenticated(): boolean {
    return !!this.getUserId();
  }

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

  initializeUser(): void {
    this.userService.loadUserFromStorage();
  }
}

