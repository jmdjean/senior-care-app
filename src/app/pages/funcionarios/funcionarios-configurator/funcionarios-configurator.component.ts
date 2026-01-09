import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';

type EmployeeCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-funcionarios-configurator',
  templateUrl: './funcionarios-configurator.component.html',
  styleUrl: './funcionarios-configurator.component.scss',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuncionariosConfiguratorComponent {
  private userService = inject(UserService);

  private allCards: EmployeeCard[] = [
    {
      title: 'Funcionários',
      icon: 'feather icon-users',
      route: '/funcionarios/list'
    }
  ];

  cards = computed(() => (this.userService.isAdmin() || this.userService.isManager() ? this.allCards : []));
}
