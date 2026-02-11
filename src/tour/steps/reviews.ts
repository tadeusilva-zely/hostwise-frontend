import type { Step } from 'react-joyride';

export const reviewsSteps: Step[] = [
  {
    target: '[data-tour="reviews-header"]',
    title: 'Raio-X de Avaliações',
    content: 'Analise as avaliações do seu hotel e da concorrência em um so lugar. Entenda o que os hóspedes mais elogiam e criticam.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-hotel-selector"]',
    title: 'Filtro por Hotel',
    content: 'Selecione um hotel específico ou veja todos juntos. Você pode analisar tanto seu próprio hotel quanto os concorrentes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-summary"]',
    title: 'Indicadores de Reputação',
    content: 'Nota média, total de positivas, negativas e o comparativo com concorrentes. Uma nota acima da média dos concorrentes é um diferencial competitivo importante.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-sentiment-chart"]',
    title: 'Distribuição de Sentimento',
    content: 'Veja a proporção de avaliações positivas, neutras e negativas. Um hotel saudável tem a maioria das avaliações positivas.',
    placement: 'right',
  },
  {
    target: '[data-tour="reviews-comparison-chart"]',
    title: 'Comparativo de Notas',
    content: 'Compare sua nota com a média dos concorrentes. Esta informação ajuda a entender sua posição no mercado em termos de satisfação do hóspede.',
    placement: 'left',
  },
  {
    target: '[data-tour="reviews-ai-summary"]',
    title: 'Resumo com Inteligência Artificial',
    content: 'Nossa IA analisa todas as avaliações e gera um resumo com pontos fortes, pontos fracos e insights de tendência. Selecione diferentes hotéis para comparar.',
    placement: 'top',
  },
  {
    target: '[data-tour="reviews-list"]',
    title: 'Lista de Avaliações',
    content: 'Leia cada avaliação individualmente. Use os filtros (Todas, Positivas, Neutras, Negativas) para focar no que mais importa para sua estratégia.',
    placement: 'top',
  },
];
