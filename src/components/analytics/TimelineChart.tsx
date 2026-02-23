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
}

export function TimelineChart({ points, competitorPoints }: TimelineChartProps) {
  const [mode, setMode] = useState<'daily' | 'trend'>('daily');
  const hasCompetitor = competitorPoints !== null && competitorPoints !== undefined;

  // Merge own + competitor data onto the same date axis
  const buildMergedData = (own: ReviewTimelinePoint[], comp: ReviewTimelinePoint[] | null | undefined) => {
    const compMap = new Map(comp?.map((p) => [p.date, p]) ?? []);
    const allDates = new Set([...own.map((p) => p.date), ...(comp?.map((p) => p.date) ?? [])]);
    const ownMap = new Map(own.map((p) => [p.date, p]));

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        rawDate: date,
        'Meu Hotel': ownMap.get(date)?.avgRating ?? null,
        Concorrentes: compMap.get(date)?.avgRating ?? null,
      }));
  };

  const buildTrendData = (merged: ReturnType<typeof buildMergedData>) => {
    return merged.map((p, i) => {
      const window = merged.slice(Math.max(0, i - 6), i + 1);
      const ownValues = window.map((w) => w['Meu Hotel']).filter((v): v is number => v !== null);
      const compValues = window.map((w) => w['Concorrentes']).filter((v): v is number => v !== null);
      return {
        date: p.date,
        'Meu Hotel':
          ownValues.length > 0
            ? Math.round((ownValues.reduce((a, b) => a + b, 0) / ownValues.length) * 100) / 100
            : null,
        Concorrentes:
          compValues.length > 0
            ? Math.round((compValues.reduce((a, b) => a + b, 0) / compValues.length) * 100) / 100
            : null,
      };
    });
  };

  // Simple (non-comparison) data
  const dailyData = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Nota: p.avgRating,
    reviewCount: p.reviewCount,
  }));

  const trendData = points.map((p, i) => {
    const window = points.slice(Math.max(0, i - 6), i + 1);
    const movingAvg =
      Math.round((window.reduce((sum, w) => sum + w.avgRating, 0) / window.length) * 100) / 100;
    return {
      date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Tendência: movingAvg,
    };
  });

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
            {m === 'daily' ? 'Por dia' : 'Acumulado (7d)'}
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
              formatter={(value: number) => [value.toFixed(2), 'Nota do dia']}
            />
            <Area
              type="monotone"
              dataKey="Nota"
              stroke="#10b981"
              fill="url(#timelineGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#10b981', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b95b0' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} {...axisProps} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [value.toFixed(2), 'Média móvel (7d)']}
            />
            <Line
              type="monotone"
              dataKey="Tendência"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#6366f1', stroke: 'var(--surface-card)', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
