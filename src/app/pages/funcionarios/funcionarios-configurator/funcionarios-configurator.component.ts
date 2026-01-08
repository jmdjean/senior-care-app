import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

type EmployeeCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-funcionarios-configurator',
  templateUrl: './funcionarios-configurator.component.html',
  styleUrl: './funcionarios-configurator.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuncionariosConfiguratorComponent {
  private userService = inject(UserService);

  private allCards: EmployeeCard[] = [
    {
      title: 'Cadastro',
      icon: 'feather icon-user-plus',
      route: '/funcionarios/new'
    },
    {
      title: 'Funcionários',
      icon: 'feather icon-users',
      route: '/funcionarios/list'
    }
  ];

  cards = computed(() => {
    // Admin can see all, Manager can see list
    if (this.userService.isAdmin()) {
      return this.allCards;
    } else if (this.userService.isManager()) {
      return this.allCards.filter(card => card.title !== 'Cadastro');
    }
    return [];
  });
}
