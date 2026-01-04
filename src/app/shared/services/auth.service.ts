import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { apiUrls } from '../urls';
import { NotificationHelperService } from './notification-helper.service';

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
  constructor(
    private http: HttpClient,
    private notificationHelper: NotificationHelperService
  ) {}

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>(apiUrls.login, { email, password })
      .pipe(
        tap({
          next: () => this.notificationHelper.showSuccess('Login realizado com sucesso.'),
          error: () => this.notificationHelper.showError('E-mail ou senha inválidos.')
        })
      );
  }

  createUser(payload: SignupPayload): Observable<void> {
    return this.http.post<void>(apiUrls.user, payload).pipe(
      tap({
        next: () => this.notificationHelper.showSuccess('Conta criada com sucesso.'),
        error: () => this.notificationHelper.showError('Não foi possível criar a conta.')
      })
    );
  }

  logout(): void {
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
