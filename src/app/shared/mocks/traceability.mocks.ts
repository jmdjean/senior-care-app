const now = new Date();
const toIso = (d: Date) => d.toISOString();

const cloneAndOffset = (days: number, hours: number, minutes: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return toIso(date);
};

export const traceabilityMock = [
  {
    id: 1,
    dataHoraAcao: cloneAndOffset(0, 0, 15),
    nomeUsuario: 'Jay Silva',
    sede: 'A1',
    acao: 'Cadastro de paciente',
    requisicao: {
      nome: 'Maria Oliveira',
      email: 'maria@seniorscare.test',
      plano: 'Gold',
      headquarterId: 1
    }
  },
  {
    id: 2,
    dataHoraAcao: cloneAndOffset(0, 2, 30),
    nomeUsuario: 'Ana Souza',
    sede: 'B2',
    acao: 'Edição de mercado',
    requisicao: {
      marketId: 9,
      itens: [
        { nome: 'Arroz', quantidade: 10 },
        { nome: 'Feijao', quantidade: 6 }
      ]
    }
  },
  {
    id: 3,
    dataHoraAcao: cloneAndOffset(1, 1, 5),
    nomeUsuario: 'Carlos Mendes',
    sede: 'A1',
    acao: 'Cadastro de funcionário',
    requisicao: {
      nome: 'Lucia Santos',
      funcao: 'Enfermeira',
      salario: 4800
    }
  },
  {
    id: 4,
    dataHoraAcao: cloneAndOffset(2, 3, 20),
    nomeUsuario: 'Jay Silva',
    sede: 'B2',
    acao: 'Edição de paciente',
    requisicao: {
      id: 35,
      alteracoes: {
        plano: 'Plus',
        telefone: '(11) 98888-7777'
      }
    }
  }
];
