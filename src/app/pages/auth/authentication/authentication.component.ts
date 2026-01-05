import { ChangeDetectorRef, Component, inject, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';
import { AuthService } from '../../../shared/services/auth.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-authentication',
  imports: [CommonModule, RouterModule, Field],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);

  loginModel = signal<{ email: string; password: string }>({
    email: '',
    password: ''
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'E-mail é obrigatório' });
    email(schemaPath.email, { message: 'Informe um endereço de e-mail válido' });
    required(schemaPath.password, { message: 'Senha é obrigatória' });
    minLength(schemaPath.password, 8, { message: 'A senha deve ter pelo menos 8 caracteres' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();

    this.submitted.set(true);
    this.error.set('');

    if (this.loginForm.email().invalid() || this.loginForm.password().errors().length > 0) {
      this.cd.detectChanges();
      return;
    }

    const credentials = this.loginModel();
    this.loadingService.track(this.authService.login(credentials.email, credentials.password)).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.cd.detectChanges();
      },
      error: () => {
        this.error.set('E-mail ou senha inválidos');
        this.notificationHelper.showError('E-mail ou senha inválidos.');
        this.cd.detectChanges();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}
