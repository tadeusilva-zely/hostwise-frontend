import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, BarChart } from '@tremor/react';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { occupancySteps } from '../../tour/steps/occupancy';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function OccupancyPage() {
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
        <Loader2 className="w-8 h-8 text-hw-purple animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-hw-navy-900">Erro ao carregar ocupação</h2>
        <p className="text-hw-navy-500 mt-1">Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const occupancy = data?.occupancy || [];
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

  // Check if selected hotel is own (to hide competitor series)
  const selectedIsOwn = hotelsData?.ownHotels?.some(h => h.id === selectedHotelId) ?? false;
  const showCompetitors = selectedHotelId === 'all' || !selectedIsOwn;

  // Chart data
  const chartData = occupancy.map(o => ({
    date: formatDateShort(o.date),
    'Meu Hotel': o.occupancy,
    ...(showCompetitors ? { 'Média Concorrentes': o.competitorOccupancy } : {}),
  }));

  // Weekly comparison data
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
          <h1 className="text-2xl font-bold text-hw-navy-900">Sensor de Lotação</h1>
          <p className="text-hw-navy-500 mt-1">
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
            <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-hw-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{summary.avgMyHotel}%</p>
              <p className="text-sm text-hw-navy-500">Ocupação Média</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              summary.diff >= 0 ? 'bg-green-100' : 'bg-red-100'
            )}>
              {summary.diff >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">
                {summary.diff >= 0 ? '+' : ''}{summary.diff}%
              </p>
              <p className="text-sm text-hw-navy-500">vs Concorrentes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Sun className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{summary.avgWeekend}%</p>
              <p className="text-sm text-hw-navy-500">Fins de Semana</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{summary.avgWeekday}%</p>
              <p className="text-sm text-hw-navy-500">Dias Úteis</p>
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
            colors={showCompetitors ? ['violet', 'slate'] : ['violet']}
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
              colors={showCompetitors ? ['violet', 'slate'] : ['violet']}
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Maior Ocupação</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{summary.highest.occupancy}%</p>
              <p className="text-sm text-green-600">
                {summary.highest.date ? formatDateFull(summary.highest.date) : '--'}
              </p>
            </div>

            {/* Lowest Occupancy */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-700">Menor Ocupação</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{summary.lowest.occupancy}%</p>
              <p className="text-sm text-red-600">
                {summary.lowest.date ? formatDateFull(summary.lowest.date) : '--'}
              </p>
            </div>

            {/* Tip */}
            <div className="p-4 bg-hw-purple-50 rounded-lg border border-hw-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-hw-purple" />
                <span className="font-semibold text-hw-purple">Dica HostWise</span>
              </div>
              <p className="text-sm text-hw-navy-700">
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
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-hw-navy-500 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {occupancy.map((day, index) => {
              const date = new Date(day.date + 'T00:00:00');
              const dayOfMonth = date.getDate();

              // Add empty cells for first week alignment
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
                    <CalendarDay key={day.date} day={day} dayOfMonth={dayOfMonth} />
                  </>
                );
              }

              return <CalendarDay key={day.date} day={day} dayOfMonth={dayOfMonth} />;
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// Calendar Day Component
function CalendarDay({ day, dayOfMonth }: { day: OccupancyDay; dayOfMonth: number }) {
  const getOccupancyStyle = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-green-600 text-white';
    if (occupancy >= 60) return 'bg-green-100 text-green-800';
    if (occupancy >= 40) return 'bg-yellow-100 text-yellow-800';
    if (occupancy >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={cn(
      'min-h-16 rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors',
      day.isWeekend ? 'bg-hw-navy-50' : 'bg-white',
      day.isHoliday && 'ring-2 ring-hw-purple ring-offset-1'
    )}>
      <span className="text-xs text-hw-navy-500">{dayOfMonth}</span>
      <div className={cn(
        'w-10 h-5 rounded text-xs font-semibold flex items-center justify-center mt-1',
        getOccupancyStyle(day.occupancy)
      )}>
        {day.occupancy}%
      </div>
      {day.isHoliday && (
        <span className="text-[10px] text-hw-purple font-medium w-full mt-0.5 leading-tight">
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
      <div className="w-16 h-16 bg-hw-purple-100 rounded-full flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-hw-purple" />
      </div>
      <h2 className="text-xl font-semibold text-hw-navy-900 mb-2">Nenhum hotel cadastrado</h2>
      <p className="text-hw-navy-500 max-w-md mb-4">
        Adicione seu hotel para começar a monitorar a ocupação.
      </p>
      <a href="/hotels" className="text-hw-purple font-medium hover:underline">
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
