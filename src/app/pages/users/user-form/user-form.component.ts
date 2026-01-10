import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { Headquarter, HeadquarterService } from '../../../shared/services/headquarter.service';
import { UserCreatePayload, UserRole, UserService } from '../../../shared/services/user.service';

type UserFormModel = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  headquarterId: string;
};

const emptyUserModel: UserFormModel = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Nurse',
  headquarterId: ''
};

@Component({
  selector: 'app-user-form',
  imports: [RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private headquarterService = inject(HeadquarterService);

  userModel = signal<UserFormModel>({ ...emptyUserModel });
  submitted = signal(false);
  isEditing = signal(false);
  editingUserId = signal<number | null>(null);
  headquarters = signal<Headquarter[]>([]);

  roles: { value: UserRole; label: string }[] = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'Manager', label: 'Gerente' },
    { value: 'Nurse', label: 'Enfermeiro(a)' }
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!Number.isNaN(parsedId)) {
        this.isEditing.set(true);
        this.editingUserId.set(parsedId);
        this.loadUser(parsedId);
      }
    }

    this.loadHeadquarters();
  }

  private loadUser(userId: number): void {
    this.loadingService.track(this.userService.getById(userId)).subscribe({
      next: (user) => {
        this.userModel.set({
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          role: user.role,
          headquarterId: user.headquarterId ? String(user.headquarterId) : ''
        });
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar o usuário.');
        this.router.navigate(['/users/list']);
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    const model = this.userModel();

    if (!model.name || !model.email || !model.role) {
      this.notificationHelper.showWarning('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.isEditing() && (!model.password || !model.confirmPassword)) {
      this.notificationHelper.showWarning('Preencha a senha.');
      return;
    }

    if (model.password && model.password !== model.confirmPassword) {
      this.notificationHelper.showWarning('As senhas não conferem.');
      return;
    }

    if (this.isEditing() && this.editingUserId()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const model = this.userModel();
    const payload: UserCreatePayload = {
      name: model.name,
      email: model.email,
      password: model.password,
      confirmPassword: model.confirmPassword,
      role: model.role,
      headquarterId: model.headquarterId ? Number(model.headquarterId) : undefined
    };

    this.loadingService.track(this.userService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Usuário criado com sucesso.');
        this.router.navigate(['/users/list']);
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível criar o usuário.');
      }
    });
  }

  private updateUser(): void {
    const userId = this.editingUserId();
    if (!userId) return;

    const model = this.userModel();
    const payload: Partial<UserCreatePayload> = {
      name: model.name,
      email: model.email,
      role: model.role,
      headquarterId: model.headquarterId ? Number(model.headquarterId) : undefined
    };

    if (model.password) {
      payload.password = model.password;
      payload.confirmPassword = model.confirmPassword;
    }

    this.loadingService.track(this.userService.update(userId, payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Usuário atualizado com sucesso.');
        this.router.navigate(['/users/list']);
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível atualizar o usuário.');
      }
    });
  }

  updateField(field: keyof UserFormModel, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.userModel.update((model) => ({ ...model, [field]: target.value }));
  }

  private loadHeadquarters(): void {
    this.loadingService.track(this.headquarterService.getAll()).subscribe({
      next: (headquarters) => {
        this.headquarters.set(headquarters);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar as sedes.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users/list']);
  }
}
