import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Field, form, required } from '@angular/forms/signals';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { Plan, PlansService } from '../../shared/services/plans.service';
import { Disease, DiseaseService } from '../../shared/services/disease.service';
import { Patient, PatientService } from '../../shared/services/patient.service';

type PatientFormModel = Omit<Patient, 'diseases' | 'id' | 'planId' | 'createdAt'> & {
  planId: string;
  diseases: string[];
};

const emptyPatientModel: PatientFormModel = {
  name: '',
  birthday: '',
  closerContact: '',
  sex: '',
  heightCm: '',
  weightKg: '',
  planId: '',
  planName: '',
  diseases: []
};

@Component({
  selector: 'app-patient-form',
  imports: [RouterLink, Field],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
  standalone: true
})
export class PatientFormComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private patientService = inject(PatientService);
  private diseaseService = inject(DiseaseService);
  private plansService = inject(PlansService);
  private router = inject(Router);

  submitted = signal(false);
  diseases = signal<Disease[]>([]);
  plans = signal<Plan[]>([]);
  patientModel = signal<PatientFormModel>({ ...emptyPatientModel });

  patientForm = form(this.patientModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome e obrigatorio' });
    required(schemaPath.birthday, { message: 'Data de nascimento e obrigatoria' });
    required(schemaPath.closerContact, { message: 'Contato e obrigatorio' });
    required(schemaPath.sex, { message: 'Sexo e obrigatorio' });
    required(schemaPath.planId, { message: 'Plano e obrigatorio' });
  });

  ngOnInit(): void {
    this.loadDiseases();
    this.loadPlans();
  }

  private loadDiseases(): void {
    this.loadingService.track(this.diseaseService.getAll()).subscribe({
      next: (diseases) => {
        this.diseases.set(diseases ?? []);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar as doencas.');
      }
    });
  }

  private loadPlans(): void {
    this.loadingService.track(this.plansService.getAll()).subscribe({
      next: (plans) => {
        this.plans.set(plans ?? []);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar os planos.');
      }
    });
  }

  onContactInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '');
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
    const selectedPlan = this.plans().find((plan) => String(plan.id) === model.planId);
    const payload: Patient = {
      ...model,
      id: 0,
      createdAt: '',
      planId: Number(model.planId) || 0,
      planName: selectedPlan?.name ?? model.planName,
      diseases: model.diseases
    };

    this.loadingService.track(this.patientService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Paciente cadastrado com sucesso.');
        this.router.navigate(['/patients']);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel cadastrar o paciente.');
      }
    });
  }

  onDiseasesChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selected = Array.from(target.selectedOptions).map((option) => option.value);
    this.patientModel.update((model) => ({ ...model, diseases: selected }));
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }
}
