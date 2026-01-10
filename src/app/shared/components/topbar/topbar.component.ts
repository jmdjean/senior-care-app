import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeadquarterSelectionService } from '../../services/headquarter-selection.service';
import { NotificationHelperService } from '../../services/notification-helper.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private headquarterSelection = inject(HeadquarterSelectionService);
  private notificationHelper = inject(NotificationHelperService);
  private router = inject(Router);

  @Output() menuToggle = new EventEmitter<void>();

  readonly currentUser = this.userService.user;
  readonly headquarters = this.headquarterSelection.headquarters;
  readonly selectedHeadquarterId = this.headquarterSelection.selectedHeadquarterId;
  readonly isAdmin = this.userService.isAdmin;

  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Painel';
    return `${user.name} - ${this.userService.getRoleLabel(user.role)}`;
  });

  ngOnInit(): void {
    this.headquarterSelection.ensureLoaded().subscribe({
      error: () => this.notificationHelper.showError('Não foi possível carregar as sedes.')
    });
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onHeadquarterChange(value: string): void {
    if (value === 'all') {
      this.headquarterSelection.setSelectedHeadquarter(null);
      return;
    }
    const parsed = Number.parseInt(value, 10);
    this.headquarterSelection.setSelectedHeadquarter(Number.isFinite(parsed) ? parsed : null);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
