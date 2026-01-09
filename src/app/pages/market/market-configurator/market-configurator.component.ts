import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type MarketCard = {
  title: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-market-configurator',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './market-configurator.component.html',
  styleUrl: './market-configurator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketConfiguratorComponent {
  cards: MarketCard[] = [
    {
      title: 'Listagem de mercados',
      icon: 'feather icon-list',
      route: '/mercado/list'
    },
    {
      title: 'Visão geral',
      icon: 'feather icon-bar-chart-2',
      route: '/mercado/overview'
    }
  ];
}
