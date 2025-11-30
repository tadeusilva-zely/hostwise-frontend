import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { mockOccupancy, getOccupancySummary, getWeeklyOccupancy, getOwnHotels } from '../../mocks';
import type { MockOccupancy } from '../../mocks';
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Percent,
  Sun,
  Star,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, BarChart } from '@tremor/react';

export function OccupancyPage() {
  const ownHotels = getOwnHotels();
  const summary = getOccupancySummary();
  const weeklyData = getWeeklyOccupancy();

  // Check if user has hotels
  if (ownHotels.length === 0) {
    return <EmptyState />;
  }

  // Chart data
  const chartData = mockOccupancy.map(o => ({
    date: formatDateShort(o.date),
    'Meu Hotel': o.myHotel,
    'Media Concorrentes': o.avgCompetitor,
  }));

  // Weekly comparison data
  const weeklyChartData = weeklyData.map((w, i) => ({
    name: `Semana ${i + 1}`,
    'Meu Hotel': w.myHotel,
    'Concorrentes': w.competitor,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-hw-navy-900">Sensor de Lotacao</h1>
        <p className="text-hw-navy-500 mt-1">
          Acompanhe a ocupacao estimada do seu hotel e concorrentes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-hw-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{summary.avgMyHotel}%</p>
              <p className="text-sm text-hw-navy-500">Ocupacao Media</p>
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
              <p className="text-sm text-hw-navy-500">Dias Uteis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolucao da Ocupacao</CardTitle>
          <CardDescription>Comparativo dos proximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-72"
            data={chartData}
            index="date"
            categories={['Meu Hotel', 'Media Concorrentes']}
            colors={['violet', 'slate']}
            valueFormatter={(value) => `${value}%`}
            showLegend={true}
            showAnimation={true}
          />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo Semanal</CardTitle>
            <CardDescription>Ocupacao por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-64"
              data={weeklyChartData}
              index="name"
              categories={['Meu Hotel', 'Concorrentes']}
              colors={['violet', 'slate']}
              valueFormatter={(value) => `${value}%`}
              showAnimation={true}
            />
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Destaques</CardTitle>
            <CardDescription>Pontos de atencao do periodo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Highest Occupancy */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Maior Ocupacao</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{summary.highest.occupancy}%</p>
              <p className="text-sm text-green-600">
                {formatDateFull(summary.highest.date)}
              </p>
            </div>

            {/* Lowest Occupancy */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-700">Menor Ocupacao</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{summary.lowest.occupancy}%</p>
              <p className="text-sm text-red-600">
                {formatDateFull(summary.lowest.date)}
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
                  ? 'Sua ocupacao esta abaixo da concorrencia. Considere ajustar suas tarifas para aumentar a competitividade.'
                  : 'Parabens! Sua ocupacao esta acima da media. Continue monitorando para manter o bom desempenho.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Ocupacao</CardTitle>
          <CardDescription>Visualizacao diaria dos proximos 30 dias</CardDescription>
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
            {mockOccupancy.map((day, index) => {
              const date = new Date(day.date);
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
  );
}

// Calendar Day Component
function CalendarDay({ day, dayOfMonth }: { day: MockOccupancy; dayOfMonth: number }) {
  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-green-500';
    if (occupancy >= 60) return 'bg-green-300';
    if (occupancy >= 40) return 'bg-yellow-300';
    if (occupancy >= 20) return 'bg-orange-300';
    return 'bg-red-300';
  };

  return (
    <div className={cn(
      'h-16 rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors',
      day.isWeekend ? 'bg-hw-navy-50' : 'bg-white',
      day.isHoliday && 'ring-2 ring-hw-purple ring-offset-1'
    )}>
      <span className="text-xs text-hw-navy-500">{dayOfMonth}</span>
      <div className={cn(
        'w-8 h-5 rounded text-xs font-semibold text-white flex items-center justify-center mt-1',
        getOccupancyColor(day.myHotel)
      )}>
        {day.myHotel}%
      </div>
      {day.isHoliday && (
        <span className="text-[10px] text-hw-purple font-medium truncate w-full mt-0.5">
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
        Adicione seu hotel para comecar a monitorar a ocupacao.
      </p>
      <a href="/hotels" className="text-hw-purple font-medium hover:underline">
        Ir para Meus Hoteis
      </a>
    </div>
  );
}

// Helper functions
function formatDateShort(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDateFull(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}
