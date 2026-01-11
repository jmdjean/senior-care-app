// Employee List Component - Updated
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Employee, EmployeeService, EmployeeType } from '../../../shared/services/employee.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
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
  private headquarterSelection = inject(HeadquarterSelectionService);

  employees = signal<Employee[]>([]);
  openMenuId = signal<number | null>(null);
  searchTerm = signal('');
  selectedType = signal<EmployeeType | ''>('');

  private readonly loadEmployeesEffect = effect(() => {
    this.loadEmployees();
  });

  readonly employeeTypes: EmployeeType[] = ['Enfermeiro', 'Faxineiro', 'Segurança', 'Cozinheiro'];
  readonly canManageEmployees = computed(() => this.userService.isAdmin());
  readonly canViewEmployees = computed(() => this.userService.isAdmin() || this.userService.isManager());

  // Retorna funcionários filtrados por busca e tipo selecionado para exibição na tabela.
  // Aplica filtros dinamicamente sobre o estado reativo da lista completa.
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
    this.inicializarLista();
  }

  // Verifica permissão de visualização e garante sedes carregadas antes de listar funcionários.
  // Redireciona para home se o usuário não puder ver a lista e mostra erro se sedes falharem.
  private inicializarLista(): void {
    if (!this.canViewEmployees()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  // Alterna o menu de ações do funcionário e impede propagação do clique.
  // Fecha se já estiver aberto para o mesmo id.
  toggleMenu(employeeId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === employeeId ? null : employeeId);
  }

  // Fecha qualquer menu de contexto aberto.
  // Usado antes de navegar ou executar outras ações.
  closeMenu(): void {
    this.openMenuId.set(null);
  }

  // Carrega todos os funcionários e atualiza a lista filtrável.
  // Exibe mensagem de erro caso a requisição falhe.
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

  // Navega para a edição do funcionário selecionado, respeitando permissão de gestão.
  // Usa a rota padrão de funcionários com o id correspondente.
  editEmployee(employee: Employee): void {
    if (!this.canManageEmployees()) return;
    this.router.navigate(['/funcionarios', employee.id]);
  }

  // Abre a visualização do funcionário selecionado, sem restrição de gestão.
  // Mantém consistência de rota reutilizando o id.
  viewEmployee(employee: Employee): void {
    this.router.navigate(['/funcionarios', employee.id]);
  }

  // Define a classe da badge conforme o tipo de funcionário normalizado.
  // Garante cores distintas para cada categoria conhecida.
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
