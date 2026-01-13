import type { CalendarAvailabilitySlot, CalendarEntry } from '../services/calendar.service';

const formatDateFromToday = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calendarMockEntries: CalendarEntry[] = [
  {
    id: 1,
    type: 'Visita',
    date: formatDateFromToday(1),
    time: '09:00',
    allDay: false,
    name: 'Maria Oliveira',
    phone: '(11) 99876-5432',
    headquarterId: 1,
    headquarterName: 'A1',
    observation: 'Avaliacao inicial'
  },
  {
    id: 2,
    type: 'Visita',
    date: formatDateFromToday(2),
    time: '11:15',
    allDay: false,
    name: 'Carlos Mendes',
    phone: '(11) 93456-7890',
    headquarterId: 1,
    headquarterName: 'A1',
    observation: 'Retorno de acompanhamento'
  },
  {
    id: 3,
    type: 'Visita',
    date: formatDateFromToday(3),
    time: '14:45',
    allDay: false,
    name: 'Ana Souza',
    phone: '(11) 92345-6789',
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Checagem de sinais'
  },
  {
    id: 4,
    type: 'Visita',
    date: formatDateFromToday(4),
    time: '16:00',
    allDay: false,
    name: 'Bruno Lima',
    phone: '(11) 95678-1234',
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Visita de rotina'
  },
  {
    id: 5,
    type: 'Visita',
    date: formatDateFromToday(5),
    time: '10:30',
    allDay: false,
    name: 'Patricia Gomes',
    phone: '(11) 94567-8901',
    headquarterId: 1,
    headquarterName: 'A1',
    observation: 'Ajuste de medicacao'
  },
  {
    id: 6,
    type: 'Horario fechado',
    date: formatDateFromToday(1),
    time: null,
    allDay: true,
    name: 'Equipe em treinamento',
    phone: undefined,
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Equipe focada em treinamento interno'
  },
  {
    id: 7,
    type: 'Horario fechado',
    date: formatDateFromToday(2),
    time: null,
    allDay: true,
    name: 'Manutencao programada',
    phone: undefined,
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Sala indisponivel'
  },
  {
    id: 8,
    type: 'Horario fechado',
    date: formatDateFromToday(3),
    time: '08:00',
    allDay: false,
    name: 'Reuniao equipe medica',
    phone: undefined,
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Planejamento semanal'
  },
  {
    id: 9,
    type: 'Horario fechado',
    date: formatDateFromToday(4),
    time: '13:00',
    allDay: false,
    name: 'Auditoria interna',
    phone: undefined,
    headquarterId: 1,
    headquarterName: 'A1',
    observation: 'Verificacao de processos'
  },
  {
    id: 10,
    type: 'Horario fechado',
    date: formatDateFromToday(5),
    time: null,
    allDay: true,
    name: 'Bloqueio administrativo',
    phone: undefined,
    headquarterId: 2,
    headquarterName: 'B2',
    observation: 'Ponto facultativo'
  }
];

export const calendarMockAvailability: CalendarAvailabilitySlot[] = [
  { date: formatDateFromToday(1), time: '14:00' },
  { date: formatDateFromToday(2), time: '17:30' },
  { date: formatDateFromToday(3), time: '10:30' },
  { date: formatDateFromToday(4), time: '08:30' },
  { date: formatDateFromToday(5), time: '16:00' }
];
