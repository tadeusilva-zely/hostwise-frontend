import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { mockRates, getRatesSummary, getOwnHotels, getCompetitorHotels } from '../../mocks';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Calendar,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, DonutChart, Legend } from '@tremor/react';

export function RatesPage() {
  const [selectedDays, setSelectedDays] = useState<7 | 15 | 30>(30);

  const ownHotels = getOwnHotels();
  const competitorHotels = getCompetitorHotels();
  const summary = getRatesSummary();
  const rates = mockRates.slice(0, selectedDays);

  // Check if user has hotels
  if (ownHotels.length === 0) {
    return <EmptyState />;
  }

  // Chart data
  const chartData = rates.map(r => ({
    date: formatDateShort(r.date),
    'Meu Hotel': r.myHotel,
    'Media Concorrentes': r.avgCompetitor,
  }));

  // Position distribution for donut chart
  const positionData = [
    { name: 'Mais barato', value: summary.cheaper, color: 'emerald' },
    { name: 'Na media', value: summary.average, color: 'amber' },
    { name: 'Mais caro', value: summary.expensive, color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Espiao de Tarifas</h1>
          <p className="text-hw-navy-500 mt-1">
            Compare seus precos com a concorrencia
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-hw-navy-100 rounded-lg p-1">
          {[7, 15, 30].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days as 7 | 15 | 30)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                selectedDays === days
                  ? 'bg-white text-hw-navy-900 shadow-sm'
                  : 'text-hw-navy-600 hover:text-hw-navy-900'
              )}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Minha Tarifa Media"
          value={`R$ ${summary.avgMyHotel}`}
          icon={DollarSign}
          color="purple"
        />
        <SummaryCard
          title="Media Concorrentes"
          value={`R$ ${summary.avgCompetitors}`}
          icon={Building2}
          color="navy"
        />
        <SummaryCard
          title="Diferenca"
          value={`${summary.avgDiff > 0 ? '+' : ''}${summary.avgDiff}%`}
          icon={summary.avgDiff > 0 ? TrendingUp : summary.avgDiff < 0 ? TrendingDown : Minus}
          color={summary.avgDiff > 0 ? 'red' : summary.avgDiff < 0 ? 'green' : 'yellow'}
          subtitle={summary.avgDiff > 0 ? 'Acima da media' : summary.avgDiff < 0 ? 'Abaixo da media' : 'Na media'}
        />
        <SummaryCard
          title="Dias Mais Barato"
          value={`${summary.cheaper}/${summary.total}`}
          icon={TrendingDown}
          color="green"
          subtitle={`${Math.round((summary.cheaper / summary.total) * 100)}% dos dias`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Evolution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolucao de Precos</CardTitle>
            <CardDescription>Comparativo dos ultimos {selectedDays} dias</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={chartData}
              index="date"
              categories={['Meu Hotel', 'Media Concorrentes']}
              colors={['violet', 'slate']}
              valueFormatter={(value) => `R$ ${value}`}
              showLegend={true}
              showAnimation={true}
            />
          </CardContent>
        </Card>

        {/* Position Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Posicionamento</CardTitle>
            <CardDescription>Sua posicao em relacao aos concorrentes</CardDescription>
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
              categories={['Mais barato', 'Na media', 'Mais caro']}
              colors={['emerald', 'amber', 'rose']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Competitor Prices Today */}
      <Card>
        <CardHeader>
          <CardTitle>Precos de Hoje</CardTitle>
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
                  <p className="font-semibold text-hw-navy-900">{ownHotels[0]?.name}</p>
                  <p className="text-sm text-hw-navy-500">Meu Hotel</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-hw-purple">R$ {rates[0]?.myHotel}</p>
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
                    <p className="text-xl font-bold text-hw-navy-900">R$ {comp.price}</p>
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

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Tarifas</CardTitle>
          <CardDescription>Detalhamento diario das tarifas</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <th className="text-right py-3 px-4 font-semibold text-hw-navy-700">Posicao</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, idx) => (
                  <tr key={rate.date} className={cn(
                    'border-b border-hw-navy-50',
                    idx % 2 === 0 && 'bg-hw-navy-50/50'
                  )}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-hw-navy-400" />
                        {formatDateFull(rate.date)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-hw-purple">
                      R$ {rate.myHotel}
                    </td>
                    {rate.competitors.slice(0, 3).map(comp => (
                      <td key={comp.hotelId} className="py-3 px-4 text-right text-hw-navy-700">
                        R$ {comp.price}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right">
                      <PositionBadge position={rate.position} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
    average: { label: 'Na media', className: 'bg-yellow-100 text-yellow-700' },
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
        Adicione seu hotel e seus concorrentes para comecar a comparar tarifas.
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
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
