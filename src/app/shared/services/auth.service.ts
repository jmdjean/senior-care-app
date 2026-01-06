import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { apiUrls } from '../urls';
import { NotificationHelperService } from './notification-helper.service';

type LoginResponse = {
  userId?: number | string;
  id?: number | string;
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

  constructor(
    private http: HttpClient,
    private notificationHelper: NotificationHelperService
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(apiUrls.login, { email, password })
      .pipe(
        tap({
          next: (response) => {
            const userId = response?.userId ?? response?.id;
            if (userId !== undefined && userId !== null) {
              this.setUserId(String(userId));
            }
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
}
