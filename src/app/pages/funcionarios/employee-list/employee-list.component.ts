// Employee List Component - Updated
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Employee, EmployeeService, EmployeeType } from '../../../shared/services/employee.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private employeeService = inject(EmployeeService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private router = inject(Router);

  employees = signal<Employee[]>([]);
  openMenuId = signal<number | null>(null);
  searchTerm = signal('');
  selectedType = signal<EmployeeType | ''>('');

  readonly employeeTypes: EmployeeType[] = ['Enfermeiro', 'Faxineiro', 'Segurança', 'Cozinheiro'];
  readonly canManageEmployees = computed(() => this.userService.isAdmin());
  readonly canViewEmployees = computed(() => this.userService.isAdmin() || this.userService.isManager());

  get filteredEmployees() {
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
  }

  ngOnInit(): void {
    if (!this.canViewEmployees()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadEmployees();
  }

  toggleMenu(employeeId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === employeeId ? null : employeeId);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
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

  editEmployee(employee: Employee): void {
    if (!this.canManageEmployees()) return;
    this.router.navigate(['/funcionarios', employee.id]);
  }

  viewEmployee(employee: Employee): void {
    this.router.navigate(['/funcionarios', employee.id]);
  }

  getTypeBadgeClass(type: EmployeeType): string {
    const normalized = (type || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalized.includes('enferm')) return 'badge-primary';
    if (normalized.includes('faxin')) return 'badge-secondary';
    if (normalized.includes('segur')) return 'badge-info';
    if (normalized.includes('cozin')) return 'badge-success';
    return 'badge-light';
  }
}
