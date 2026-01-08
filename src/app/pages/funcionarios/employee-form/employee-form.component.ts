import { Component, OnInit, inject, signal } from '@angular/core';
import { Field, form } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CpfMaskPipe } from '../../../shared/pipes/cpf-mask.pipe';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { PhoneMaskPipe } from '../../../shared/pipes/phone-mask.pipe';
import { Employee, EmployeeCreatePayload, EmployeeService, EmployeeType } from '../../../shared/services/employee.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

type EmployeeFormModel = Omit<Employee, 'id'>;

const emptyEmployeeModel: EmployeeFormModel = {
  type: 'Enfermeiro',
  name: '',
  cpf: '',
  fullName: '',
  sex: 'Homem',
  address: '',
  entryDate: '',
  phone: '',
  emergencyContact: '',
  weeklyHours: '',
  salary: 0,
  salaryWithTaxes: 0
};

@Component({
  selector: 'app-employee-form',
  imports: [RouterLink, Field, MatFormFieldModule, MatSelectModule, PhoneMaskPipe, CpfMaskPipe, CurrencyBrlPipe],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private employeeService = inject(EmployeeService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeeForm = form<EmployeeFormModel>(emptyEmployeeModel);
  isEdit = signal(false);
  employeeId = signal<number | null>(null);

  readonly employeeTypes: EmployeeType[] = ['Enfermeiro', 'Faxineiro', 'Seguranças', 'Cozinheiros'];
  readonly sexes = ['Homem', 'Mulher'];
  readonly canEdit = this.userService.isAdmin;

  ngOnInit(): void {
    if (!this.canEdit()) {
      this.router.navigate(['/funcionarios']);
      return;
    }

    this.checkIfEdit();
  }

  private checkIfEdit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.employeeId.set(+id);
      this.loadingService.track(this.employeeService.getById(+id)).subscribe({
        next: (employee) => {
          this.employeeForm.set(employee);
        },
        error: () => {
          this.notificationHelper.showError('Erro ao carregar funcionário.');
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.employeeForm.valid()) {
      this.notificationHelper.showError('Preencha todos os campos obrigatórios.');
      return;
    }

    const payload: EmployeeCreatePayload = this.employeeForm.value();

    const request = this.isEdit()
      ? this.employeeService.update(this.employeeId()!, payload)
      : this.employeeService.create(payload);

    this.loadingService.track(request).subscribe({
      next: () => {
        this.notificationHelper.showSuccess(
          this.isEdit() ? 'Funcionário atualizado com sucesso.' : 'Funcionário criado com sucesso.'
        );
        this.router.navigate(['/funcionarios/list']);
      },
      error: () => {
        this.notificationHelper.showError(
          this.isEdit() ? 'Erro ao atualizar funcionário.' : 'Erro ao criar funcionário.'
        );
      }
    });
  }
}
