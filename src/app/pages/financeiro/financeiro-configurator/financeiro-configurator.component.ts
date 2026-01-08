import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

type FinancialCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-financeiro-configurator',
  templateUrl: './financeiro-configurator.component.html',
  styleUrl: './financeiro-configurator.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceiroConfiguratorComponent {
  private userService = inject(UserService);

  private allCards: FinancialCard[] = [
    {
      title: 'Contratos',
      icon: 'feather icon-file-text',
      route: '/financeiro/contracts'
    },
    {
      title: 'Aluguel',
      icon: 'feather icon-home',
      route: '/financeiro/rent'
    },
    {
      title: 'Mercado',
      icon: 'feather icon-shopping-cart',
      route: '/financeiro/market'
    },
    {
      title: 'Visão Geral',
      icon: 'feather icon-bar-chart-2',
      route: '/financeiro/overview'
    }
  ];

  cards = computed(() => {
    // All cards visible for admin and manager
    return this.allCards;
  });
}
