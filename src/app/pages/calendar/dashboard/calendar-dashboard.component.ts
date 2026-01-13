import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-calendar-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar-dashboard.component.html',
  styleUrl: './calendar-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly canManageCalendar = this.userService.isAdmin() || this.userService.isManager();

  ngOnInit(): void {
    if (!this.canManageCalendar) {
      this.router.navigate(['/home']);
    }
  }

  goToRegistros(): void {
    this.router.navigate(['/calendario/registros']);
  }

  goToCompromissos(): void {
    this.router.navigate(['/calendario/compromissos']);
  }
}
