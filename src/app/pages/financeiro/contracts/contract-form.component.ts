import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { ContractCreatePayload, ContractService, ContractUpdatePayload } from '../../../shared/services/contract.service';
import { Headquarter, HeadquarterService } from '../../../shared/services/headquarter.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { PatientName, PatientService } from '../../../shared/services/patient.service';
import { Plan, PlansService } from '../../../shared/services/plans.service';

@Component({
  selector: 'app-contract-form',
  imports: [RouterLink, FormsModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, CurrencyBrlPipe],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  private contractService = inject(ContractService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);
  private headquarterService = inject(HeadquarterService);
  private plansService = inject(PlansService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patients = signal<PatientName[]>([]);
  headquarters = signal<Headquarter[]>([]);
  plans = signal<Plan[]>([]);
  selectedPatientId = signal('');
  selectedHeadquarterId = signal('');
  selectedPlanId = signal('');
  contractValue = signal('');
  selectedFile = signal<File | null>(null);
  contractDate = signal('');
  searchTerm = signal('');
  isEdit = signal(false);
  contractId = signal<number | null>(null);

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.patients();
    }
    return this.patients().filter((patient) =>
      patient.name.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.resetForm();
    this.loadPatients();
    this.loadHeadquarters();
    this.loadPlans();
    this.checkIfEdit();
  }

  private checkIfEdit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.contractId.set(+id);
      this.loadingService.track(this.contractService.getById(+id)).subscribe({
        next: (contract) => {
          const patientId = contract.patientId ? contract.patientId.toString() : '';
          const dateOnly = contract.contractDate ? contract.contractDate.split('T')[0] : '';
          this.selectedPatientId.set(patientId);
          this.contractDate.set(dateOnly);
          this.selectedHeadquarterId.set(contract.headquarterId ? contract.headquarterId.toString() : '');
          this.selectedPlanId.set(contract.planId ? contract.planId.toString() : '');
          this.contractValue.set(
            contract.value !== undefined && contract.value !== null
              ? contract.value.toString()
              : ''
          );
        },
        error: () => {
          this.notificationHelper.showError('Erro ao carregar contrato.');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (!this.selectedPatientId() || !this.contractDate() || (!this.selectedFile() && !this.isEdit())) {
      this.notificationHelper.showError('Preencha todos os campos obrigatórios.');
      return;
    }

    const parsedValue = this.contractValue() ? this.parseCurrency(this.contractValue()) : undefined;

    const payload: ContractCreatePayload | ContractUpdatePayload = {
      patientId: +this.selectedPatientId(),
      contractDate: this.contractDate(),
      headquarterId: this.selectedHeadquarterId() ? Number(this.selectedHeadquarterId()) : undefined,
      planId: this.selectedPlanId() ? Number(this.selectedPlanId()) : undefined,
      value: parsedValue,
      ...(this.isEdit() ? {} : { file: this.selectedFile()! })
    };

    const request = this.isEdit()
      ? this.contractService.update(this.contractId()!, payload as ContractUpdatePayload)
      : this.contractService.create(payload as ContractCreatePayload);

    this.loadingService.track(request).subscribe({
      next: () => {
        this.notificationHelper.showSuccess(
          this.isEdit() ? 'Contrato atualizado com sucesso.' : 'Contrato criado com sucesso.'
        );
        this.router.navigate(['/financeiro/contracts']);
      },
      error: () => {
        this.notificationHelper.showError(
          this.isEdit() ? 'Erro ao atualizar contrato.' : 'Erro ao criar contrato.'
        );
      }
    });
  }

  private resetForm(): void {
    this.selectedPatientId.set('');
    this.selectedHeadquarterId.set('');
    this.selectedPlanId.set('');
    this.contractValue.set('');
    this.selectedFile.set(null);
    this.contractDate.set('');
    this.searchTerm.set('');
  }

  private loadPatients(): void {
    this.loadingService.track(this.patientService.getNames()).subscribe({
      next: (patients) => {
        const list = Array.isArray(patients)
          ? patients
          : Array.isArray((patients as { patients?: PatientName[] } | null)?.patients)
            ? (patients as { patients: PatientName[] }).patients
            : [];
        this.patients.set(list);
      },
      error: () => {
        this.notificationHelper.showError('Erro ao carregar pacientes.');
      }
    });
  }

  private loadHeadquarters(): void {
    this.loadingService.track(this.headquarterService.getAll()).subscribe({
      next: (headquarters) => {
        const list = Array.isArray(headquarters) ? headquarters : [];
        this.headquarters.set(list);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar as sedes.');
      }
    });
  }

  private loadPlans(): void {
    this.loadingService.track(this.plansService.getAll()).subscribe({
      next: (plans) => {
        const list = Array.isArray(plans)
          ? plans
          : Array.isArray((plans as { plans?: Plan[] } | null)?.plans)
            ? (plans as { plans: Plan[] }).plans
            : [];
        this.plans.set(list);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os planos.');
      }
    });
  }

  private parseCurrency(value: string): number {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
}
