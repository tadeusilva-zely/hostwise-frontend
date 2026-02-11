import type { Step } from 'react-joyride';

export const dashboardSteps: Step[] = [
  {
    target: '[data-tour="tour-button"]',
    title: 'Bem-vindo ao Tour Guiado!',
    content: 'Clique neste botão a qualquer momento para rever o tour desta página. Vamos conhecer o seu painel de controle!',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-welcome"]',
    title: 'Seu Painel de Controle',
    content: 'Aqui você tem uma visão geral de todas as métricas do seu hotel. Este é o ponto de partida para tomar decisões estratégicas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    title: 'Resumo Rápido',
    content: 'Esses cartões mostram seus números mais importantes: quantos hotéis você monitora, quantos concorrentes acompanha, sua nota média e ocupação. Panorama instantâneo do seu negócio.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-price-position"]',
    title: 'Posição de Preço',
    content: 'Este cartão mostra se sua tarifa está acima, abaixo ou na média dos concorrentes. Verde = mais barato que a concorrência. Vermelho = mais caro. Use esta informação para ajustar sua precificação.',
    placement: 'right',
  },
  {
    target: '[data-tour="dashboard-price-chart"]',
    title: 'Evolução de Preços',
    content: 'Acompanhe como sua tarifa e a dos concorrentes variaram nos últimos 7 dias. Tendências de alta ou queda ajudam a prever movimentos do mercado.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-reviews"]',
    title: 'Resumo de Avaliações',
    content: 'Veja sua nota média e a proporção de avaliações positivas e negativas. Uma nota alta com muitas positivas indica boa reputação online.',
    placement: 'right',
  },
  {
    target: '[data-tour="dashboard-occupancy"]',
    title: 'Resumo de Ocupação',
    content: 'Monitore sua taxa de ocupação geral, com detalhamento para fins de semana e dias úteis. Compare com os concorrentes para identificar oportunidades.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-quick-actions"]',
    title: 'Ações Rápidas',
    content: 'Acesse rapidamente as principais funcionalidades: gerenciar hotéis, analisar tarifas ou ver avaliações. Cada seção tem seu próprio tour guiado!',
    placement: 'top',
  },
  {
    target: '[data-tour="chat-bubble"]',
    title: 'Chat com IA',
    content: 'Tem alguma dúvida? Clique aqui para conversar com a IA do HostWise. Ela pode ajudar com análises de tarifas, avaliações, sugestões de precificação e muito mais!',
    placement: 'top-end',
  },
];
