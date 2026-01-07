import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
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

  users = signal<User[]>([]);
  openMenuId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

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

  toggleMenu(userId: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId() === userId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(userId);
    }
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  editUser(user: User): void {
    this.closeMenu();
    this.router.navigate(['/users', user.id]);
  }

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

  getRoleBadgeClass(role: UserRole): string {
    return this.userService.getRoleBadgeClass(role);
  }

  getRoleLabel(role: UserRole): string {
    return this.userService.getRoleLabel(role);
  }
}
