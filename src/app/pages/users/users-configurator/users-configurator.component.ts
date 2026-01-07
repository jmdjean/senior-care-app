import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ConfigCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-users-configurator',
  templateUrl: './users-configurator.component.html',
  styleUrl: './users-configurator.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersConfiguratorComponent {
  cards: ConfigCard[] = [
    {
      title: 'Cadastro de usuário',
      icon: 'feather icon-user-plus',
      route: '/users/new'
    },
    {
      title: 'Usuários',
      icon: 'feather icon-users',
      route: '/users/list'
    }
  ];
}
