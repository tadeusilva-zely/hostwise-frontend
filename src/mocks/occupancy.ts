export interface MockOccupancy {
  date: string;
  myHotel: number; // percentage 0-100
  avgCompetitor: number;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

// Generate 30 days of occupancy data
function generateOccupancy(): MockOccupancy[] {
  const occupancy: MockOccupancy[] = [];
  const today = new Date();

  // Brazilian holidays in the period
  const holidays: Record<string, string> = {
    '2025-12-25': 'Natal',
    '2025-12-31': 'Réveillon',
    '2026-01-01': 'Ano Novo',
  };

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const isHoliday = dateStr in holidays;

    // Base occupancy + weekend/holiday boost + random variation
    let baseOccupancy = 65;
    if (isWeekend) baseOccupancy += 15;
    if (isHoliday) baseOccupancy += 20;

    const myHotel = Math.min(100, Math.max(30, baseOccupancy + Math.round((Math.random() - 0.5) * 20)));
    const avgCompetitor = Math.min(100, Math.max(30, baseOccupancy + Math.round((Math.random() - 0.5) * 25)));

    occupancy.push({
      date: dateStr,
      myHotel,
      avgCompetitor,
      isWeekend,
      isHoliday,
      holidayName: holidays[dateStr],
    });
  }

  return occupancy;
}

export const mockOccupancy = generateOccupancy();

// Get occupancy summary
export function getOccupancySummary() {
  const avgMyHotel = Math.round(
    mockOccupancy.reduce((sum, o) => sum + o.myHotel, 0) / mockOccupancy.length
  );

  const avgCompetitor = Math.round(
    mockOccupancy.reduce((sum, o) => sum + o.avgCompetitor, 0) / mockOccupancy.length
  );

  const weekendOccupancy = mockOccupancy.filter(o => o.isWeekend);
  const weekdayOccupancy = mockOccupancy.filter(o => !o.isWeekend);

  const avgWeekend = weekendOccupancy.length > 0
    ? Math.round(weekendOccupancy.reduce((sum, o) => sum + o.myHotel, 0) / weekendOccupancy.length)
    : 0;

  const avgWeekday = weekdayOccupancy.length > 0
    ? Math.round(weekdayOccupancy.reduce((sum, o) => sum + o.myHotel, 0) / weekdayOccupancy.length)
    : 0;

  // Find highest and lowest days
  const sorted = [...mockOccupancy].sort((a, b) => b.myHotel - a.myHotel);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return {
    avgMyHotel,
    avgCompetitor,
    diff: avgMyHotel - avgCompetitor,
    avgWeekend,
    avgWeekday,
    highest: { date: highest.date, occupancy: highest.myHotel },
    lowest: { date: lowest.date, occupancy: lowest.myHotel },
  };
}

// Get week-by-week comparison
export function getWeeklyOccupancy() {
  const weeks: { weekStart: string; myHotel: number; competitor: number }[] = [];

  for (let i = 0; i < mockOccupancy.length; i += 7) {
    const weekData = mockOccupancy.slice(i, i + 7);
    if (weekData.length === 0) break;

    const avgMyHotel = Math.round(
      weekData.reduce((sum, o) => sum + o.myHotel, 0) / weekData.length
    );
    const avgCompetitor = Math.round(
      weekData.reduce((sum, o) => sum + o.avgCompetitor, 0) / weekData.length
    );

    weeks.push({
      weekStart: weekData[0].date,
      myHotel: avgMyHotel,
      competitor: avgCompetitor,
    });
  }

  return weeks;
}
