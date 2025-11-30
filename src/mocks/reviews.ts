export interface MockReview {
  id: string;
  hotelId: string;
  hotelName: string;
  rating: number;
  title: string | null;
  positive: string | null;
  negative: string | null;
  reviewerName: string;
  reviewerCountry: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export const mockReviews: MockReview[] = [
  // My Hotel Reviews
  {
    id: '1',
    hotelId: '1',
    hotelName: 'Hotel Copacabana Palace',
    rating: 9.6,
    title: 'Experiência incrível!',
    positive: 'Café da manhã excepcional com vista para o mar. Staff extremamente atencioso e prestativo. Quartos amplos e bem decorados.',
    negative: 'Estacionamento um pouco caro.',
    reviewerName: 'Carlos M.',
    reviewerCountry: 'Brasil',
    date: '2025-11-28',
    sentiment: 'positive',
  },
  {
    id: '2',
    hotelId: '1',
    hotelName: 'Hotel Copacabana Palace',
    rating: 8.8,
    title: 'Muito bom, mas pode melhorar',
    positive: 'Localização perfeita, bem na praia. Piscina maravilhosa.',
    negative: 'Wi-fi um pouco lento nos quartos. Ar condicionado barulhento.',
    reviewerName: 'Maria S.',
    reviewerCountry: 'Portugal',
    date: '2025-11-27',
    sentiment: 'positive',
  },
  {
    id: '3',
    hotelId: '1',
    hotelName: 'Hotel Copacabana Palace',
    rating: 7.2,
    title: 'Bom, mas esperava mais',
    positive: 'Vista linda do quarto.',
    negative: 'Preço elevado para o que oferece. Check-in demorado.',
    reviewerName: 'João P.',
    reviewerCountry: 'Brasil',
    date: '2025-11-26',
    sentiment: 'neutral',
  },
  {
    id: '4',
    hotelId: '1',
    hotelName: 'Hotel Copacabana Palace',
    rating: 9.4,
    title: 'Perfeito para lua de mel',
    positive: 'Decoração romântica, champagne no quarto, atendimento impecável. Spa incrível!',
    negative: null,
    reviewerName: 'Ana L.',
    reviewerCountry: 'Argentina',
    date: '2025-11-25',
    sentiment: 'positive',
  },
  {
    id: '5',
    hotelId: '1',
    hotelName: 'Hotel Copacabana Palace',
    rating: 5.8,
    title: 'Decepcionante',
    positive: 'Localização boa.',
    negative: 'Quarto com cheiro de mofo. Café da manhã repetitivo. Não vale o preço cobrado.',
    reviewerName: 'Pedro R.',
    reviewerCountry: 'Brasil',
    date: '2025-11-24',
    sentiment: 'negative',
  },
  // Competitor Reviews
  {
    id: '6',
    hotelId: '2',
    hotelName: 'Hotel Fasano Rio',
    rating: 9.8,
    title: 'Simplesmente perfeito',
    positive: 'Tudo impecável. Restaurante com estrela Michelin, vista espetacular, serviço de primeira classe.',
    negative: null,
    reviewerName: 'Isabela F.',
    reviewerCountry: 'Brasil',
    date: '2025-11-28',
    sentiment: 'positive',
  },
  {
    id: '7',
    hotelId: '2',
    hotelName: 'Hotel Fasano Rio',
    rating: 9.2,
    title: 'Luxo puro',
    positive: 'Design incrível, cama super confortável, praia de Ipanema nos pés.',
    negative: 'Preço do minibar muito alto.',
    reviewerName: 'Thomas W.',
    reviewerCountry: 'Alemanha',
    date: '2025-11-26',
    sentiment: 'positive',
  },
  {
    id: '8',
    hotelId: '3',
    hotelName: 'Belmond Copacabana',
    rating: 8.6,
    title: 'Clássico e elegante',
    positive: 'Hotel histórico com muito charme. Piscina linda.',
    negative: 'Quartos um pouco datados. Precisam de reforma.',
    reviewerName: 'Sophie L.',
    reviewerCountry: 'França',
    date: '2025-11-27',
    sentiment: 'positive',
  },
  {
    id: '9',
    hotelId: '4',
    hotelName: 'Hotel Emiliano Rio',
    rating: 9.0,
    title: 'Moderno e sofisticado',
    positive: 'Design contemporâneo, spa excelente, drinks incríveis no rooftop.',
    negative: 'Quartos podiam ser maiores.',
    reviewerName: 'Ricardo B.',
    reviewerCountry: 'Brasil',
    date: '2025-11-25',
    sentiment: 'positive',
  },
  {
    id: '10',
    hotelId: '3',
    hotelName: 'Belmond Copacabana',
    rating: 6.4,
    title: 'Esperava mais pelo preço',
    positive: 'Localização excelente.',
    negative: 'Serviço lento, café da manhã sem graça, banheiro precisando de reforma.',
    reviewerName: 'Luciana M.',
    reviewerCountry: 'Brasil',
    date: '2025-11-23',
    sentiment: 'negative',
  },
];

// Get reviews for a specific hotel
export const getHotelReviews = (hotelId: string) =>
  mockReviews.filter(r => r.hotelId === hotelId);

// Get reviews summary
export function getReviewsSummary(hotelId?: string) {
  const reviews = hotelId ? getHotelReviews(hotelId) : mockReviews;

  if (reviews.length === 0) {
    return { avgRating: 0, total: 0, positive: 0, neutral: 0, negative: 0 };
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;

  return {
    avgRating: Math.round(avgRating * 10) / 10,
    total: reviews.length,
    positive,
    neutral,
    negative,
  };
}

// Compare my hotel vs competitors
export function getReviewComparison() {
  const myReviews = mockReviews.filter(r => r.hotelId === '1');
  const competitorReviews = mockReviews.filter(r => r.hotelId !== '1');

  const myAvg = myReviews.length > 0
    ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
    : 0;

  const competitorAvg = competitorReviews.length > 0
    ? competitorReviews.reduce((sum, r) => sum + r.rating, 0) / competitorReviews.length
    : 0;

  return {
    myAvgRating: Math.round(myAvg * 10) / 10,
    competitorAvgRating: Math.round(competitorAvg * 10) / 10,
    diff: Math.round((myAvg - competitorAvg) * 10) / 10,
    myTotal: myReviews.length,
    competitorTotal: competitorReviews.length,
  };
}
