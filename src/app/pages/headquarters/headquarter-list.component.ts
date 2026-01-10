import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { PhoneMaskPipe } from '../../shared/pipes/phone-mask.pipe';
import { HeadquarterSelectionService } from '../../shared/services/headquarter-selection.service';
import { Headquarter, HeadquarterCreatePayload, HeadquarterService } from '../../shared/services/headquarter.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationHelperService } from '../../shared/services/notification-helper.service';
import { UserService } from '../../shared/services/user.service';

type HeadquarterFormModel = {
  name: string;
  rent: string;
  address: string;
  phone: string;
  observation: string;
};

const emptyHeadquarterModel: HeadquarterFormModel = {
  name: '',
  rent: '',
  address: '',
  phone: '',
  observation: ''
};

@Component({
  selector: 'app-headquarter-list',
  imports: [RouterLink, Field, CurrencyBrlPipe, PhoneMaskPipe],
  templateUrl: './headquarter-list.component.html',
  styleUrl: './headquarter-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadquarterListComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private headquarterService = inject(HeadquarterService);
  private headquarterSelection = inject(HeadquarterSelectionService);
  private userService = inject(UserService);
  private router = inject(Router);

  headquarters = signal<Headquarter[]>([]);
  headquarterModel = signal<HeadquarterFormModel>({ ...emptyHeadquarterModel });
  showCreateForm = signal(false);
  submitted = signal(false);

  readonly canManageHeadquarters = computed(
    () => this.userService.isAdmin() || this.userService.isManager()
  );

  headquarterForm = form(this.headquarterModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome e obrigatorio' });
  });

  ngOnInit(): void {
    if (!this.canManageHeadquarters()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadHeadquarters();
  }

  toggleCreateForm(): void {
    const willOpen = !this.showCreateForm();
    this.showCreateForm.set(willOpen);
    if (!willOpen) {
      this.resetForm();
    }
  }

  onPhoneInput(event: Event): void {
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
    this.headquarterModel.update((model) => ({ ...model, phone: masked }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    if (this.headquarterForm.name().invalid()) {
      return;
    }

    const model = this.headquarterModel();
    const payload: HeadquarterCreatePayload = {
      name: model.name.trim(),
      rent: model.rent ? this.parseCurrency(model.rent) : undefined,
      address: model.address || undefined,
      phone: model.phone || undefined,
      observation: model.observation || undefined
    };

    this.loadingService.track(this.headquarterService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Sede cadastrada com sucesso.');
        this.resetForm();
        this.showCreateForm.set(false);
        this.loadHeadquarters();
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Nao foi possivel cadastrar a sede.');
      }
    });
  }

  private loadHeadquarters(): void {
    this.loadingService.track(this.headquarterSelection.reload()).subscribe({
      next: (headquarters) => {
        this.headquarters.set(headquarters);
      },
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar as sedes.');
      }
    });
  }

  private parseCurrency(value: string): number {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  private resetForm(): void {
    this.submitted.set(false);
    this.headquarterModel.set({ ...emptyHeadquarterModel });
  }
}
