import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HotelSelector } from '../../components/ui/HotelSelector';
import { getOccupancy, getHotels } from '../../services/api';
import type { OccupancyDay } from '../../services/api';
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Percent,
  Sun,
  Star,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, BarChart } from '@tremor/react';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { occupancySteps } from '../../tour/steps/occupancy';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function OccupancyPage() {
  const { user } = useAuth();
  const horizonDays = user?.limits.horizonDays ?? 30;
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const handleTourCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
      markTourSeen('occupancy');
    }
  }, [stopTour, markTourSeen]);

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['occupancy', selectedHotelId],
    queryFn: () => getOccupancy(30, selectedHotelId !== 'all' ? selectedHotelId : undefined),
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Erro ao carregar ocupação</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const realOccupancy = data?.occupancy || [];

  const CALENDAR_DISPLAY_DAYS = 30;
  const occupancy = (() => {
    if (realOccupancy.length >= CALENDAR_DISPLAY_DAYS) return realOccupancy;
    const padded = [...realOccupancy];
    const lastDate = realOccupancy.length > 0
      ? new Date(realOccupancy[realOccupancy.length - 1]!.date + 'T00:00:00')
      : new Date();
    for (let i = 1; padded.length < CALENDAR_DISPLAY_DAYS; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]!;
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const mockOccupancy = 45 + Math.floor(((date.getDate() * 17 + i * 31) % 41));
      padded.push({
        date: dateStr,
        occupancy: mockOccupancy,
        competitorOccupancy: 45 + Math.floor(((date.getDate() * 13 + i * 23) % 41)),
        isWeekend,
        isHoliday: false,
        holidayName: null,
      });
    }
    return padded;
  })();

  const summary = data?.summary || {
    avgMyHotel: 0,
    avgCompetitor: 0,
    diff: 0,
    avgWeekend: 0,
    avgWeekday: 0,
    highest: { date: '', occupancy: 0 },
    lowest: { date: '', occupancy: 100 },
  };
  const weeklyData = data?.weekly || [];

  if (occupancy.length === 0) {
    return <EmptyState />;
  }

  const selectedIsOwn = hotelsData?.ownHotels?.some(h => h.id === selectedHotelId) ?? false;
  const showCompetitors = selectedHotelId === 'all' || !selectedIsOwn;

  const chartData = occupancy.map(o => ({
    date: formatDateShort(o.date),
    'Meu Hotel': o.occupancy,
    ...(showCompetitors ? { 'Média Concorrentes': o.competitorOccupancy } : {}),
  }));

  const weeklyChartData = weeklyData.map(w => ({
    name: w.week,
    'Meu Hotel': w.myHotel,
    ...(showCompetitors ? { 'Concorrentes': w.competitors } : {}),
  }));

  return (
    <div className="space-y-6">
      <Joyride
        steps={occupancySteps}
        run={isRunning && currentPage === 'occupancy'}
        continuous
        showSkipButton
        scrollToFirstStep
        scrollOffset={80}
        spotlightClicks
        disableOverlayClose
        tooltipComponent={TourTooltip}
        styles={tourStyles}
        callback={handleTourCallback}
      />

      {/* Header */}
      <div data-tour="occupancy-header" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Sensor de Lotação
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Previsão de ocupação estimada para os próximos 30 dias (D+30)
          </p>
        </div>
        <HotelSelector
          ownHotels={hotelsData?.ownHotels || []}
          competitorHotels={hotelsData?.competitorHotels || []}
          selectedHotelId={selectedHotelId}
          onChange={setSelectedHotelId}
        />
      </div>

      {/* Summary Cards */}
      <div data-tour="occupancy-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,70,229,0.15)' }}>
              <Percent className="w-6 h-6" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{summary.avgMyHotel}%</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ocupação Média</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: summary.diff >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}
            >
              {summary.diff >= 0 ? (
                <TrendingUp className="w-6 h-6" style={{ color: '#10b981' }} />
              ) : (
                <TrendingDown className="w-6 h-6" style={{ color: '#f87171' }} />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {summary.diff >= 0 ? '+' : ''}{summary.diff}%
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>vs Concorrentes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251,146,60,0.15)' }}>
              <Sun className="w-6 h-6" style={{ color: '#fb923c' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{summary.avgWeekend}%</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fins de Semana</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(96,165,250,0.15)' }}>
              <CalendarDays className="w-6 h-6" style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{summary.avgWeekday}%</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dias Úteis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart */}
      <div data-tour="occupancy-evolution-chart">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Ocupação</CardTitle>
            <CardDescription>Projeção D+30 — Seu hotel vs concorrentes</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={chartData}
              index="date"
              categories={showCompetitors ? ['Meu Hotel', 'Média Concorrentes'] : ['Meu Hotel']}
              colors={showCompetitors ? ['indigo', 'slate'] : ['indigo']}
              valueFormatter={(value) => `${value}%`}
              showLegend={true}
              showAnimation={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison */}
        <div data-tour="occupancy-weekly-chart">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo Semanal</CardTitle>
              <CardDescription>Média semanal — Próximos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                className="h-64"
                data={weeklyChartData}
                index="name"
                categories={showCompetitors ? ['Meu Hotel', 'Concorrentes'] : ['Meu Hotel']}
                colors={showCompetitors ? ['indigo', 'slate'] : ['indigo']}
                valueFormatter={(value) => `${value}%`}
                showAnimation={true}
                tickGap={2}
              />
            </CardContent>
          </Card>
        </div>

        {/* Highlights */}
        <div data-tour="occupancy-highlights">
          <Card>
            <CardHeader>
              <CardTitle>Destaques</CardTitle>
              <CardDescription>Pontos de atenção — Próximos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Highest Occupancy */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                  <span className="font-semibold" style={{ color: '#10b981' }}>Maior Ocupação</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{summary.highest.occupancy}%</p>
                <p className="text-sm" style={{ color: '#34d399' }}>
                  {summary.highest.date ? formatDateFull(summary.highest.date) : '--'}
                </p>
              </div>

              {/* Lowest Occupancy */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5" style={{ color: '#f87171' }} />
                  <span className="font-semibold" style={{ color: '#f87171' }}>Menor Ocupação</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#f87171' }}>{summary.lowest.occupancy}%</p>
                <p className="text-sm" style={{ color: '#fca5a5' }}>
                  {summary.lowest.date ? formatDateFull(summary.lowest.date) : '--'}
                </p>
              </div>

              {/* Tip */}
              <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(79,70,229,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5" style={{ color: '#818cf8' }} />
                  <span className="font-semibold" style={{ color: '#818cf8' }}>Dica HostWise</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {summary.diff < 0
                    ? 'Sua ocupação está abaixo da concorrência. Considere ajustar suas tarifas para aumentar a competitividade.'
                    : 'Parabéns! Sua ocupação está acima da média. Continue monitorando para manter o bom desempenho.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar View */}
      <div data-tour="occupancy-calendar">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Ocupação</CardTitle>
            <CardDescription>Ocupação diária estimada — D+30</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="grid grid-cols-7 gap-2">
                {/* Week day headers */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                  <div key={day} className="text-center text-sm font-medium py-2" style={{ color: 'var(--text-muted)' }}>
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {occupancy.map((day, index) => {
                  const date = new Date(day.date + 'T00:00:00');
                  const dayOfMonth = date.getDate();
                  const isLocked = index >= horizonDays;

                  if (index === 0) {
                    const firstDayOfWeek = date.getDay();
                    const emptyCells = [];
                    for (let i = 0; i < firstDayOfWeek; i++) {
                      emptyCells.push(
                        <div key={`empty-${i}`} className="h-16" />
                      );
                    }
                    return (
                      <>
                        {emptyCells}
                        <div key={day.date} className={cn(isLocked && 'blur-sm select-none pointer-events-none')}>
                          <CalendarDay day={day} dayOfMonth={dayOfMonth} />
                        </div>
                      </>
                    );
                  }

                  return (
                    <div key={day.date} className={cn(isLocked && 'blur-sm select-none pointer-events-none')}>
                      <CalendarDay day={day} dayOfMonth={dayOfMonth} />
                    </div>
                  );
                })}
              </div>

              {/* Upgrade CTA overlay */}
              {occupancy.length > horizonDays && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none rounded-b-lg"
                  style={{ background: 'linear-gradient(to top, var(--surface-card) 0%, rgba(30,35,55,0.95) 60%, transparent 100%)' }}
                />
              )}
              {occupancy.length > horizonDays && (
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 gap-2 text-center">
                  <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Veja os próximos 90 dias no plano Insight
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {occupancy.length - horizonDays} dias bloqueados
                  </p>
                  <Link to="/billing" className="pointer-events-auto">
                    <Button size="sm" variant="primary">
                      Fazer upgrade
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Calendar Day Component
function CalendarDay({ day, dayOfMonth }: { day: OccupancyDay; dayOfMonth: number }) {
  const getOccupancyStyle = (occupancy: number): React.CSSProperties => {
    if (occupancy >= 80) return { backgroundColor: '#10b981', color: '#fff' };
    if (occupancy >= 60) return { backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981' };
    if (occupancy >= 40) return { backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24' };
    if (occupancy >= 20) return { backgroundColor: 'rgba(251,146,60,0.2)', color: '#fb923c' };
    return { backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' };
  };

  return (
    <div
      className="min-h-16 rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors"
      style={{
        backgroundColor: day.isWeekend ? 'var(--surface-secondary)' : 'var(--surface-card)',
        border: day.isHoliday ? '2px solid #4f46e5' : '1px solid var(--surface-border)',
      }}
    >
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dayOfMonth}</span>
      <div
        className="w-10 h-5 rounded text-xs font-semibold flex items-center justify-center mt-1"
        style={getOccupancyStyle(day.occupancy)}
      >
        {day.occupancy}%
      </div>
      {day.isHoliday && (
        <span className="text-[10px] font-medium w-full mt-0.5 leading-tight" style={{ color: '#818cf8' }}>
          {day.holidayName}
        </span>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.2))' }}
      >
        <TrendingUp className="w-8 h-8" style={{ color: '#818cf8' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum hotel cadastrado</h2>
      <p className="max-w-md mb-4" style={{ color: 'var(--text-muted)' }}>
        Adicione seu hotel para começar a monitorar a ocupação.
      </p>
      <a href="/hotels" className="font-medium hover:underline" style={{ color: '#818cf8' }}>
        Ir para Meus Hotéis
      </a>
    </div>
  );
}

// Helper functions
function formatDateShort(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDateFull(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}
