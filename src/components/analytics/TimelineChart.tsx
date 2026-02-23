import { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReviewTimelinePoint } from '../../services/api';

interface TimelineChartProps {
  points: ReviewTimelinePoint[];
  competitorPoints?: ReviewTimelinePoint[] | null;
  range: '7d' | '30d' | '90d';
}

/** Generate all dates in a range so days without reviews still appear on the axis */
function fillDateRange(startDaysAgo: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = startDaysAgo - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function TimelineChart({ points, competitorPoints, range }: TimelineChartProps) {
  const [mode, setMode] = useState<'daily' | 'trend'>('trend');
  const hasCompetitor = competitorPoints !== null && competitorPoints !== undefined;

  // Merge own + competitor data onto the same date axis (with gap-filling)
  const buildMergedData = (own: ReviewTimelinePoint[], comp: ReviewTimelinePoint[] | null | undefined) => {
    const ownMap = new Map(own.map((p) => [p.date, p]));
    const compMap = new Map(comp?.map((p) => [p.date, p]) ?? []);

    return allDatesInRange.map((date) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      rawDate: date,
      'Meu Hotel': ownMap.get(date)?.avgRating ?? null,
      'Meu Hotel Count': ownMap.get(date)?.reviewCount ?? 0,
      Concorrentes: compMap.get(date)?.avgRating ?? null,
      'Concorrentes Count': compMap.get(date)?.reviewCount ?? 0,
    }));
  };

  // Progressive cumulative average for comparison mode
  const buildTrendData = (merged: ReturnType<typeof buildMergedData>) => {
    let ownCumSum = 0, ownCumCount = 0;
    let compCumSum = 0, compCumCount = 0;
    return merged.map((p) => {
      if (p['Meu Hotel'] !== null) {
        ownCumSum += p['Meu Hotel'] * p['Meu Hotel Count'];
        ownCumCount += p['Meu Hotel Count'];
      }
      if (p.Concorrentes !== null) {
        compCumSum += p.Concorrentes * p['Concorrentes Count'];
        compCumCount += p['Concorrentes Count'];
      }
      return {
        date: p.date,
        'Meu Hotel': ownCumCount > 0 ? Math.round((ownCumSum / ownCumCount) * 100) / 100 : null,
        Concorrentes: compCumCount > 0 ? Math.round((compCumSum / compCumCount) * 100) / 100 : null,
      };
    });
  };

  // Fill all dates in the range so the axis is continuous
  const periodDays = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const allDatesInRange = fillDateRange(periodDays);
  const pointsByDate = new Map(points.map((p) => [p.date, p]));

  // Simple (non-comparison) data — with gap-filling
  const dailyData = allDatesInRange.map((d) => {
    const p = pointsByDate.get(d);
    return {
      date: new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Nota: p?.avgRating ?? null,
      reviewCount: p?.reviewCount ?? 0,
    };
  });

  // Progressive cumulative average — each point is the average of ALL reviews from day 1 to that day
  const trendData: { date: string; Tendência: number | null }[] = [];
  let cumSum = 0;
  let cumCount = 0;
  for (const d of allDatesInRange) {
    const p = pointsByDate.get(d);
    if (p) {
      cumSum += p.avgRating * p.reviewCount;
      cumCount += p.reviewCount;
    }
    trendData.push({
      date: new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Tendência: cumCount > 0 ? Math.round((cumSum / cumCount) * 100) / 100 : null,
    });
  }

  const mergedDailyData = hasCompetitor ? buildMergedData(points, competitorPoints) : null;
  const mergedTrendData = hasCompetitor && mergedDailyData ? buildTrendData(mergedDailyData) : null;

  if (points.length === 0 && (!competitorPoints || competitorPoints.length === 0)) {
    return (
      <div
        className="flex items-center justify-center h-48 rounded-xl"
        style={{ backgroundColor: 'var(--surface-secondary)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sem dados suficientes para exibir o gráfico
        </p>
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--surface-card)',
      border: '1px solid var(--surface-border)',
      borderRadius: '12px',
      color: 'var(--text-primary)',
      fontSize: '13px',
    },
    labelStyle: { color: 'var(--text-muted)', marginBottom: '4px' },
  };

  const axisProps = {
    tick: { fontSize: 10, fill: '#8b95b0' },
    width: 30,
  };

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-1 mb-4">
        {(['daily', 'trend'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: mode === m ? 'var(--accent-primary)' : 'var(--surface-secondary)',
              color: mode === m ? '#fff' : 'var(--text-muted)',
            }}
          >
            {m === 'daily' ? 'Por dia' : 'Acumulado'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        {hasCompetitor ? (
          // Comparison mode: two lines
          <LineChart
            data={mode === 'daily' ? (mergedDailyData ?? []) : (mergedTrendData ?? [])}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b95b0' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} {...axisProps} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number, name: string) => [
                value !== null ? value.toFixed(2) : '—',
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
            />
            <Line
              type="monotone"
              dataKey="Meu Hotel"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              activeDot={{ r: 5, fill: '#10b981', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Concorrentes"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              strokeDasharray="5 3"
              activeDot={{ r: 5, fill: '#f59e0b', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
          </LineChart>
        ) : mode === 'daily' ? (
          <AreaChart data={dailyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b95b0' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} {...axisProps} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number | null) => [value !== null ? value.toFixed(2) : '—', 'Nota do dia']}
            />
            <Area
              type="monotone"
              dataKey="Nota"
              stroke="#10b981"
              fill="url(#timelineGradient)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              activeDot={{ r: 5, fill: '#10b981', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b95b0' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} {...axisProps} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number | null) => [value !== null ? value.toFixed(2) : '—', 'Média acumulada']}
            />
            <Area
              type="monotone"
              dataKey="Tendência"
              stroke="#6366f1"
              fill="url(#trendGradient)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              activeDot={{ r: 5, fill: '#6366f1', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
