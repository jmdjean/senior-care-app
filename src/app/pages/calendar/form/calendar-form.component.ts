import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CalendarPayload, CalendarService, CalendarType } from '../../../shared/services/calendar.service';
import { HeadquarterSelectionService } from '../../../shared/services/headquarter-selection.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationHelperService } from '../../../shared/services/notification-helper.service';
import { UserService } from '../../../shared/services/user.service';

type CalendarFormModel = {
  type: CalendarType;
  name: string;
  phone: string;
  date: string;
  time: string;
  allDay: boolean;
  headquarterId: string;
  observation: string;
};

const emptyCalendarModel: CalendarFormModel = {
  type: 'Visita',
  name: '',
  phone: '',
  date: '',
  time: '',
  allDay: false,
  headquarterId: '',
  observation: ''
};

@Component({
  selector: 'app-calendar-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calendar-form.component.html',
  styleUrl: './calendar-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarFormComponent implements OnInit {
  @Input() inModal = false;
  @Input() initialData?: Partial<CalendarPayload & { id?: number }>;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private calendarService = inject(CalendarService);
  private headquarterSelection = inject(HeadquarterSelectionService);
  private loadingService = inject(LoadingService);
  private notificationHelper = inject(NotificationHelperService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private editingId: number | null = null;

  submitted = signal(false);
  calendarModel = signal<CalendarFormModel>({ ...emptyCalendarModel });
  activeTab = signal<CalendarType>('Visita');
  readonly minDate = new Date().toISOString().slice(0, 10);

  readonly headquarters = this.headquarterSelection.headquarters;
  readonly canManageCalendar = computed(() => this.userService.isAdmin() || this.userService.isManager());
  readonly isEdit = computed(() => this.editingId !== null);
  readonly pageTitle = computed(() => (this.isEdit() ? 'Editar registro' : 'Novo registro'));

  calendarForm = form(this.calendarModel, (schemaPath) => {
    required(schemaPath.type, { message: 'Tipo e obrigatorio' });
    required(schemaPath.headquarterId, { message: 'Sede e obrigatoria' });
  });

  ngOnInit(): void {
    if (!this.canManageCalendar()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadingService.track(this.headquarterSelection.ensureLoaded()).subscribe({
      next: () => this.initializeForm(),
      error: () => {
        this.notificationHelper.showError('Nao foi possivel carregar sedes.');
      }
    });
  }

  changeTab(type: CalendarType): void {
    this.activeTab.set(type);
    this.calendarModel.update((model) => ({ ...model, type }));
  }

  onAllDayToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    const allDay = target.checked;
    this.calendarModel.update((model) => {
      const nextDate = allDay && !model.date ? new Date().toISOString().slice(0, 10) : model.date;
      return { ...model, allDay, time: allDay ? '' : model.time, date: nextDate };
    });
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
    this.calendarModel.update((model) => ({ ...model, phone: masked }));
  }

  onNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.calendarModel.update((model) => ({ ...model, name: target.value }));
  }

  onHeadquarterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.calendarModel.update((model) => ({ ...model, headquarterId: target.value }));
  }

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.calendarModel.update((model) => ({ ...model, date: target.value }));
  }

  onTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.calendarModel.update((model) => ({ ...model, time: target.value }));
  }

  onObservationInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    this.calendarModel.update((model) => ({ ...model, observation: value }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    if (this.calendarForm.headquarterId().invalid()) {
      return;
    }

    const current = this.calendarModel();

    if (current.date && current.date < this.minDate) {
      this.notificationHelper.showError('A data deve ser hoje ou futura.');
      return;
    }

    const payload: CalendarPayload = {
      type: this.activeTab(),
      date: current.date,
      time: current.allDay ? null : current.time || null,
      allDay: current.allDay,
      name: current.name || undefined,
      phone: current.phone || undefined,
      headquarterId: Number(current.headquarterId),
      observation: current.observation || undefined
    };

    const onSuccess = this.inModal ? () => this.saved.emit() : undefined;
    const navigateOnSuccess = !this.inModal;

    if (this.isEdit()) {
      this.updateEntry(payload, { navigateOnSuccess, onSuccess });
    } else {
      this.createEntry(payload, { navigateOnSuccess, onSuccess });
    }
  }

  private initializeForm(): void {
    const selectedHeadquarter = this.headquarterSelection.selectedHeadquarter();

    if (this.inModal) {
      const initial = this.initialData ?? {};
      const derivedHeadquarterId = initial.headquarterId ?? selectedHeadquarter?.id;
      const initialType = initial.type ?? 'Visita';
      const timeForInput = initial.time ? initial.time.slice(0, 5) : '';
      this.editingId = initial.id ?? null;
      this.activeTab.set(initialType);
      this.calendarModel.set({
        ...emptyCalendarModel,
        type: initialType,
        name: initial.name ?? '',
        phone: initial.phone ?? '',
        date: initial.date ?? '',
        time: initial.allDay ? '' : timeForInput,
        allDay: initial.allDay ?? false,
        headquarterId: derivedHeadquarterId ? String(derivedHeadquarterId) : '',
        observation: initial.observation ?? ''
      });
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!Number.isNaN(parsedId)) {
        this.editingId = parsedId;
        this.loadEntry(parsedId);
        return;
      }
    }

    this.calendarModel.set({
      ...emptyCalendarModel,
      headquarterId: selectedHeadquarter?.id ? String(selectedHeadquarter.id) : ''
    });
  }

  private loadEntry(id: number): void {
    this.loadingService.track(this.calendarService.getById(id)).subscribe({
      next: (entry) => {
        const timeForInput = entry.time ? entry.time.slice(0, 5) : '';
        this.activeTab.set(entry.type);
        this.calendarModel.set({
          type: entry.type,
          name: entry.name ?? '',
          phone: entry.phone ?? '',
          date: entry.date ?? '',
          time: entry.allDay ? '' : timeForInput,
          allDay: entry.allDay,
          headquarterId: entry.headquarterId ? String(entry.headquarterId) : '',
          observation: entry.observation ?? ''
        });
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Nao foi possivel carregar o registro.');
        this.router.navigate(['/calendario']);
      }
    });
  }

  private createEntry(
    payload: CalendarPayload,
    options?: { navigateOnSuccess?: boolean; onSuccess?: () => void }
  ): void {
    const navigate = options?.navigateOnSuccess ?? !this.inModal;

    this.loadingService.track(this.calendarService.create(payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Registro criado com sucesso.');
        options?.onSuccess?.();
        if (navigate) {
          this.router.navigate(['/calendario']);
        }
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Nao foi possivel criar o registro.');
      }
    });
  }

  private updateEntry(
    payload: CalendarPayload,
    options?: { navigateOnSuccess?: boolean; onSuccess?: () => void }
  ): void {
    if (this.editingId === null) return;

    const navigate = options?.navigateOnSuccess ?? !this.inModal;

    this.loadingService.track(this.calendarService.update(this.editingId, payload)).subscribe({
      next: () => {
        this.notificationHelper.showSuccess('Registro atualizado com sucesso.');
        options?.onSuccess?.();
        if (navigate) {
          this.router.navigate(['/calendario']);
        }
      },
      error: (error) => {
        this.notificationHelper.showBackendError(error, 'Nao foi possivel atualizar o registro.');
      }
    });
  }

  onCancel(): void {
    if (this.inModal) {
      this.closed.emit();
    } else {
      this.router.navigate(['/calendario']);
    }
  }
}
