import type { Step } from 'react-joyride';

export const analyticsSteps: Step[] = [
  {
    target: '[data-tour="analytics-header"]',
    title: 'Analytics de Reputação',
    content: 'Acompanhe tendências de reputação, análise por categoria e receba alertas inteligentes. Esta é sua central de inteligência sobre avaliações.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-source-filter"]',
    title: 'Filtro por Plataforma',
    content: 'Filtre os dados por plataforma: Booking.com, Google ou TripAdvisor. Assim você identifica diferenças de reputação entre os canais.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-alerts"]',
    title: 'Alertas de Categoria',
    content: 'Receba alertas quando alguma categoria apresentar queda significativa. Disponível a partir do plano Insight.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-ai-summary"]',
    title: 'Análise com IA',
    content: 'Nossa IA analisa todas as avaliações e gera um resumo com pontos fortes, pontos fracos e insights de tendência. Use para entender rapidamente o que os hóspedes pensam.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-competitor-bar"]',
    title: 'Comparativo com Concorrentes',
    content: 'Ative o modo de comparação para ver seus dados lado a lado com os concorrentes. Filtre por concorrentes específicos para uma análise mais detalhada.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-timeline"]',
    title: 'Linha do Tempo',
    content: 'Visualize a evolução da sua nota média ao longo do tempo. Escolha entre 7, 30 ou 90 dias para identificar tendências de curto e longo prazo.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics-categories"]',
    title: 'Pontuação por Categoria',
    content: 'Veja a nota média por categoria nos últimos 30 dias. Clique em uma categoria para ver o gráfico de evolução.',
    placement: 'top',
  },
];
