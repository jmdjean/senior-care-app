import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { Employee, EmployeeService, EmployeeType } from '../../../shared/services/employee.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink, DatePipe, NgClass, MatDialogModule, FormsModule, CurrencyBrlPipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private employeeService = inject(EmployeeService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private router = inject(Router);

  employees = signal<Employee[]>([]);
  openMenuId = signal<number | null>(null);
  searchTerm = signal('');
  selectedType = signal<EmployeeType | ''>('');

  readonly employeeTypes: EmployeeType[] = ['Enfermeiro', 'Faxineiro', 'Seguranças', 'Cozinheiros'];
  readonly canManageEmployees = this.userService.isAdmin;
  readonly canViewEmployees = this.userService.isAdmin || this.userService.isManager;

  filteredEmployees = computed(() => {
    let filtered = this.employees();

    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(term) ||
        employee.type.toLowerCase().includes(term)
      );
    }

    const type = this.selectedType();
    if (type) {
      filtered = filtered.filter(employee => employee.type === type);
    }

    return filtered;
  });

  ngOnInit(): void {
    if (!this.canViewEmployees()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.loadingService.track(this.employeeService.getAll()).subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os funcionários.');
      }
    });
  }

  toggleMenu(employeeId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === employeeId ? null : employeeId);
  }

  editEmployee(employee: Employee): void {
    if (!this.canManageEmployees()) return;
    this.router.navigate(['/funcionarios', employee.id]);
  }

  deleteEmployee(employee: Employee): void {
    if (!this.canManageEmployees()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Funcionário',
        message: `Tem certeza que deseja excluir ${employee.name}?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.track(this.employeeService.delete(employee.id)).subscribe({
          next: () => {
            this.notificationHelper.showSuccess('Funcionário excluído com sucesso.');
            this.loadEmployees();
          },
          error: () => {
            this.notificationHelper.showError('Erro ao excluir funcionário.');
          }
        });
      }
    });
  }

  getTypeBadgeClass(type: EmployeeType): string {
    switch (type) {
      case 'Enfermeiro': return 'badge-primary';
      case 'Faxineiro': return 'badge-secondary';
      case 'Seguranças': return 'badge-warning';
      case 'Cozinheiros': return 'badge-success';
      default: return 'badge-light';
    }
  }
}
