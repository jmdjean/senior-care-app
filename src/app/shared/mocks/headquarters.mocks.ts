import type { Headquarter } from '../services/headquarter.service';

export const headquarterMock: Headquarter[] = [
  {
    id: 1,
    name: 'A1',
    rent: 12000,
    address: 'Rua Alfa, 100',
    phone: '(11) 90000-0001',
    observation: 'Sede principal'
  },
  {
    id: 2,
    name: 'B2',
    rent: 9000,
    address: 'Avenida Beta, 200',
    phone: '(11) 90000-0002',
    observation: 'Sede secundária'
  }
];
