import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HotelSelector } from '../../components/ui/HotelSelector';
import { getRatesComparison, getHotels } from '../../services/api';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DonutChart, Legend } from '@tremor/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartLegend,
  ResponsiveContainer,
} from 'recharts';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { ratesSteps } from '../../tour/steps/rates';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function RatesPage() {
  const { user } = useAuth();
  const horizonDays = user?.limits.horizonDays ?? 30;
  const defaultDays = ([30, 15, 7] as const).find(d => d <= horizonDays) ?? 7;
  const [selectedDays, setSelectedDays] = useState<7 | 15 | 30>(defaultDays);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const handleTourCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
      markTourSeen('rates');
    }
  }, [stopTour, markTourSeen]);

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rates', selectedDays, selectedHotelId],
    queryFn: () => getRatesComparison(selectedDays, selectedHotelId !== 'all' ? selectedHotelId : undefined),
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
        <h2 className="text-lg font-semibold text-hw-navy-900">Erro ao carregar tarifas</h2>
        <p className="text-hw-navy-500 mt-1">Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const summary = data?.summary || { avgMyHotel: 0, avgCompetitors: 0, avgDiff: 0, cheaper: 0, expensive: 0, average: 0, total: 0 };
  const realRates = data?.rates || [];
  const hotels = data?.hotels || [];

  // Pad rates with mock rows to always show 30 days — locked rows are blurred
  const TABLE_DISPLAY_DAYS = 30;
  const rates = (() => {
    if (realRates.length >= TABLE_DISPLAY_DAYS) return realRates;
    const padded = [...realRates];
    const competitors = hotels.filter(h => !h.isOwn);
    const lastDate = realRates.length > 0
      ? new Date(realRates[realRates.length - 1]!.date + 'T00:00:00')
      : new Date();
    for (let i = 1; padded.length < TABLE_DISPLAY_DAYS; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]!;
      const seed = date.getDate() * 17 + i * 31;
      const mockMyHotel = 200 + (seed % 400);
      padded.push({
        date: dateStr,
        myHotel: mockMyHotel,
        competitors: competitors.map((c, ci) => ({
          hotelId: c.id,
          hotelName: c.name,
          price: 180 + ((seed + ci * 43) % 350),
        })),
        avgCompetitor: 190 + ((seed + 11) % 380),
        diff: null,
        position: null,
      });
    }
    return padded;
  })();

  const ownHotel = hotels.find((h) => h.isOwn);
  const competitorHotels = hotels.filter((h) => !h.isOwn);

  // Check if user has hotels
  if (!ownHotel) {
    return <EmptyState />;
  }

  if (realRates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Espião de Tarifas</h1>
          <p className="text-hw-navy-500 mt-1">Compare seus preços com a concorrência</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-hw-navy-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-hw-navy-900">Dados ainda sendo coletados</h2>
            <p className="text-hw-navy-500 mt-1">Os dados de tarifas estarão disponíveis após a primeira coleta do Booking.com.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chart data — use only real data, not mock rows
  const chartData = realRates.map(r => ({
    date: formatDateShort(r.date),
    'Meu Hotel': r.myHotel,
    'Média Concorrentes': r.avgCompetitor,
  }));

  // Position distribution for donut chart
  const positionData = [
    { name: 'Mais barato', value: summary.cheaper, color: 'emerald' },
    { name: 'Na média', value: summary.average, color: 'amber' },
    { name: 'Mais caro', value: summary.expensive, color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      <Joyride
        steps={ratesSteps}
        run={isRunning && currentPage === 'rates'}
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
      <div data-tour="rates-header" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Espião de Tarifas</h1>
          <p className="text-hw-navy-500 mt-1">
            Compare seus preços com a concorrência
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Hotel Selector */}
          <HotelSelector
            ownHotels={hotelsData?.ownHotels || []}
            competitorHotels={hotelsData?.competitorHotels || []}
            selectedHotelId={selectedHotelId}
            onChange={setSelectedHotelId}
          />

          {/* Period Selector */}
          <div data-tour="rates-period-selector" className="flex bg-hw-navy-100 rounded-lg p-1">
          {([7, 15, 30] as const).map((days) => {
            const locked = days > horizonDays;
            return (
              <button
                key={days}
                onClick={() => !locked && setSelectedDays(days)}
                disabled={locked}
                title={locked ? `Disponível a partir do plano Insight` : undefined}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1',
                  locked
                    ? 'text-hw-navy-400 cursor-not-allowed'
                    : selectedDays === days
                      ? 'bg-white text-hw-navy-900 shadow-sm'
                      : 'text-hw-navy-600 hover:text-hw-navy-900'
                )}
              >
                {days} dias
                {locked && <Lock className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div data-tour="rates-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Minha Tarifa Média"
          value={formatBRL(summary.avgMyHotel)}
          icon={DollarSign}
          color="purple"
        />
        <SummaryCard
          title="Média Concorrentes"
          value={formatBRL(summary.avgCompetitors)}
          icon={Building2}
          color="navy"
        />
        <SummaryCard
          title="Diferença"
          value={`${summary.avgDiff > 0 ? '+' : ''}${summary.avgDiff}%`}
          icon={summary.avgDiff > 0 ? TrendingUp : summary.avgDiff < 0 ? TrendingDown : Minus}
          color={summary.avgDiff > 0 ? 'red' : summary.avgDiff < 0 ? 'green' : 'yellow'}
          subtitle={summary.avgDiff > 0 ? 'Acima da média' : summary.avgDiff < 0 ? 'Abaixo da média' : 'Na média'}
        />
        <SummaryCard
          title="Dias Mais Barato"
          value={`${summary.cheaper}/${summary.total}`}
          icon={TrendingDown}
          color="green"
          subtitle={summary.total > 0 ? `${Math.round((summary.cheaper / summary.total) * 100)}% dos dias` : undefined}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Evolution Chart */}
        <div data-tour="rates-evolution-chart" className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Preços</CardTitle>
            <CardDescription>Previsão dos próximos {selectedDays} dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMyHotel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompetitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" interval={0} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => formatBRL(v)} tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip formatter={(value: number) => formatBRL(value)} />
                <RechartLegend />
                <Area type="monotone" dataKey="Meu Hotel" stroke="#7c3aed" fill="url(#colorMyHotel)" strokeWidth={2} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="Média Concorrentes" stroke="#64748b" fill="url(#colorCompetitors)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>

        {/* Position Distribution */}
        <div data-tour="rates-position-chart">
        <Card>
          <CardHeader>
            <CardTitle>Posicionamento</CardTitle>
            <CardDescription>Sua posição em relação aos concorrentes</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-40"
              data={positionData}
              category="value"
              index="name"
              colors={['emerald', 'amber', 'rose']}
              showAnimation={true}
            />
            <Legend
              className="mt-4"
              categories={['Mais barato', 'Na média', 'Mais caro']}
              colors={['emerald', 'amber', 'rose']}
            />
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Competitor Prices Today */}
      {realRates.length > 0 && (
        <div data-tour="rates-today-prices">
        <Card>
          <CardHeader>
            <CardTitle>Preços de Hoje</CardTitle>
            <CardDescription>Comparativo de tarifas para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* My Hotel */}
              <div className="flex items-center justify-between p-4 bg-hw-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-hw-purple rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-hw-navy-900">{ownHotel?.name}</p>
                    <p className="text-sm text-hw-navy-500">Meu Hotel</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-hw-purple">
                    {formatBRL(rates[0]?.myHotel)}
                  </p>
                </div>
              </div>

              {/* Competitors */}
              {rates[0]?.competitors.map((comp) => {
                const diff = rates[0].myHotel && comp.price
                  ? Math.round(((rates[0].myHotel - comp.price) / comp.price) * 100)
                  : null;

                return (
                  <div key={comp.hotelId} className="flex items-center justify-between p-4 bg-hw-navy-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-hw-navy-200 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-hw-navy-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-hw-navy-900">{comp.hotelName}</p>
                        <p className="text-sm text-hw-navy-500">Concorrente</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="text-xl font-bold text-hw-navy-900">
                        {formatBRL(comp.price)}
                      </p>
                      {diff !== null && (
                        <span className={cn(
                          'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded',
                          diff < 0 ? 'bg-green-100 text-green-700' : diff > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {diff < 0 ? <ArrowDown className="w-3 h-3" /> : diff > 0 ? <ArrowUp className="w-3 h-3" /> : null}
                          {diff > 0 ? '+' : ''}{diff}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Rates Table */}
      <div data-tour="rates-table">
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Tarifas</CardTitle>
          <CardDescription>Tarifas diárias previstas — próximos {horizonDays} dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hw-navy-100">
                    <th className="text-left py-3 px-4 font-semibold text-hw-navy-700">Data</th>
                    <th className="text-right py-3 px-4 font-semibold text-hw-navy-700">Meu Hotel</th>
                    {competitorHotels.slice(0, 3).map(h => (
                      <th key={h.id} className="text-right py-3 px-4 font-semibold text-hw-navy-700">
                        {h.name.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 font-semibold text-hw-navy-700">Posição</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, idx) => {
                    const isLocked = idx >= horizonDays;
                    return (
                      <tr key={rate.date} className={cn(
                        'border-b border-hw-navy-50',
                        idx % 2 === 0 && 'bg-hw-navy-50/50',
                        isLocked && 'blur-sm select-none pointer-events-none'
                      )}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-hw-navy-400" />
                            {formatDateFull(rate.date)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-hw-purple">
                          {formatBRL(rate.myHotel)}
                        </td>
                        {rate.competitors.slice(0, 3).map(comp => (
                          <td key={comp.hotelId} className="py-3 px-4 text-right text-hw-navy-700">
                            {formatBRL(comp.price)}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <PositionBadge position={rate.position} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Gradient + CTA overlay over locked rows */}
            {rates.length > horizonDays && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-lg" />
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 gap-2 text-center">
                  <Lock className="w-5 h-5 text-hw-navy-400" />
                  <p className="text-sm font-semibold text-hw-navy-800">
                    Veja os próximos 90 dias no plano Insight
                  </p>
                  <p className="text-xs text-hw-navy-500">
                    {rates.length - horizonDays} dias bloqueados
                  </p>
                  <Link to="/billing">
                    <Button size="sm" variant="primary">
                      Fazer upgrade
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'purple' | 'navy' | 'green' | 'red' | 'yellow';
  subtitle?: string;
}) {
  const colorClasses = {
    purple: 'bg-hw-purple-100 text-hw-purple',
    navy: 'bg-hw-navy-100 text-hw-navy-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-hw-navy-900">{value}</p>
          <p className="text-sm text-hw-navy-500">{title}</p>
          {subtitle && <p className="text-xs text-hw-navy-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// Position Badge Component
function PositionBadge({ position }: { position: 'cheaper' | 'average' | 'expensive' | null }) {
  if (!position) return <span className="text-hw-navy-400">--</span>;

  const config = {
    cheaper: { label: 'Mais barato', className: 'bg-green-100 text-green-700' },
    average: { label: 'Na média', className: 'bg-yellow-100 text-yellow-700' },
    expensive: { label: 'Mais caro', className: 'bg-red-100 text-red-700' },
  };

  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium', config[position].className)}>
      {config[position].label}
    </span>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-hw-purple-100 rounded-full flex items-center justify-center mb-4">
        <DollarSign className="w-8 h-8 text-hw-purple" />
      </div>
      <h2 className="text-xl font-semibold text-hw-navy-900 mb-2">Nenhum hotel cadastrado</h2>
      <p className="text-hw-navy-500 max-w-md mb-4">
        Adicione seu hotel e seus concorrentes para começar a comparar tarifas.
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
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatBRL(value: number | null | undefined): string {
  if (value == null) return '--';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
