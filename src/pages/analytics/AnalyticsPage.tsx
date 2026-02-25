import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TimelineChart } from '../../components/analytics/TimelineChart';
import { CategoryCard } from '../../components/analytics/CategoryCard';
import { CategoryAlertsBar } from '../../components/analytics/CategoryAlertsBar';
import {
  getHotels,
  getReviewsTimeline,
  getReviewCategories,
  getReviewCategoryAlerts,
  getReviewCategoryTrend,
  getAiReviewSummary,
  type ReviewSource,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  BarChart2,
  GitCompare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { analyticsSteps } from '../../tour/steps/analytics';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

type TimeRange = '7d' | '30d' | '90d';

export function AnalyticsPage() {
  const { user } = useAuth();
  const canAccessTimeline = user?.limits.hasTimeline ?? false;
  const canAccessAlerts = user?.limits.hasAlerts ?? false;

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [aiForceRefresh, setAiForceRefresh] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<ReviewSource[]>(['BOOKING', 'GOOGLE', 'TRIPADVISOR']);
  // compareMode: null = off, [] = all competitors, [...ids] = specific competitors
  const [compareMode, setCompareMode] = useState<string[] | null>(null);

  // If all sources selected, send undefined (no filter); otherwise send selected
  const ALL_SOURCES: ReviewSource[] = ['BOOKING', 'GOOGLE', 'TRIPADVISOR'];
  const sourcesParam = selectedSources.length === ALL_SOURCES.length ? undefined : selectedSources;

  // When compareMode is active, pass it; otherwise pass undefined
  const compareModeParam = compareMode !== null ? { competitorIds: compareMode } : undefined;

  const toggleSource = (source: ReviewSource) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.length > 1 ? prev.filter((s) => s !== source) : prev // keep at least one
        : [...prev, source]
    );
  };

  const toggleCompetitor = (competitorId: string) => {
    setCompareMode((prev) => {
      if (prev === null) return [competitorId];
      if (prev.includes(competitorId)) {
        // If removing would leave empty, means "all" — keep empty (= all)
        return prev.filter((id) => id !== competitorId);
      }
      return [...prev, competitorId];
    });
  };

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['reviews-timeline', timeRange, selectedSources, compareMode],
    queryFn: () => getReviewsTimeline(timeRange, undefined, sourcesParam, compareModeParam),
    enabled: canAccessTimeline,
    staleTime: 1000 * 60 * 5,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['reviews-categories', selectedSources, compareMode],
    queryFn: () => getReviewCategories(undefined, sourcesParam, compareModeParam),
    staleTime: 1000 * 60 * 5,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['reviews-category-alerts', selectedSources],
    queryFn: () => getReviewCategoryAlerts(undefined, sourcesParam),
    enabled: canAccessAlerts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: categoryTrend, isLoading: categoryTrendLoading } = useQuery({
    queryKey: ['reviews-category-trend', selectedCategoryId],
    queryFn: () => getReviewCategoryTrend(selectedCategoryId!, undefined),
    enabled: !!selectedCategoryId,
    staleTime: 1000 * 60 * 5,
  });

  const ownHotelId = hotelsData?.ownHotels?.[0]?.id;
  const { data: aiSummary, isLoading: aiLoading, isSuccess: aiSuccess } = useQuery({
    queryKey: ['ai-review-summary', ownHotelId, aiForceRefresh],
    queryFn: () => getAiReviewSummary(ownHotelId!, aiForceRefresh),
    enabled: !!ownHotelId,
    staleTime: 1000 * 60 * 60,
  });

  // After a forced refresh completes, reset the flag so next visit uses cache normally
  useEffect(() => {
    if (aiForceRefresh && aiSuccess) setAiForceRefresh(false);
  }, [aiForceRefresh, aiSuccess]);

  const competitorHotels = hotelsData?.competitorHotels || [];
  const canCompare = competitorHotels.length > 0;

  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const handleTourCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        stopTour();
        markTourSeen('analytics');
      }
    },
    [stopTour, markTourSeen]
  );

  const handleCategoryClick = (id: string, name: string) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    } else {
      setSelectedCategoryId(id);
      setSelectedCategoryName(name);
    }
  };

  const categoryTrendChartData =
    categoryTrend?.points.map((p) => ({
      date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Nota: p.score,
    })) || [];

  return (
    <div className="space-y-6">
      <Joyride
        steps={analyticsSteps}
        run={isRunning && currentPage === 'analytics'}
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

      <div data-tour="analytics-header">
        <PageHeader
          title="Analytics"
          description="Tendências de reputação, análise por categoria e alertas inteligentes."
        />
      </div>

      {/* Header */}
      <div data-tour="analytics-source-filter" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          {/* Source filter checkboxes */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'BOOKING' as ReviewSource, label: 'Booking.com', color: '#60a5fa', available: true },
              { key: 'GOOGLE' as ReviewSource, label: 'Google', color: '#818cf8', available: false },
              { key: 'TRIPADVISOR' as ReviewSource, label: 'TripAdvisor', color: '#34d399', available: true },
            ] as const).map(({ key, label, color, available }) => {
              const active = selectedSources.includes(key);
              if (!available) {
                return (
                  <div
                    key={key}
                    title="Em breve"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--surface-border)',
                      color: 'var(--text-muted)',
                      opacity: 0.5,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                    {label}
                    <span className="ml-0.5 text-[10px] opacity-70">em breve</span>
                  </div>
                );
              }
              return (
                <button
                  key={key}
                  onClick={() => toggleSource(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: active ? `${color}22` : 'var(--surface-secondary)',
                    borderColor: active ? color : 'var(--surface-border)',
                    color: active ? color : 'var(--text-muted)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? color : 'var(--text-muted)' }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── CATEGORY ALERTS BANNER ── */}
      <div data-tour="analytics-alerts">
        {canAccessAlerts ? (
          alertsData && alertsData.alerts.length > 0 ? (
            <CategoryAlertsBar alerts={alertsData.alerts} />
          ) : null
        ) : (
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
              >
                <Lock className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Alertas de categoria
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Disponível a partir do plano Insight
                </p>
              </div>
            </div>
            <Link to="/billing">
              <Button variant="secondary" size="sm">
                Fazer upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── AI SUMMARY ── */}
      <div data-tour="analytics-ai-summary">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle>Análise IA</CardTitle>
                <CardDescription>Pontos fortes, fracos e insights das avaliações</CardDescription>
              </div>
            </div>
            <button
              onClick={() => setAiForceRefresh(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Atualizar análise"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {aiLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
              <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Analisando com IA...
              </span>
            </div>
          )}

          {!aiLoading && !aiSummary && (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="text-sm">
                Análise IA não disponível. Verifique se há avaliações sincronizadas.
              </p>
            </div>
          )}

          {aiSummary && !aiLoading && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {aiSummary.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}
                >
                  <h4
                    className="text-sm font-semibold mb-2 flex items-center gap-1"
                    style={{ color: '#10b981' }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1">
                    {aiSummary.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <h4
                    className="text-sm font-semibold mb-2 flex items-center gap-1"
                    style={{ color: '#ef4444' }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Pontos Fracos
                  </h4>
                  <ul className="space-y-1">
                    {aiSummary.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }}>-</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {aiSummary.trendInsight && (
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.06))',
                    border: '1px solid rgba(79,70,229,0.15)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-semibold" style={{ color: '#818cf8' }}>Insight: </span>
                    {aiSummary.trendInsight}
                  </p>
                </div>
              )}

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Baseado em {aiSummary.reviewCount} avaliações. Gerado em{' '}
                {new Date(aiSummary.generatedAt).toLocaleDateString('pt-BR')}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Competitor comparison bar */}
      {canCompare && (
        <div data-tour="analytics-competitor-bar">
        <div
          className="flex flex-wrap items-center gap-2 p-3 rounded-xl"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: compareMode !== null
              ? '1px solid rgba(245,158,11,0.35)'
              : '1px solid var(--surface-border)',
          }}
        >
          <button
            onClick={() => setCompareMode(compareMode !== null ? null : [])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: compareMode !== null ? 'rgba(245,158,11,0.15)' : 'var(--surface-secondary)',
              border: compareMode !== null ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--surface-border)',
              color: compareMode !== null ? '#f59e0b' : 'var(--text-muted)',
            }}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {compareMode !== null ? 'Comparando' : 'Comparar com concorrentes'}
          </button>

          {compareMode !== null && (
            <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Mostrar:
              </span>
              <button
                onClick={() => setCompareMode([])}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                style={{
                  backgroundColor: compareMode.length === 0 ? 'rgba(245,158,11,0.15)' : 'var(--surface-secondary)',
                  borderColor: compareMode.length === 0 ? '#f59e0b' : 'var(--surface-border)',
                  color: compareMode.length === 0 ? '#f59e0b' : 'var(--text-muted)',
                }}
              >
                Todos
              </button>
              {competitorHotels.map((h) => {
                const active = compareMode.length === 0 || compareMode.includes(h.id);
                const selectedSpecific = compareMode.length > 0 && compareMode.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleCompetitor(h.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border truncate max-w-[140px]"
                    style={{
                      backgroundColor: selectedSpecific ? 'rgba(245,158,11,0.12)' : 'var(--surface-secondary)',
                      borderColor: selectedSpecific ? '#f59e0b' : active && compareMode.length === 0 ? 'rgba(245,158,11,0.25)' : 'var(--surface-border)',
                      color: selectedSpecific ? '#f59e0b' : active ? 'var(--text-secondary)' : 'var(--text-muted)',
                      opacity: !active && compareMode.length > 0 ? 0.5 : 1,
                    }}
                    title={h.name}
                  >
                    {h.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
        </div>
      )}

      {/* ── REPUTATION TIMELINE ── */}
      <div data-tour="analytics-timeline">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Linha do Tempo de Reputação
              </CardTitle>
              <CardDescription>Evolução da nota média ao longo do tempo</CardDescription>
            </div>
            {canAccessTimeline && (
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                {(['7d', '30d', '90d'] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
                    style={
                      timeRange === r
                        ? {
                            backgroundColor: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    {r === '7d' ? '7 dias' : r === '30d' ? '30 dias' : '90 dias'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!canAccessTimeline ? (
            <div className="relative">
              <div
                className="h-48 rounded-xl blur-sm"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(30,35,55,0.88)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  Timeline disponível no plano Insight
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Acompanhe a evolução da sua nota ao longo do tempo
                </p>
                <Link to="/billing">
                  <Button variant="primary" size="sm">
                    Fazer upgrade
                  </Button>
                </Link>
              </div>
            </div>
          ) : timelineLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
          ) : (
            <TimelineChart
              points={timelineData?.points || []}
              competitorPoints={compareMode !== null ? (timelineData?.competitorPoints ?? null) : null}
              range={timeRange}
            />
          )}
        </CardContent>
      </Card>
      </div>


      {/* ── CATEGORY SCORES GRID ── */}
      <div data-tour="analytics-categories">
      <Card>
        <CardHeader>
          <CardTitle>Pontuação por Categoria</CardTitle>
          <CardDescription>
            {compareMode !== null
              ? 'Nota média por categoria — Meu Hotel vs Concorrentes (últimos 30 dias)'
              : 'Nota média por categoria nos últimos 30 dias · Clique para ver evolução'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
          ) : (categoriesData?.categories || []).length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="text-sm">
                Dados de categorias ainda não disponíveis.
                <br />
                Pode levar até 24h após a primeira sincronização.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(categoriesData?.categories || []).map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isSelected={selectedCategoryId === cat.id}
                    onClick={() => handleCategoryClick(cat.id, cat.name)}
                    showCompetitor={compareMode !== null}
                  />
                ))}
              </div>

              {/* Category Trend Chart (conditional) */}
              {selectedCategoryId && (
                <div
                  className="mt-5 rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))',
                    border: '1px solid rgba(79,70,229,0.15)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
                      >
                        {selectedCategoryName} — evolução da nota
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Tendência semanal
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setSelectedCategoryName(null);
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '';
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {categoryTrendLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2
                        className="w-5 h-5 animate-spin"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    </div>
                  ) : categoryTrendChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart
                        data={categoryTrendChartData}
                        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="catGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b95b0' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#8b95b0' }} width={28} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '10px',
                            color: 'var(--text-primary)',
                          }}
                          formatter={(v: number) => [v.toFixed(2), 'Nota']}
                        />
                        <Area
                          type="monotone"
                          dataKey="Nota"
                          stroke="#818cf8"
                          fill="url(#catGradient)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#818cf8', stroke: 'var(--surface-card)', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p
                      className="text-sm text-center py-8"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Sem dados de tendência para esta categoria
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>

    </div>
  );
}
