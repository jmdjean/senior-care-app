import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  @Output() menuToggle = new EventEmitter<void>();

  readonly currentUser = this.userService.user;

  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Painel';
    return `${user.name} - ${this.userService.getRoleLabel(user.role)}`;
  });

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
