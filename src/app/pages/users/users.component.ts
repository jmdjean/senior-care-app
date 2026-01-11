import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { User, UserCreatePayload, UserRole, UserService } from '../../shared/services/user.service';

type UserFormModel = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

const emptyUserModel: UserFormModel = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Nurse'
};

@Component({
  selector: 'app-users',
  imports: [RouterLink, FormsModule, NgClass, MatDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);

  users = signal<User[]>([]);
  userModel = signal<UserFormModel>({ ...emptyUserModel });
  submitted = signal(false);
  isEditing = signal(false);
  editingUserId = signal<number | null>(null);

  roles: { value: UserRole; label: string }[] = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'Manager', label: 'Gerente' },
    { value: 'Nurse', label: 'Enfermeiro(a)' }
  ];

  ngOnInit(): void {
    this.inicializarLista();
  }

  // Prepara a tela inicial carregando a lista de usuários existentes.
  // Centraliza a orquestração para manter o ngOnInit enxuto e reutilizável.
  private inicializarLista(): void {
    this.loadUsers();
  }

  // Busca todos os usuários e atualiza o estado reativo da listagem.
  // Exibe mensagem de erro amigável caso a consulta falhe.
  private loadUsers(): void {
    this.loadingService.track(this.userService.getAll()).subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os usuários.');
      }
    });
  }

  // Valida o formulário, decide entre criar ou atualizar e dispara a ação correspondente.
  // Garante mensagens claras para campos obrigatórios e confirmação de senha.
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

  // Cria um novo usuário com os dados informados e recarrega a lista após sucesso.
  // Exibe erros detalhados retornados pelo backend em caso de falha.
  private createUser(): void {
    const model = this.userModel();
    const payload: UserCreatePayload = {
      name: model.name,
      email: model.email,
      password: model.password,
      confirmPassword: model.confirmPassword,
      role: model.role
    };

    this.loadingService.track(this.userService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Usuário criado com sucesso.');
        this.resetForm();
        this.loadUsers();
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível criar o usuário.');
      }
    });
  }

  // Atualiza usuário existente preservando id em edição e campos alterados.
  // Suporta atualização opcional de senha quando fornecida.
  private updateUser(): void {
    const userId = this.editingUserId();
    if (!userId) return;

    const model = this.userModel();
    const payload: Partial<UserCreatePayload> = {
      name: model.name,
      email: model.email,
      role: model.role
    };

    if (model.password) {
      payload.password = model.password;
      payload.confirmPassword = model.confirmPassword;
    }

    this.loadingService.track(this.userService.update(userId, payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Usuário atualizado com sucesso.');
        this.resetForm();
        this.loadUsers();
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível atualizar o usuário.');
      }
    });
  }

  // Preenche o formulário com dados do usuário selecionado para edição e ativa modo de edição.
  // Zera campos sensíveis como senha para evitar reuso acidental.
  editUser(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user.id);
    this.userModel.set({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role
    });
  }

  // Pede confirmação e, ao confirmar, remove o usuário e atualiza a lista.
  // Reporta mensagens de sucesso ou erro conforme resposta do backend.
  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir usuário',
        message: `Deseja excluir o usuário ${user.name}?`,
        actionButtonText: 'Excluir'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.loadingService.track(this.userService.delete(user.id)).subscribe({
        next: () => {
          this.notificationHelper.showSuccess('Usuário excluído com sucesso.');
          this.loadUsers();
        },
        error: (error) => {
          this.notificationHelper.showBackendError(error, 'Não foi possível excluir o usuário.');
        }
      });
    });
  }

  // Restaura o formulário ao estado inicial e desativa modo de edição.
  // Útil após criar/atualizar ou ao cancelar a operação.
  resetForm(): void {
    this.userModel.set({ ...emptyUserModel });
    this.submitted.set(false);
    this.isEditing.set(false);
    this.editingUserId.set(null);
  }

  // Atualiza campo específico do modelo a partir de eventos de input/select.
  // Mantém o estado reativo sincronizado com o formulário manual.
  updateField(field: keyof UserFormModel, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.userModel.update((model) => ({ ...model, [field]: target.value }));
  }

  // Retorna a classe CSS de badge de acordo com o papel do usuário.
  // Usa a lógica centralizada no serviço para manter consistência.
  getRoleBadgeClass(role: UserRole): string {
    return this.userService.getRoleBadgeClass(role);
  }

  // Fornece o rótulo amigável do papel do usuário para exibição.
  // Mantém o mapeamento centralizado no serviço de usuários.
  getRoleLabel(role: UserRole): string {
    return this.userService.getRoleLabel(role);
  }
}
