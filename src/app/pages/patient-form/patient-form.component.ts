import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CpfMaskPipe } from '../../shared/pipes/cpf-mask.pipe';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { PhoneMaskPipe } from '../../shared/pipes/phone-mask.pipe';
import { RgMaskPipe } from '../../shared/pipes/rg-mask.pipe';
import { Disease, DiseaseService } from '../../shared/services/disease.service';
import { Headquarter, HeadquarterService } from '../../shared/services/headquarter.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { Patient, PatientCreatePayload, PatientService } from '../../shared/services/patient.service';
import { Plan, PlansService } from '../../shared/services/plans.service';
import { UserService } from '../../shared/services/user.service';

type PatientFormModel = Omit<Patient, 'diseases' | 'id' | 'planId' | 'createdAt' | 'customValue' | 'observation' | 'cpf' | 'rg' | 'headquarterId' | 'headquarterName'> & {
  planId: string;
  headquarterId: string;
  headquarterName: string;
  diseases: number[];
  cpf: string;
  rg: string;
  customValue: string;
  observation: string;
};

const emptyPatientModel: PatientFormModel = {
  name: '',
  birthday: '',
  closerContact: '',
  sex: '',
  heightCm: '',
  weightKg: '',
  planId: '',
  headquarterId: '',
  headquarterName: '',
  planName: '',
  diseases: [],
  cpf: '',
  rg: '',
  customValue: '',
  observation: ''
};

