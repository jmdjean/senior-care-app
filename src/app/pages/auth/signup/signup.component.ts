import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { email, Field, form, minLength, required } from '@angular/forms/signals';
import { AuthService } from '../../../shared/services/auth.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterModule, Field],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  standalone: true
})
export class SignupComponent {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  signupModel = signal<{ name: string; email: string; password: string; confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome é obrigatório' });
    required(schemaPath.email, { message: 'E-mail é obrigatório' });
    email(schemaPath.email, { message: 'Informe um endereço de e-mail válido' });
    required(schemaPath.password, { message: 'Senha é obrigatória' });
    minLength(schemaPath.password, 8, { message: 'A senha deve ter pelo menos 8 caracteres' });
    required(schemaPath.confirmPassword, { message: 'Confirmação de senha é obrigatória' });
    minLength(schemaPath.confirmPassword, 8, {
      message: 'A confirmação de senha deve ter pelo menos 8 caracteres'
    });
  });

  onSubmit(event: Event): void {
    this.submitted.set(true);
    this.error.set('');
    event.preventDefault();

    if (
      this.signupForm.name().invalid() ||
      this.signupForm.email().invalid() ||
      this.signupForm.password().errors().length > 0 ||
      this.signupForm.confirmPassword().errors().length > 0
    ) {
      this.cd.detectChanges();
      return;
    }

    const { password, confirmPassword } = this.signupModel();
    if (password !== confirmPassword) {
      this.error.set('As senhas não coincidem');
      this.notificationHelper.showWarning('As senhas não coincidem.');
      this.cd.detectChanges();
      return;
    }

    const payload = this.signupModel();
    this.loadingService.track(this.authService.createUser(payload)).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.cd.detectChanges();
      },
      error: () => {
        this.error.set('Não foi possível criar a conta');
        this.notificationHelper.showError('Não foi possível criar a conta.');
        this.cd.detectChanges();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
