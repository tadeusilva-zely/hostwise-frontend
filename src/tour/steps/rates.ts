import type { Step } from 'react-joyride';

export const ratesSteps: Step[] = [
  {
    target: '[data-tour="rates-header"]',
    title: 'Espiao de Tarifas',
    content: 'Esta pagina compara seus precos com os da concorrencia. Use-a diariamente para manter sua precificacao competitiva.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-period-selector"]',
    title: 'Selecione o Periodo',
    content: 'Escolha entre 7, 15 ou 30 dias para ajustar a janela de analise. Periodos mais curtos mostram tendencias recentes; mais longos revelam padroes sazonais.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-summary"]',
    title: 'Cartoes de Resumo',
    content: 'Sua tarifa media, a dos concorrentes, a diferenca percentual e quantos dias voce esteve mais barato. Se a diferenca e negativa, voce esta abaixo da media — otimo para atrair hospedes!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-evolution-chart"]',
    title: 'Grafico de Evolucao',
    content: 'Visualize como sua tarifa se comporta ao longo do tempo comparada aos concorrentes. Cruzamentos das linhas indicam momentos em que voce ficou mais caro ou mais barato.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-position-chart"]',
    title: 'Distribuicao de Posicionamento',
    content: 'Este grafico de rosca mostra em quantos dias voce esteve mais barato (verde), na media (amarelo) ou mais caro (vermelho). O ideal e maximizar o verde.',
    placement: 'left',
  },
  {
    target: '[data-tour="rates-today-prices"]',
    title: 'Precos de Hoje',
    content: 'Compare sua tarifa de hoje com cada concorrente individualmente. Os badges coloridos indicam a diferenca percentual em relacao a cada um.',
    placement: 'top',
  },
  {
    target: '[data-tour="rates-table"]',
    title: 'Tabela Detalhada',
    content: 'Consulte o historico dia a dia com precos do seu hotel e de cada concorrente. A coluna "Posicao" resume seu posicionamento diario.',
    placement: 'top',
  },
];