@Component({
  selector: 'app-patient-form',
  imports: [RouterLink, Field, MatFormFieldModule, MatSelectModule, DatePipe, PhoneMaskPipe, CpfMaskPipe, RgMaskPipe, CurrencyBrlPipe],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss'
})
export class PatientFormComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);
  private diseaseService = inject(DiseaseService);
  private plansService = inject(PlansService);
  private headquarterService = inject(HeadquarterService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private editingPatientId: number | null = null;
  private pendingDiseaseNames: string[] | null = null;

  submitted = signal(false);
  diseases = signal<Disease[]>([]);
  plans = signal<Plan[]>([]);
  headquarters = signal<Headquarter[]>([]);
  patientModel = signal<PatientFormModel>({ ...emptyPatientModel });
  isEdit = signal(false);
  isViewMode = signal(false);
  isManager = this.userService.isManager;
  disableHeadquarterSelect = computed(() => this.isEdit() && this.isManager());
  formTitle = computed(() => {
    if (this.isViewMode()) {
      return 'Visualizar paciente';
    }
    return this.isEdit() ? 'Paciente' : 'Novo paciente';
  });

  patientForm = form(this.patientModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome é obrigatório' });
    required(schemaPath.birthday, { message: 'Data de nascimento é obrigatória' });
    required(schemaPath.closerContact, { message: 'Contato é obrigatório' });
    required(schemaPath.sex, { message: 'Sexo é obrigatório' });
    required(schemaPath.planId, { message: 'Plano é obrigatório' });
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const viewParam = this.route.snapshot.queryParamMap.get('view');
    
    if (viewParam === 'true') {
      this.isViewMode.set(true);
    }
    
    if (idParam) {
      const parsedId = Number(idParam);
      if (!Number.isNaN(parsedId)) {
        this.editingPatientId = parsedId;
        this.isEdit.set(true);
      }
    }

    this.loadDiseases();
    this.loadPlans();
    this.loadHeadquarters();

    if (this.editingPatientId !== null) {
      this.loadPatient(this.editingPatientId);
    }
  }

  private loadDiseases(): void {
    this.loadingService.track(this.diseaseService.getAll()).subscribe({
      next: (diseases) => {
        const safeDiseases = Array.isArray(diseases)
          ? diseases
          : Array.isArray((diseases as { diseases?: Disease[] } | null)?.diseases)
            ? (diseases as { diseases: Disease[] }).diseases
            : [];
        this.diseases.set(safeDiseases);

        if (this.pendingDiseaseNames && this.pendingDiseaseNames.length > 0) {
          const mappedIds = this.mapDiseaseNamesToIds(this.pendingDiseaseNames);
          this.patientModel.update((model) => ({ ...model, diseases: mappedIds }));
          this.pendingDiseaseNames = null;
        }
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar as doenças.');
      }
    });
  }

  private loadPlans(): void {
    this.loadingService.track(this.plansService.getAll()).subscribe({
      next: (plans) => {
        const safePlans = Array.isArray(plans)
          ? plans
          : Array.isArray((plans as { plans?: Plan[] } | null)?.plans)
            ? (plans as { plans: Plan[] }).plans
            : [];
        this.plans.set(safePlans);
      },
      error: () => {
        this.notificationHelper.showError('Não foi possível carregar os planos.');
      }
    });
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

  private loadPatient(patientId: number): void {
    this.loadingService.track(this.patientService.getById(patientId)).subscribe({
      next: (patient) => {
        const diseaseIds = Array.isArray(patient.diseaseIds)
          ? patient.diseaseIds
          : this.mapDiseaseNamesToIds(patient.diseases ?? []);

        if (!Array.isArray(patient.diseaseIds) && (patient.diseases ?? []).length > 0) {
          this.pendingDiseaseNames = patient.diseases ?? [];
        }

        const heightValue = patient.height ?? patient.heightCm ?? '';
        const weightValue = patient.weight ?? patient.weightKg ?? '';

        this.patientModel.set({
          ...emptyPatientModel,
          name: patient.name ?? '',
          birthday: patient.birthday ?? '',
          closerContact: patient.closerContact ?? '',
            sex: patient.sex ?? '',
            heightCm: heightValue === null ? '' : String(heightValue),
            weightKg: weightValue === null ? '' : String(weightValue),
            planId: patient.planId ? String(patient.planId) : '',
            headquarterId: patient.headquarterId ? String(patient.headquarterId) : '',
            headquarterName: patient.headquarterName ?? '',
            planName: patient.planName ?? '',
            diseases: diseaseIds,
            cpf: patient.cpf ?? '',
            rg: patient.rg ?? '',
            customValue: patient.customValue ? String(patient.customValue) : '',
          observation: patient.observation ?? ''
        });
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Não foi possível carregar o paciente.');
      }
    });
  }

  private mapDiseaseNamesToIds(diseaseNames: string[]): number[] {
    if (!Array.isArray(diseaseNames) || diseaseNames.length === 0) {
      return [];
    }

    const diseaseMap = new Map(
      this.diseases().map((disease) => [disease.name.toLowerCase(), disease.id])
    );

    return diseaseNames
      .map((name) => diseaseMap.get(name.toLowerCase()))
      .filter((value): value is number => typeof value === 'number');
  }

  onContactInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 0) {
      const ddd = digits.slice(0, 2);
      const rest = digits.slice(2);
      if (rest.length > 5) {
        masked = `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
      } else if (rest.length > 0) {
        masked = `(${ddd}) ${rest}`;
      } else {
        masked = `(${ddd}`;
      }
    }
    target.value = masked;
    this.patientModel.update((model) => ({ ...model, closerContact: masked }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    if (
      this.patientForm.name().invalid() ||
      this.patientForm.birthday().invalid() ||
      this.patientForm.closerContact().invalid() ||
      this.patientForm.sex().invalid() ||
      this.patientForm.planId().invalid()
    ) {
      return;
    }

    const model = this.patientModel();
    
    // Validação de CPF
    const cpfDigits = model.cpf.replace(/\D/g, '');
    if (cpfDigits && cpfDigits.length !== 11) {
      this.notificationHelper.showWarning('CPF inválido. Deve conter 11 dígitos.');
      return;
    }
    
    // Validação de RG
    const rgDigits = model.rg.replace(/\D/g, '');
    if (rgDigits && (rgDigits.length < 8 || rgDigits.length > 9)) {
      this.notificationHelper.showWarning('RG inválido. Deve conter 8 ou 9 dígitos.');
      return;
    }

    const payload: PatientCreatePayload = {
      name: model.name,
      birthday: model.birthday,
      closerContact: model.closerContact,
      sex: model.sex,
      height: Number(model.heightCm) || 0,
      weight: Number(model.weightKg) || 0,
      planId: Number(model.planId) || 0,
      diseaseIds: model.diseases,
      headquarterId: model.headquarterId ? Number(model.headquarterId) : undefined,
      cpf: cpfDigits || undefined,
      rg: rgDigits || undefined,
      customValue: model.customValue ? this.parseCurrency(model.customValue) : undefined,
      observation: model.observation || undefined
    };

    const request$ =
      this.editingPatientId !== null
        ? this.patientService.update(this.editingPatientId, payload)
        : this.patientService.create(payload);
    const successMessage =
      this.editingPatientId !== null
        ? 'Paciente atualizado com sucesso.'
        : 'Paciente cadastrado com sucesso.';
    const errorMessage =
      this.editingPatientId !== null
        ? 'Não foi possível atualizar o paciente.'
        : 'Não foi possível cadastrar o paciente.';

    this.loadingService.track(request$).subscribe({
      next: () => {
        this.notificationHelper.showSuccess(successMessage);
        this.router.navigate(['/patients']);
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, errorMessage);
      }
    });
  }

  onDiseasesChange(selected: number[]): void {
    this.patientModel.update((model) => ({ ...model, diseases: selected ?? [] }));
  }

  getDiseasesNames(): string {
    const diseasesIds = this.patientModel().diseases;
    if (!diseasesIds || diseasesIds.length === 0) {
      return '';
    }
    const allDiseases = this.diseases();
    return diseasesIds
      .map(id => allDiseases.find(d => d.id === id)?.name)
      .filter((name): name is string => !!name)
      .join(', ');
  }

  onCpfInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    
    if (digits.length > 9) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      masked = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    
    target.value = masked;
    this.patientModel.update((model) => ({ ...model, cpf: masked }));
  }

  onRgInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '').slice(0, 9);
    let masked = digits;
    
    if (digits.length > 6) {
      masked = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}${digits.length > 8 ? '-' + digits.slice(8) : ''}`;
    } else if (digits.length > 5) {
      masked = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    } else if (digits.length > 2) {
      masked = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    
    target.value = masked;
    this.patientModel.update((model) => ({ ...model, rg: masked }));
  }

  onCurrencyInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '');
    
    if (!digits) {
      target.value = '';
      this.patientModel.update((model) => ({ ...model, customValue: '' }));
      return;
    }
    
    const value = parseInt(digits, 10) / 100;
    const masked = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    target.value = masked;
    this.patientModel.update((model) => ({ ...model, customValue: masked }));
  }

  private parseCurrency(value: string): number {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  getHeadquarterName(): string {
    const model = this.patientModel();
    const selectedId = Number(model.headquarterId);
    if (selectedId) {
      const found = this.headquarters().find((hq) => hq.id === selectedId);
      if (found?.name) {
        return found.name;
      }
    }
    return model.headquarterName || '';
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }
}
