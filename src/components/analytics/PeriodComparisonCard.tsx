import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PeriodData {
  avgRating: number;
  totalReviews: number;
  responseRate: number;
  startDate: string;
  endDate: string;
}

interface PeriodComparisonCardProps {
  current: PeriodData;
  previous: PeriodData;
  deltas: {
    avgRating: number;
    totalReviews: number;
    responseRate: number;
  };
}

function DeltaBadge({ delta }: { delta: number }) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        color: isNeutral ? '#8b95b0' : isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isNeutral
          ? 'rgba(139,149,176,0.1)'
          : isPositive
          ? 'rgba(16,185,129,0.1)'
          : 'rgba(239,68,68,0.1)',
      }}
    >
      <Icon className="w-3 h-3" />
      {isPositive ? '+' : ''}{delta > 0 || delta < 0 ? delta.toFixed(1) : '0'}
    </span>
  );
}

function MetricRow({
  label,
  currentValue,
  previousValue,
  delta,
  formatter,
}: {
  label: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  formatter: (v: number) => string;
}) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {formatter(previousValue)}
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {formatter(currentValue)}
        </span>
        <DeltaBadge delta={delta} />
      </div>
    </div>
  );
}

export function PeriodComparisonCard({ current, previous, deltas }: PeriodComparisonCardProps) {
  const fmt = (v: number) => v.toFixed(1);
  const fmtPct = (v: number) => `${v.toFixed(0)}%`;
  const fmtInt = (v: number) => String(Math.round(v));

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const e = new Date(end).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${s} – ${e}`;
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}>
          Comparativo de períodos
        </p>
        <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Anterior: {formatDateRange(previous.startDate, previous.endDate)}</span>
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            Atual: {formatDateRange(current.startDate, current.endDate)}
          </span>
        </div>
      </div>

      <div>
        <MetricRow
          label="Nota Média"
          currentValue={current.avgRating}
          previousValue={previous.avgRating}
          delta={deltas.avgRating}
          formatter={fmt}
        />
        <MetricRow
          label="Total de Avaliações"
          currentValue={current.totalReviews}
          previousValue={previous.totalReviews}
          delta={deltas.totalReviews}
          formatter={fmtInt}
        />
        <div className="flex items-center justify-between py-2">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Taxa de Resposta</p>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {fmtPct(previous.responseRate)}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {fmtPct(current.responseRate)}
            </span>
            <DeltaBadge delta={deltas.responseRate} />
          </div>
        </div>
      </div>
    </div>
  );
}
