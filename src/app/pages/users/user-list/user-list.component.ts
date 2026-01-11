import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { User, UserRole, UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, NgClass, MatDialogModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private headquarterSelection = inject(HeadquarterSelectionService);

  users = signal<User[]>([]);
  openMenuId = signal<number | null>(null);

  private readonly loadUsersEffect = effect(() => {
    this.loadUsers();
  });

  ngOnInit(): void {
    this.inicializarCarregamentoDeSedes();
  }

  // Garante que as sedes estejam carregadas antes de listar usuários vinculados.
  // Exibe erro amigável caso a busca falhe, evitando estado inconsistente.
  private inicializarCarregamentoDeSedes(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Carrega todos os usuários e atualiza a listagem reativa.
  // Notifica o usuário se a requisição falhar.
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

  // Alterna o menu de ações de um usuário específico evitando propagação do clique.
  // Fecha o menu se já estiver aberto para o mesmo usuário.
  toggleMenu(userId: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId() === userId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(userId);
    }
  }

  // Fecha qualquer menu de contexto aberto na listagem.
  // Usado antes de navegações ou confirmações.
  closeMenu(): void {
    this.openMenuId.set(null);
  }

  // Navega para a edição do usuário selecionado e fecha o menu.
  // Mantém consistência de rota usando o id do usuário.
  editUser(user: User): void {
    this.closeMenu();
    this.router.navigate(['/users', user.id]);
  }

  // Solicita confirmação e, se aprovado, exclui o usuário e recarrega a lista.
  // Exibe feedback de sucesso ou erro conforme resposta da API.
  confirmDelete(user: User): void {
    this.closeMenu();
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

  // Retorna a classe de badge para exibir o papel do usuário.
  // Centraliza a lógica no serviço para manter o padrão.
  getRoleBadgeClass(role: UserRole): string {
    return this.userService.getRoleBadgeClass(role);
  }

  // Retorna o rótulo amigável do papel do usuário para exibição na lista.
  // Reutiliza mapeamento do serviço de usuários.
  getRoleLabel(role: UserRole): string {
    return this.userService.getRoleLabel(role);
  }
}
