export interface MockRate {
  date: string;
  hotelId: string;
  hotelName: string;
  price: number | null;
  currency: string;
  isAvailable: boolean;
  isOwn: boolean;
}

export interface MockRateComparison {
  date: string;
  myHotel: number | null;
  competitors: {
    hotelId: string;
    hotelName: string;
    price: number | null;
  }[];
  avgCompetitor: number | null;
  diff: number | null; // % difference from average competitor
  position: 'cheaper' | 'average' | 'expensive' | null;
}

// Generate 30 days of rate data
function generateRates(): MockRateComparison[] {
  const rates: MockRateComparison[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Weekend pricing (Fri-Sun) is higher
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const baseMultiplier = isWeekend ? 1.3 : 1;

    // Random variations
    const myHotelPrice = Math.round((420 + Math.random() * 80) * baseMultiplier);
    const competitor1Price = Math.round((450 + Math.random() * 100) * baseMultiplier);
    const competitor2Price = Math.round((380 + Math.random() * 60) * baseMultiplier);
    const competitor3Price = Math.round((500 + Math.random() * 120) * baseMultiplier);

    const competitors = [
      { hotelId: '2', hotelName: 'Hotel Fasano Rio', price: competitor1Price },
      { hotelId: '3', hotelName: 'Belmond Copacabana', price: competitor2Price },
      { hotelId: '4', hotelName: 'Hotel Emiliano Rio', price: competitor3Price },
    ];

    const validPrices = competitors.filter(c => c.price !== null).map(c => c.price!);
    const avgCompetitor = validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : null;

    const diff = avgCompetitor && myHotelPrice
      ? Math.round(((myHotelPrice - avgCompetitor) / avgCompetitor) * 100)
      : null;

    let position: 'cheaper' | 'average' | 'expensive' | null = null;
    if (diff !== null) {
      if (diff < -5) position = 'cheaper';
      else if (diff > 5) position = 'expensive';
      else position = 'average';
    }

    rates.push({
      date: dateStr,
      myHotel: myHotelPrice,
      competitors,
      avgCompetitor,
      diff,
      position,
    });
  }

  return rates;
}

export const mockRates = generateRates();

// Summary stats
export function getRatesSummary() {
  const validRates = mockRates.filter(r => r.myHotel && r.avgCompetitor);

  const avgMyHotel = validRates.length > 0
    ? Math.round(validRates.reduce((sum, r) => sum + r.myHotel!, 0) / validRates.length)
    : 0;

  const avgCompetitors = validRates.length > 0
    ? Math.round(validRates.reduce((sum, r) => sum + r.avgCompetitor!, 0) / validRates.length)
    : 0;

  const cheaper = validRates.filter(r => r.position === 'cheaper').length;
  const expensive = validRates.filter(r => r.position === 'expensive').length;
  const average = validRates.filter(r => r.position === 'average').length;

  return {
    avgMyHotel,
    avgCompetitors,
    avgDiff: avgCompetitors > 0 ? Math.round(((avgMyHotel - avgCompetitors) / avgCompetitors) * 100) : 0,
    cheaper,
    expensive,
    average,
    total: validRates.length,
  };
}
