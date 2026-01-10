import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { FinancialOverviewService } from '../../../shared/services/financial-overview.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, CurrencyBrlPipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {
  private financialOverviewService = inject(FinancialOverviewService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private headquarterSelection = inject(HeadquarterSelectionService);

  generalBalance = signal<number | null>(null);
  monthlyExpenses = signal<number | null>(null);
  monthlyMarket = signal<number | null>(null);
  employees = signal<number | null>(null);
  rent = signal<number | null>(null);
  patientsTotal = signal<number | null>(null);
  nursesTotal = signal<number | null>(null);
  cleanersTotal = signal<number | null>(null);
  cooksTotal = signal<number | null>(null);
  guardsTotal = signal<number | null>(null);

  private readonly loadOverviewEffect = effect(() => {
    this.loadOverview();
  });

  ngOnInit(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  private loadOverview(): void {
    // Load all in parallel
    this.loadingService.track(this.financialOverviewService.getGeneralBalance()).subscribe({
      next: (res) => this.generalBalance.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar balanço geral.')
    });

    this.loadingService.track(this.financialOverviewService.getMonthlyExpenses()).subscribe({
      next: (res) => this.monthlyExpenses.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar gastos do mês.')
    });

    this.loadingService.track(this.financialOverviewService.getMonthlyMarket()).subscribe({
      next: (res) => this.monthlyMarket.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar mercado do mês.')
    });

    this.loadingService.track(this.financialOverviewService.getEmployees()).subscribe({
      next: (res) => this.employees.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar funcionários.')
    });

    this.loadingService.track(this.financialOverviewService.getRent()).subscribe({
      next: (res) => this.rent.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar aluguel.')
    });

    this.loadingService.track(this.financialOverviewService.getPatientsTotal()).subscribe({
      next: (res) => this.patientsTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de pacientes.')
    });

    this.loadingService.track(this.financialOverviewService.getEmployeesTotalByType('Enfermeiro')).subscribe({
      next: (res) => this.nursesTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de Enfermeiros.')
    });

    this.loadingService.track(this.financialOverviewService.getEmployeesTotalByType('Faxineiro')).subscribe({
      next: (res) => this.cleanersTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de Faxineiros.')
    });

    this.loadingService.track(this.financialOverviewService.getEmployeesTotalByType('Cozinheiros')).subscribe({
      next: (res) => this.cooksTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de Cozinheiros.')
    });

    this.loadingService.track(this.financialOverviewService.getEmployeesTotalByType('Seguranças')).subscribe({
      next: (res) => this.guardsTotal.set(res.value),
      error: () => this.notificationHelper.showError('Erro ao carregar total de Seguranças.')
    });
  }
}
