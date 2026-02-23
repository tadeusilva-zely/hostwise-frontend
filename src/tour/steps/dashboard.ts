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
    title: 'Indicadores de Reputação',
    content: 'Acompanhe sua Nota Média, Taxa de Resposta, Respostas Pendentes e a diferença em relação aos concorrentes. Panorama instantâneo da sua reputação.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-review-charts"]',
    title: 'Gráficos de Avaliações',
    content: 'Visualize a distribuição de sentimento e compare sua nota com a dos concorrentes. Uma visão rápida da saúde da sua reputação.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-price-chart"]',
    title: 'Evolução de Preços',
    content: 'Acompanhe como sua tarifa e a dos concorrentes variaram nos últimos 7 dias. Tendências de alta ou queda ajudam a prever movimentos do mercado.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-occupancy"]',
    title: 'Resumo de Ocupação',
    content: 'Monitore sua taxa de ocupação geral, com detalhamento para fins de semana e dias úteis. Compare com os concorrentes para identificar oportunidades.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-analytics-link"]',
    title: 'Analytics de Reputação',
    content: 'Acesse a página de Analytics para ver a timeline de reputação, tendências por categoria, alertas inteligentes e análise com IA.',
    placement: 'top',
  },
  {
    target: '[data-tour="chat-bubble"]',
    title: 'Chat com IA',
    content: 'Tem alguma dúvida? Clique aqui para conversar com a IA do HostWise. Ela pode ajudar com análises de tarifas, avaliações, sugestões de precificação e muito mais!',
    placement: 'top-end',
  },
];
