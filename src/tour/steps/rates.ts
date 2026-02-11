import type { Step } from 'react-joyride';

export const ratesSteps: Step[] = [
  {
    target: '[data-tour="rates-header"]',
    title: 'Espião de Tarifas',
    content: 'Esta página compara seus preços com os da concorrência. Use-a diariamente para manter sua precificação competitiva.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-period-selector"]',
    title: 'Selecione o Período',
    content: 'Escolha entre 7, 15 ou 30 dias para ajustar a janela de análise. Períodos mais curtos mostram tendências recentes; mais longos revelam padrões sazonais.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-summary"]',
    title: 'Cartões de Resumo',
    content: 'Sua tarifa média, a dos concorrentes, a diferença percentual e quantos dias você esteve mais barato. Se a diferença é negativa, você está abaixo da média — ótimo para atrair hóspedes!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-evolution-chart"]',
    title: 'Gráfico de Evolução',
    content: 'Visualize como sua tarifa se comporta ao longo do tempo comparada aos concorrentes. Cruzamentos das linhas indicam momentos em que você ficou mais caro ou mais barato.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="rates-position-chart"]',
    title: 'Distribuição de Posicionamento',
    content: 'Este gráfico de rosca mostra em quantos dias você esteve mais barato (verde), na média (amarelo) ou mais caro (vermelho). O ideal é maximizar o verde.',
    placement: 'left',
  },
  {
    target: '[data-tour="rates-today-prices"]',
    title: 'Preços de Hoje',
    content: 'Compare sua tarifa de hoje com cada concorrente individualmente. Os badges coloridos indicam a diferença percentual em relação a cada um.',
    placement: 'top',
  },
  {
    target: '[data-tour="rates-table"]',
    title: 'Tabela Detalhada',
    content: 'Consulte o histórico dia a dia com preços do seu hotel e de cada concorrente. A coluna "Posição" resume seu posicionamento diário.',
    placement: 'top',
  },
];
