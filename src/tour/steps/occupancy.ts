import type { Step } from 'react-joyride';

export const occupancySteps: Step[] = [
  {
    target: '[data-tour="occupancy-header"]',
    title: 'Sensor de Lotacao',
    content: 'Acompanhe a ocupacao estimada do seu hotel e compare com os concorrentes. Dados de ocupacao ajudam a otimizar sua estrategia de precos.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-summary"]',
    title: 'Indicadores de Ocupacao',
    content: 'Sua ocupacao media, comparativo com concorrentes, e a diferenca entre fins de semana e dias uteis. Diferenca grande entre eles indica oportunidades de precificacao.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-evolution-chart"]',
    title: 'Evolucao da Ocupacao',
    content: 'Visualize a tendencia de ocupacao dos proximos 30 dias. Periodos de queda podem ser oportunidades para campanhas promocionais.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="occupancy-weekly-chart"]',
    title: 'Comparativo Semanal',
    content: 'Compare sua ocupacao semanal com a dos concorrentes. Identifique semanas onde voce esta abaixo e ajuste sua estrategia.',
    placement: 'right',
  },
  {
    target: '[data-tour="occupancy-highlights"]',
    title: 'Destaques do Periodo',
    content: 'Identifique rapidamente o dia de maior e menor ocupacao. A dica HostWise oferece uma orientacao pratica baseada nos seus dados.',
    placement: 'left',
  },
  {
    target: '[data-tour="occupancy-calendar"]',
    title: 'Calendario Visual',
    content: 'Cada dia e colorido de acordo com a ocupacao: verde escuro (80%+), verde claro (60-79%), amarelo (40-59%), laranja (20-39%), vermelho (menos de 20%). Use para planejar acoes pontuais.',
    placement: 'top',
  },
];
