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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Erro ao carregar tarifas</h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const summary = data?.summary || { avgMyHotel: 0, avgCompetitors: 0, avgDiff: 0, cheaper: 0, expensive: 0, average: 0, total: 0 };
  const realRates = data?.rates || [];
  const hotels = data?.hotels || [];

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

  if (!ownHotel) {
    return <EmptyState />;
  }

  if (realRates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Espião de Tarifas
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Compare seus preços com a concorrência</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Dados ainda sendo coletados</h2>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Os dados de tarifas estarão disponíveis após a primeira coleta do Booking.com.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = realRates.map(r => ({
    date: formatDateShort(r.date),
    'Meu Hotel': r.myHotel,
    'Média Concorrentes': r.avgCompetitor,
  }));

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
            Espião de Tarifas
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Compare seus preços com a concorrência
          </p>
        </div>

        <div className="flex items-center gap-4">
          <HotelSelector
            ownHotels={hotelsData?.ownHotels || []}
            competitorHotels={hotelsData?.competitorHotels || []}
            selectedHotelId={selectedHotelId}
            onChange={setSelectedHotelId}
          />

          {/* Period Selector */}
          <div
            data-tour="rates-period-selector"
            className="flex rounded-lg p-1"
            style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
          >
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
                    locked ? 'cursor-not-allowed' : ''
                  )}
                  style={
                    selectedDays === days && !locked
                      ? { backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }
                      : { color: locked ? 'var(--text-muted)' : 'var(--text-muted)' }
                  }
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
          color="indigo"
        />
        <SummaryCard
          title="Média Concorrentes"
          value={formatBRL(summary.avgCompetitors)}
          icon={Building2}
          color="muted"
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompetitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b95b0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b95b0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" interval={0} tick={{ fontSize: 12, fill: '#8b95b0' }} />
                  <YAxis tickFormatter={(v) => formatBRL(v)} tick={{ fontSize: 11, fill: '#8b95b0' }} width={90} />
                  <Tooltip
                    formatter={(value: number) => formatBRL(value)}
                    contentStyle={{ backgroundColor: '#1e2337', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#fff' }}
                  />
                  <RechartLegend />
                  <Area type="monotone" dataKey="Meu Hotel" stroke="#4f46e5" fill="url(#colorMyHotel)" strokeWidth={2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="Média Concorrentes" stroke="#8b95b0" fill="url(#colorCompetitors)" strokeWidth={2} dot={{ r: 3 }} />
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
                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))', border: '1px solid rgba(79,70,229,0.3)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ownHotel?.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Meu Hotel</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>
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
                    <div
                      key={comp.hotelId}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--surface-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'var(--surface-card)' }}
                        >
                          <Building2 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{comp.hotelName}</p>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Concorrente</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {formatBRL(comp.price)}
                        </p>
                        {diff !== null && (
                          <span className={cn(
                            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded',
                            diff < 0 ? 'bg-green-900/30 text-green-400' : diff > 0 ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
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
                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Data</th>
                      <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Meu Hotel</th>
                      {competitorHotels.slice(0, 3).map(h => (
                        <th key={h.id} className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {h.name.split(' ').slice(0, 2).join(' ')}
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate, idx) => {
                      const isLocked = idx >= horizonDays;
                      return (
                        <tr
                          key={rate.date}
                          className={cn(isLocked && 'blur-sm select-none pointer-events-none')}
                          style={{
                            borderBottom: '1px solid var(--surface-border)',
                            backgroundColor: idx % 2 === 0 ? 'var(--surface-secondary)' : undefined,
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                              <span style={{ color: 'var(--text-secondary)' }}>{formatDateFull(rate.date)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold" style={{ color: '#818cf8' }}>
                            {formatBRL(rate.myHotel)}
                          </td>
                          {rate.competitors.slice(0, 3).map(comp => (
                            <td key={comp.hotelId} className="py-3 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>
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
                  <div
                    className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none rounded-b-lg"
                    style={{ background: 'linear-gradient(to top, var(--surface-card) 0%, rgba(30,35,55,0.95) 60%, transparent 100%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 gap-2 text-center">
                    <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Veja os próximos 90 dias no plano Insight
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: 'indigo' | 'muted' | 'green' | 'red' | 'yellow';
  subtitle?: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'rgba(79,70,229,0.15)', icon: '#818cf8' },
    muted: { bg: 'rgba(139,149,176,0.15)', icon: '#8b95b0' },
    green: { bg: 'rgba(16,185,129,0.15)', icon: '#10b981' },
    red: { bg: 'rgba(239,68,68,0.15)', icon: '#f87171' },
    yellow: { bg: 'rgba(245,158,11,0.15)', icon: '#fbbf24' },
  };

  const colors = colorMap[color] || colorMap.muted;

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
          <Icon className="w-6 h-6" style={{ color: colors.icon }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{title}</p>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// Position Badge Component
function PositionBadge({ position }: { position: 'cheaper' | 'average' | 'expensive' | null }) {
  if (!position) return <span style={{ color: 'var(--text-muted)' }}>--</span>;

  const config = {
    cheaper: { label: 'Mais barato', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    average: { label: 'Na média', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    expensive: { label: 'Mais caro', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  };

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{ backgroundColor: config[position].bg, color: config[position].color }}
    >
      {config[position].label}
    </span>
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
        <DollarSign className="w-8 h-8" style={{ color: '#818cf8' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum hotel cadastrado</h2>
      <p className="max-w-md mb-4" style={{ color: 'var(--text-muted)' }}>
        Adicione seu hotel e seus concorrentes para começar a comparar tarifas.
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
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatBRL(value: number | null | undefined): string {
  if (value == null) return '--';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
