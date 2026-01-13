const now = new Date();
const toIso = (d: Date) => d.toISOString();

const cloneAndOffset = (days: number, hours: number, minutes: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return toIso(date);
};

export const errorLogsMock = [
  {
    id: 1,
    dataHoraTransacao: cloneAndOffset(0, 0, 10),
    urlRequisicao: 'https://api.local/patients/123',
    corpoRequisicao: { nome: 'Maria Souza', plano: 'Gold' },
    erro: 'Falha ao salvar paciente: timeout',
    statusRequisicao: 504,
    metodo: 'POST'
  },
  {
    id: 2,
    dataHoraTransacao: cloneAndOffset(0, 2, 20),
    urlRequisicao: 'https://api.local/market/itens',
    corpoRequisicao: { itens: [{ nome: 'Arroz', quantidade: 5 }] },
    erro: 'Permissão negada',
    statusRequisicao: 403,
    metodo: 'PUT'
  },
  {
    id: 3,
    dataHoraTransacao: cloneAndOffset(1, 1, 5),
    urlRequisicao: 'https://api.local/users/5',
    corpoRequisicao: null,
    erro: 'Usuário não encontrado',
    statusRequisicao: 404,
    metodo: 'GET'
  },
  {
    id: 4,
    dataHoraTransacao: cloneAndOffset(3, 4, 45),
    urlRequisicao: 'https://api.local/contracts/87',
    corpoRequisicao: { valor: 1200 },
    erro: 'Erro interno do servidor',
    statusRequisicao: 500,
    metodo: 'PATCH'
  }
];
