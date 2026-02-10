import type { Step } from 'react-joyride';

export const reviewsSteps: Step[] = [
  {
    target: '[data-tour="reviews-header"]',
    title: 'Raio-X de Avaliacoes',
    content: 'Analise as avaliacoes do seu hotel e da concorrencia em um so lugar. Entenda o que os hospedes mais elogiam e criticam.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-hotel-selector"]',
    title: 'Filtro por Hotel',
    content: 'Selecione um hotel especifico ou veja todos juntos. Voce pode analisar tanto seu proprio hotel quanto os concorrentes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-summary"]',
    title: 'Indicadores de Reputacao',
    content: 'Nota media, total de positivas, negativas e o comparativo com concorrentes. Uma nota acima da media dos concorrentes e um diferencial competitivo importante.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-sentiment-chart"]',
    title: 'Distribuicao de Sentimento',
    content: 'Veja a proporcao de avaliacoes positivas, neutras e negativas. Um hotel saudavel tem a maioria das avaliacoes positivas.',
    placement: 'right',
  },
  {
    target: '[data-tour="reviews-comparison-chart"]',
    title: 'Comparativo de Notas',
    content: 'Compare sua nota com a media dos concorrentes. Esta informacao ajuda a entender sua posicao no mercado em termos de satisfacao do hospede.',
    placement: 'left',
  },
  {
    target: '[data-tour="reviews-ai-summary"]',
    title: 'Resumo com Inteligencia Artificial',
    content: 'Nossa IA analisa todas as avaliacoes e gera um resumo com pontos fortes, pontos fracos e insights de tendencia. Selecione diferentes hoteis para comparar.',
    placement: 'top',
  },
  {
    target: '[data-tour="reviews-list"]',
    title: 'Lista de Avaliacoes',
    content: 'Leia cada avaliacao individualmente. Use os filtros (Todas, Positivas, Neutras, Negativas) para focar no que mais importa para sua estrategia.',
    placement: 'top',
  },
];
