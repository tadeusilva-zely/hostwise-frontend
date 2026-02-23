import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  getMe,
  getDashboardSummary,
  getHotels,
  getAiReviewSummary,
  getReviewResponseStats,
  getReviewsSummary,
} from '../../services/api';
import { BarChart, DonutChart } from '@tremor/react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  ArrowRight,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Percent,
  Loader2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  BarChart2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
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
import { dashboardSteps } from '../../tour/steps/dashboard';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function Dashboard() {
  const { user: authUser } = useAuth();
  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const ownHotelId = hotelsData?.ownHotels?.[0]?.id;

  const { data: dashboard, isLoading: dashLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', ownHotelId],
    queryFn: () => getDashboardSummary(ownHotelId),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: aiInsight } = useQuery({
    queryKey: ['ai-review-summary', ownHotelId],
    queryFn: () => getAiReviewSummary(ownHotelId!),
    enabled: !!ownHotelId,
    staleTime: 1000 * 60 * 60,
  });

  const { data: responseStats } = useQuery({
    queryKey: ['reviews-response-stats', ownHotelId],
    queryFn: () => getReviewResponseStats(ownHotelId),
    enabled: !!dashboard,
    staleTime: 0,
  });

  const { data: reviewsSummary } = useQuery({
    queryKey: ['reviews-summary', ownHotelId],
    queryFn: () => getReviewsSummary(ownHotelId),
    enabled: !!ownHotelId,
    staleTime: 1000 * 60 * 30,
  });

  const handleTourCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        stopTour();
        markTourSeen('dashboard');
      }
    },
    [stopTour, markTourSeen]
  );

  const isLoading = userLoading || dashLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: 'var(--accent-primary)' }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Erro ao carregar dashboard
        </h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Tente novamente mais tarde.
        </p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hotels = dashboard?.hotels || { ownCount: 0, competitorCount: 0 };
  const rates = dashboard?.rates || {
    avgMyHotel: 0,
    avgCompetitors: 0,
    avgDiff: 0,
    cheaper: 0,
    expensive: 0,
    average: 0,
    total: 0,
    chartData: [],
  };
  const reviews = dashboard?.reviews || {
    avgRating: 0,
    totalReviews: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    competitorAvgRating: 0,
    diff: 0,
  };
  const occupancy = dashboard?.occupancy || {
    avgMyHotel: 0,
    avgCompetitor: 0,
    diff: 0,
    avgWeekend: 0,
    avgWeekday: 0,
    highest: { date: '', occupancy: 0 },
    lowest: { date: '', occupancy: 0 },
  };

  const hasHotels = hotels.ownCount > 0;

  const isTrialActive = user?.isTrialActive;
  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;
  const isPromoTrial = user?.plan !== 'STARTER' && user?.isTrialActive;
  const TRIAL_TOTAL_DAYS = 7;
  const trialProgress = isPromoTrial
    ? 0
    : Math.round(((TRIAL_TOTAL_DAYS - trialDaysLeft) / TRIAL_TOTAL_DAYS) * 100);
  const isTrialExpired =
    !isTrialActive &&
    user?.plan === 'STARTER' &&
    user?.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date();

  const miniChartData = rates.chartData.map((r) => ({
    date: r.date.slice(8) + '/' + r.date.slice(5, 7),
    'Meu Hotel': r.myHotel,
    Concorrentes: r.competitors,
  }));

  // Trial expired — upgrade wall
  if (isTrialExpired) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
          >
            Seu período de teste encerrou
          </h1>
          <p className="mb-6 text-base" style={{ color: 'var(--text-muted)' }}>
            Você usou os {TRIAL_TOTAL_DAYS} dias gratuitos do HostWise. Escolha um plano para
            continuar monitorando avaliações, tarifas e ocupação do seu hotel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Star, label: 'Avaliações', color: '#10b981' },
              { icon: DollarSign, label: 'Espião de Tarifas', color: '#4f46e5' },
              { icon: Calendar, label: 'Sensor de Ocupação', color: '#7c3aed' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="p-3 rounded-xl text-center"
                style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
              >
                <Icon className="w-6 h-6 mx-auto mb-1" style={{ color }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <Link to="/billing">
            <Button variant="primary" size="lg" className="w-full shadow-lg">
              Ver planos e continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Planos a partir de R$ 57/mês · Cancele quando quiser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Joyride
        steps={dashboardSteps}
        run={isRunning && currentPage === 'dashboard'}
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

      {/* Welcome */}
      <div
        data-tour="dashboard-welcome"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
          >
            Olá, {authUser?.name?.split(' ')[0] || 'Hoteleiro'}!
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {hasHotels
              ? 'Aqui está o resumo de reputação do seu hotel.'
              : 'Bem-vindo ao HostWise. Cadastre seu hotel para começar.'}
          </p>
        </div>
      </div>

      {/* Trial / Promo Banner */}
      {isTrialActive && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: isPromoTrial
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.08))'
              : 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.08))',
            border: isPromoTrial
              ? '1px solid rgba(16,185,129,0.25)'
              : '1px solid rgba(79,70,229,0.25)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isPromoTrial
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isPromoTrial ? (
                    <>
                      Plano {user?.plan?.charAt(0) + user?.plan?.slice(1).toLowerCase()} ativo —{' '}
                      <span style={{ color: trialDaysLeft <= 7 ? '#ef4444' : '#10b981' }}>
                        {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
                      </span>
                    </>
                  ) : (
                    <>
                      Período de teste ativo —{' '}
                      <span style={{ color: trialDaysLeft <= 2 ? '#ef4444' : '#818cf8' }}>
                        {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {isPromoTrial
                    ? 'Aproveite todos os recursos do seu plano durante o período promocional.'
                    : 'Faça upgrade antes de terminar para não perder o acesso.'}
                </p>
              </div>
            </div>
            {!isPromoTrial && (
              <Link to="/billing" className="flex-shrink-0">
                <Button variant="primary" size="sm">
                  Fazer upgrade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
          {!isPromoTrial && (
            <>
              <div
                className="w-full rounded-full h-1.5"
                style={{ backgroundColor: 'rgba(79,70,229,0.2)' }}
              >
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${trialProgress}%`,
                    backgroundColor: trialDaysLeft <= 2 ? '#ef4444' : '#4f46e5',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Início</span>
                <span>
                  Dia {TRIAL_TOTAL_DAYS - trialDaysLeft} de {TRIAL_TOTAL_DAYS}
                </span>
                <span>Fim do trial</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* No Hotels State */}
      {!hasHotels ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-16 px-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h2
                className="text-2xl lg:text-3xl font-bold mb-3"
                style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
              >
                Bem-vindo ao HostWise!
              </h2>
              <p className="mb-8 max-w-lg mx-auto text-base lg:text-lg" style={{ color: 'var(--text-muted)' }}>
                Comece cadastrando seu hotel para desbloquear o monitoramento inteligente de
                avaliações, tarifas e ocupação.
              </p>
              <Link to="/hotels">
                <Button variant="primary" size="lg" className="shadow-lg">
                  <Building2 className="w-5 h-5 mr-2" />
                  Cadastrar Meu Hotel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Star,
                label: 'Avaliações',
                desc: 'Monitore e responda com IA às avaliações do seu hotel.',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.1)',
              },
              {
                icon: DollarSign,
                label: 'Espião de Tarifas',
                desc: 'Compare seus preços com a concorrência em tempo real.',
                color: '#4f46e5',
                bg: 'rgba(79,70,229,0.1)',
              },
              {
                icon: Percent,
                label: 'Sensor de Lotação',
                desc: 'Acompanhe taxa de ocupação e identifique oportunidades.',
                color: '#7c3aed',
                bg: 'rgba(124,58,237,0.1)',
              },
            ].map(({ icon: Icon, label, desc, color, bg }) => (
              <Card key={label} className="text-center">
                <CardContent className="py-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
                  >
                    {label}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── REPUTATION HERO ROW ── */}
          <div
            data-tour="dashboard-stats"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Nota Média */}
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
                >
                  <Star className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}>
                    {reviews.avgRating}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nota Média
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Resposta */}
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(79,70,229,0.12)' }}
                >
                  <MessageSquare className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}>
                    {responseStats?.responseRate ?? '—'}
                    {responseStats ? '%' : ''}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Taxa de Resposta
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pendentes */}
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
                >
                  <AlertCircle className="w-6 h-6" style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}>
                    {responseStats?.totalPending ?? '—'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Respostas Pendentes
                  </p>
                  {responseStats && responseStats.pendingNegative > 0 && (
                    <Link
                      to={{ pathname: '/reviews', search: `?sentiment=negative&responseStatus=PENDING${ownHotelId ? `&hotelId=${ownHotelId}` : ''}`, hash: '#reviews-list' }}
                      className="text-xs font-medium mt-1 flex items-center gap-1 hover:opacity-80 transition-opacity"
                      style={{ color: '#ef4444' }}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                      {responseStats.pendingNegative} urgente{responseStats.pendingNegative !== 1 ? 's' : ''} · {responseStats.totalPending - responseStats.pendingNegative} outras
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* vs Concorrentes */}
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor:
                      reviews.diff > 0
                        ? 'rgba(16,185,129,0.12)'
                        : reviews.diff < 0
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(139,149,176,0.12)',
                  }}
                >
                  {reviews.diff > 0 ? (
                    <TrendingUp className="w-6 h-6" style={{ color: '#10b981' }} />
                  ) : reviews.diff < 0 ? (
                    <TrendingDown className="w-6 h-6" style={{ color: '#ef4444' }} />
                  ) : (
                    <Minus className="w-6 h-6" style={{ color: '#8b95b0' }} />
                  )}
                </div>
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color:
                        reviews.diff > 0
                          ? '#10b981'
                          : reviews.diff < 0
                          ? '#ef4444'
                          : 'var(--text-primary)',
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {reviews.diff > 0 ? '+' : ''}{reviews.diff}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    vs Concorrentes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── AI INSIGHT BANNER ── */}
          {user?.limits.maxReviews ? (
            // STARTER: locked
            <Card className="relative overflow-hidden">
              <div className="blur-sm pointer-events-none select-none">
                <CardContent className="flex items-start gap-4 py-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--surface-border)' }} />
                    <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--surface-border)' }} />
                    <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--surface-border)' }} />
                  </div>
                </CardContent>
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(30,35,55,0.9)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                  Análise IA de Avaliações
                </p>
                <p className="text-sm mb-4 text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Disponível a partir do plano Insight — resumo automático, pontos fortes e fracos.
                </p>
                <Link to="/billing">
                  <Button variant="primary" size="sm">
                    Ver planos e fazer upgrade
                  </Button>
                </Link>
              </div>
            </Card>
          ) : aiInsight?.trendInsight ? (
            <div
              className="rounded-2xl p-5 flex items-start gap-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.06))',
                border: '1px solid rgba(79,70,229,0.2)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Insight IA
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {aiInsight.trendInsight}
                </p>
                <Link
                  to="/analytics"
                  className="mt-2 inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#818cf8' }}
                >
                  Ver análise completa
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ) : null}

          {/* ── REVIEW CHARTS ── */}
          {reviewsSummary && (
            <div data-tour="dashboard-review-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Sentimento</CardTitle>
                  <CardDescription>Classificação das avaliações do seu hotel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <DonutChart
                      className="h-40 w-40"
                      data={[
                        { name: 'Positivas', value: reviewsSummary.positive },
                        { name: 'Neutras', value: reviewsSummary.neutral },
                        { name: 'Negativas', value: reviewsSummary.negative },
                      ]}
                      category="value"
                      index="name"
                      colors={['emerald', 'amber', 'rose']}
                      showAnimation
                    />
                    <div className="flex-1 space-y-3">
                      {[
                        { label: 'Positivas', count: reviewsSummary.positive, color: '#10b981' },
                        { label: 'Neutras', count: reviewsSummary.neutral, color: '#f59e0b' },
                        { label: 'Negativas', count: reviewsSummary.negative, color: '#f43f5e' },
                      ].map(({ label, count, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Notas</CardTitle>
                  <CardDescription>Sua nota vs média dos concorrentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    className="h-40"
                    data={[
                      { name: 'Meu Hotel', 'Nota Média': reviewsSummary.myAvgRating ?? reviewsSummary.avgRating },
                      { name: 'Concorrentes', 'Nota Média': reviewsSummary.competitorAvgRating },
                    ]}
                    index="name"
                    categories={['Nota Média']}
                    colors={['indigo']}
                    valueFormatter={(v) => v.toFixed(1)}
                    showAnimation
                  />
                  <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {reviewsSummary.diff >= 0 ? (
                        <>Seu hotel está <span className="font-semibold" style={{ color: '#10b981' }}>{reviewsSummary.diff} pontos acima</span> da média dos concorrentes!</>
                      ) : (
                        <>Seu hotel está <span className="font-semibold" style={{ color: '#ef4444' }}>{Math.abs(reviewsSummary.diff)} pontos abaixo</span> da média dos concorrentes.</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── SECONDARY ROW: Rates + Occupancy ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Mini Rate Chart */}
            <div data-tour="dashboard-price-chart" className="flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Evolução de Tarifas
                      </CardTitle>
                      <CardDescription>Últimos 7 dias</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {rates.avgDiff !== 0 && (
                        <span
                          className="text-sm font-semibold flex items-center gap-1"
                          style={{ color: rates.avgDiff < 0 ? '#10b981' : '#ef4444' }}
                        >
                          {rates.avgDiff < 0 ? (
                            <ArrowDown className="w-4 h-4" />
                          ) : (
                            <ArrowUp className="w-4 h-4" />
                          )}
                          {Math.abs(rates.avgDiff)}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {miniChartData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <AreaChart
                          data={miniChartData}
                          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="dashColorMyHotel" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient
                              id="dashColorCompetitors"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="5%" stopColor="#8b95b0" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#8b95b0" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                          />
                          <XAxis
                            dataKey="date"
                            interval={0}
                            tick={{ fontSize: 11, fill: '#8b95b0' }}
                          />
                          <YAxis
                            tickFormatter={(v) => `R$${v}`}
                            tick={{ fontSize: 10, fill: '#8b95b0' }}
                            width={55}
                          />
                          <Tooltip
                            formatter={(value: number) => [`R$ ${value}`, '']}
                            contentStyle={{
                              backgroundColor: 'var(--surface-card)',
                              border: '1px solid var(--surface-border)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Meu Hotel"
                            stroke="#10b981"
                            fill="url(#dashColorMyHotel)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Concorrentes"
                            stroke="#8b95b0"
                            fill="url(#dashColorCompetitors)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="mt-2 flex items-center justify-center gap-6 text-xs">
                        <span
                          className="flex items-center gap-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                          Meu Hotel
                        </span>
                        <span
                          className="flex items-center gap-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: '#8b95b0' }}
                          />
                          Concorrentes
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      Sem dados de tarifas disponíveis
                    </p>
                  )}
                  <Link
                    to="/rates"
                    className="mt-3 inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#818cf8' }}
                  >
                    Ver análise completa
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Occupancy Summary */}
            <div data-tour="dashboard-occupancy" className="flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Ocupação
                  </CardTitle>
                  <CardDescription>Próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            occupancy.avgMyHotel >= 70
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : occupancy.avgMyHotel >= 50
                              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                              : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        }}
                      >
                        <span className="text-2xl font-bold text-white">
                          {occupancy.avgMyHotel}%
                        </span>
                      </div>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                        Média geral
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[
                        { label: 'Fins de semana', value: `${occupancy.avgWeekend}%` },
                        { label: 'Dias úteis', value: `${occupancy.avgWeekday}%` },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: 'var(--surface-secondary)' }}
                        >
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {label}
                          </span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {occupancy.diff >= 0 ? (
                      <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                    ) : (
                      <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                    )}
                    <span
                      className={cn('text-sm font-medium')}
                      style={{ color: occupancy.diff >= 0 ? '#10b981' : '#ef4444' }}
                    >
                      {occupancy.diff >= 0 ? '+' : ''}
                      {occupancy.diff}% vs concorrentes
                    </span>
                  </div>
                  <Link
                    to="/occupancy"
                    className="mt-3 inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#818cf8' }}
                  >
                    Ver calendário completo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── QUICK LINK TO ANALYTICS ── */}
          <div
            data-tour="dashboard-analytics-link"
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background:
                'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))',
              border: '1px solid rgba(79,70,229,0.15)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
                >
                  Analytics de Reputação
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Timeline, tendências por categoria, alertas e análise IA
                </p>
              </div>
            </div>
            <Link to="/analytics" className="flex-shrink-0">
              <Button variant="secondary" size="sm">
                Ver Analytics
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
