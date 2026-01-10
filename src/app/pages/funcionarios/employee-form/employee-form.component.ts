import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CpfMaskPipe } from '../../../shared/pipes/cpf-mask.pipe';
import { PhoneMaskPipe } from '../../../shared/pipes/phone-mask.pipe';
import { Employee, EmployeeCreatePayload, EmployeeService, EmployeeType } from '../../../shared/services/employee.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';

type EmployeeFormModel = Omit<Employee, 'id' | 'headquarterName'>;

@Component({
  selector: 'app-employee-form',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, CpfMaskPipe, PhoneMaskPipe],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private headquarterSelection = inject(HeadquarterSelectionService);

  employeeForm = this.fb.group({
    type: ['Enfermeiro', Validators.required],
    name: ['', Validators.required],
    cpf: ['', [Validators.required, Validators.maxLength(11)]],
    fullName: ['', Validators.required],
    sex: ['Homem', Validators.required],
    address: ['', Validators.required],
    entryDate: ['', Validators.required],
    phone: ['', [Validators.required, Validators.maxLength(11)]],
    emergencyContact: ['', [Validators.required, Validators.maxLength(11)]],
    weeklyHours: ['', [Validators.required, Validators.pattern(/^[0-9]{2}:[0-5][0-9]$/)]],
    salary: [0, Validators.required],
    salaryWithTaxes: [0, Validators.required],
    headquarterId: this.fb.control<number | null>(null, Validators.required)
  });

  readonly employeeTypes: EmployeeType[] = ['Enfermeiro', 'Faxineiro', 'Segurança', 'Cozinheiro'];
  readonly sexes = ['Homem', 'Mulher'];
  readonly headquarters = this.headquarterSelection.headquarters;

  isEdit = false;
  employeeId?: number;

  ngOnInit(): void {
    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      next: () => {
        const headquarterId = this.headquarterSelection.selectedHeadquarterId();
        if (headquarterId !== null) {
          this.employeeForm.get('headquarterId')?.setValue(headquarterId);
        }
        this.checkIfEdit();
      },
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  private checkIfEdit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true;
      this.employeeId = +id;
      this.loadingService.track(this.employeeService.getById(+id)).subscribe({
        next: (employee) => {
          this.employeeForm.patchValue({
            ...employee,
            entryDate: this.toInputDate(employee.entryDate),
            headquarterId: employee.headquarterId ?? this.headquarterSelection.selectedHeadquarterId()
          });
        },
        error: () => {
          this.notificationHelper.showError('Erro ao carregar funcionário.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.notificationHelper.showError('Preencha todos os campos obrigatórios.');
      return;
    }

    const formValue = this.employeeForm.value as EmployeeFormModel;
    const payload: EmployeeCreatePayload = {
      type: formValue.type!,
      name: formValue.name!,
      cpf: formValue.cpf!,
      fullName: formValue.fullName!,
      sex: formValue.sex as 'Homem' | 'Mulher',
      address: formValue.address!,
      entryDate: formValue.entryDate!,
      phone: formValue.phone!,
      emergencyContact: formValue.emergencyContact!,
      weeklyHours: formValue.weeklyHours!,
      salary: formValue.salary!,
      salaryWithTaxes: formValue.salaryWithTaxes!,
      headquarterId: formValue.headquarterId!
    };

    const request = this.isEdit
      ? this.employeeService.update(this.employeeId!, payload)
      : this.employeeService.create(payload);

    this.loadingService.track(request).subscribe({
      next: () => {
        this.notificationHelper.showSuccess(
          this.isEdit ? 'Funcionário atualizado com sucesso.' : 'Funcionário criado com sucesso.'
        );
        this.router.navigate(['/funcionarios/list']);
      },
      error: () => {
        this.notificationHelper.showError(
          this.isEdit ? 'Erro ao atualizar funcionário.' : 'Erro ao criar funcionário.'
        );
      }
    });
  }

  private toInputDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const year = parsed.getFullYear();
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
    const day = parsed.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onWeeklyHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 4);
    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);
    const formatted = hours + (minutes ? `:${minutes}` : '');
    input.value = formatted;
    this.employeeForm.get('weeklyHours')?.setValue(formatted, { emitEvent: false });
  }
}
