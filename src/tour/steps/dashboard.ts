import type { Step } from 'react-joyride';

export const dashboardSteps: Step[] = [
  {
    target: '[data-tour="tour-button"]',
    title: 'Bem-vindo ao Tour Guiado!',
    content: 'Clique neste botao a qualquer momento para rever o tour desta pagina. Vamos conhecer o seu painel de controle!',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-welcome"]',
    title: 'Seu Painel de Controle',
    content: 'Aqui voce tem uma visao geral de todas as metricas do seu hotel. Este e o ponto de partida para tomar decisoes estrategicas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    title: 'Resumo Rapido',
    content: 'Esses cartoes mostram seus numeros mais importantes: quantos hoteis voce monitora, quantos concorrentes acompanha, sua nota media e ocupacao. Panorama instantaneo do seu negocio.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-price-position"]',
    title: 'Posicao de Preco',
    content: 'Este cartao mostra se sua tarifa esta acima, abaixo ou na media dos concorrentes. Verde = mais barato que a concorrencia. Vermelho = mais caro. Use esta informacao para ajustar sua precificacao.',
    placement: 'right',
  },
  {
    target: '[data-tour="dashboard-price-chart"]',
    title: 'Evolucao de Precos',
    content: 'Acompanhe como sua tarifa e a dos concorrentes variaram nos ultimos 7 dias. Tendencias de alta ou queda ajudam a prever movimentos do mercado.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-reviews"]',
    title: 'Resumo de Avaliacoes',
    content: 'Veja sua nota media e a proporcao de avaliacoes positivas e negativas. Uma nota alta com muitas positivas indica boa reputacao online.',
    placement: 'right',
  },
  {
    target: '[data-tour="dashboard-occupancy"]',
    title: 'Resumo de Ocupacao',
    content: 'Monitore sua taxa de ocupacao geral, com detalhamento para fins de semana e dias uteis. Compare com os concorrentes para identificar oportunidades.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-quick-actions"]',
    title: 'Acoes Rapidas',
    content: 'Acesse rapidamente as principais funcionalidades: gerenciar hoteis, analisar tarifas ou ver avaliacoes. Cada secao tem seu proprio tour guiado!',
    placement: 'top',
  },
];
