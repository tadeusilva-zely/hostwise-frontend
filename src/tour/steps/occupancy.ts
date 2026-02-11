import type { Step } from 'react-joyride';

export const occupancySteps: Step[] = [
  {
    target: '[data-tour="occupancy-header"]',
    title: 'Sensor de Lotação',
    content: 'Acompanhe a ocupação estimada do seu hotel e compare com os concorrentes. Dados de ocupação ajudam a otimizar sua estratégia de preços.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-summary"]',
    title: 'Indicadores de Ocupação',
    content: 'Sua ocupação média, comparativo com concorrentes, e a diferença entre fins de semana e dias úteis. Diferença grande entre eles indica oportunidades de precificação.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-evolution-chart"]',
    title: 'Evolução da Ocupação',
    content: 'Visualize a tendência de ocupação dos próximos 30 dias. Períodos de queda podem ser oportunidades para campanhas promocionais.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-weekly-chart"]',
    title: 'Comparativo Semanal',
    content: 'Compare sua ocupação semanal com a dos concorrentes. Identifique semanas onde você está abaixo e ajuste sua estratégia.',
    placement: 'right',
  },
  {
    target: '[data-tour="occupancy-highlights"]',
    title: 'Destaques do Período',
    content: 'Identifique rapidamente o dia de maior e menor ocupação. A dica HostWise oferece uma orientação prática baseada nos seus dados.',
    placement: 'left',
  },
  {
    target: '[data-tour="occupancy-calendar"]',
    title: 'Calendário Visual',
    content: 'Cada dia é colorido de acordo com a ocupação: verde escuro (80%+), verde claro (60-79%), amarelo (40-59%), laranja (20-39%), vermelho (menos de 20%). Use para planejar ações pontuais.',
    placement: 'top',
  },
];
