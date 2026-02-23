import type { Step } from 'react-joyride';

export const reviewsSteps: Step[] = [
  {
    target: '[data-tour="reviews-header"]',
    title: 'Central de Avaliações',
    content: 'Monitore e responda as avaliações do seu hotel em todas as plataformas. Use os filtros para encontrar rapidamente o que precisa.',
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
    target: '[data-tour="reviews-response-rate"]',
    title: 'Taxa de Resposta',
    content: 'Acompanhe a porcentagem de avaliações respondidas e quantas estão pendentes. Uma taxa alta de resposta melhora sua reputação nas plataformas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-sentiment-cards"]',
    title: 'Filtros de Sentimento',
    content: 'Clique nos cartões para filtrar avaliações por sentimento: Positivas, Neutras ou Negativas. Foque nos feedbacks que mais importam para sua estratégia.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="reviews-list"]',
    title: 'Lista de Avaliações',
    content: 'Leia cada avaliação individualmente. Use os filtros de status (Todos, Pendentes, Respondidos) e o Smart Reply com IA para responder rapidamente.',
    placement: 'top',
  },
];
