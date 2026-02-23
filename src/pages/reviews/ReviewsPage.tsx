import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HotelSelector } from '../../components/ui/HotelSelector';
import { SmartReplyPanel } from '../../components/reviews/SmartReplyPanel';
import {
  getReviews,
  getReviewsSummary,
  getHotels,
  getAiReviewSummary,
  getReviewResponseStats,
  markReviewAnswered,
} from '../../services/api';
import type { ReviewWithHotel, AiReviewSummary } from '../../services/api';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Building2,
  User,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { BarChart, DonutChart } from '@tremor/react';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsSteps } from '../../tour/steps/reviews';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function ReviewsPage() {
  const { user } = useAuth();
  const maxReviews = user?.limits.maxReviews ?? null;
  const canSmartReply = user?.limits.hasSmartReply ?? false;

  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>(
    (searchParams.get('sentiment') as 'negative' | 'neutral' | 'positive') || 'all'
  );
  const [responseFilter, setResponseFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>(
    (searchParams.get('responseStatus') as 'PENDING' | 'ANSWERED') || 'ALL'
  );
  const [selectedHotelId, setSelectedHotelId] = useState<string>(
    searchParams.get('hotelId') || 'all'
  );
  const [smartReplyReview, setSmartReplyReview] = useState<ReviewWithHotel | null>(null);

  // Scroll to anchor if present in URL (e.g. #reviews-list)
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const attempt = (tries: number) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries > 0) {
        setTimeout(() => attempt(tries - 1), 200);
      }
    };
    attempt(10);
  }, [hash]);

  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();
  const queryClient = useQueryClient();

  const handleTourCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        stopTour();
        markTourSeen('reviews');
      }
    },
    [stopTour, markTourSeen]
  );

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  // Default hotel selector to own hotel when no hotelId in URL
  useEffect(() => {
    const ownHotels = hotelsData?.ownHotels ?? [];
    if (!searchParams.get('hotelId') && ownHotels.length > 0 && selectedHotelId === 'all') {
      setSelectedHotelId(ownHotels[0].id);
    }
  }, [hotelsData?.ownHotels?.length]);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['reviews-summary', selectedHotelId],
    queryFn: () => getReviewsSummary(selectedHotelId !== 'all' ? selectedHotelId : undefined),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: responseStats } = useQuery({
    queryKey: ['reviews-response-stats', selectedHotelId],
    queryFn: () =>
      getReviewResponseStats(selectedHotelId !== 'all' ? selectedHotelId : undefined),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: reviewsData, isLoading: reviewsLoading, isError, refetch } = useQuery({
    queryKey: ['reviews', filter, responseFilter, selectedHotelId],
    queryFn: () =>
      getReviews({
        sentiment: filter !== 'all' ? filter : undefined,
        responseStatus: responseFilter !== 'ALL' ? responseFilter : undefined,
        limit: 50,
        hotelId: selectedHotelId !== 'all' ? selectedHotelId : undefined,
      }),
    staleTime: 0,
    gcTime: 0,
  });

  const markAnsweredMutation = useMutation({
    mutationFn: (reviewId: string) => markReviewAnswered(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-response-stats'] });
    },
  });

  const ownHotels = hotelsData?.ownHotels || [];
  const competitorHotels = hotelsData?.competitorHotels || [];
  const allHotels = [...ownHotels, ...competitorHotels];

  const [aiHotelId, setAiHotelId] = useState<string | null>(null);

  useEffect(() => {
    if (!aiHotelId && allHotels.length > 0) {
      setAiHotelId(allHotels[0].id);
    }
  }, [allHotels.length]);

  const {
    data: aiSummary,
    isLoading: aiLoading,
    isError: aiError,
  } = useQuery({
    queryKey: ['ai-review-summary', aiHotelId],
    queryFn: () => getAiReviewSummary(aiHotelId!),
    enabled: !!aiHotelId,
    staleTime: 1000 * 60 * 60,
  });

  const isLoading = summaryLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Erro ao carregar avaliações
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

  const mySummary = summaryData || {
    avgRating: 0,
    totalReviews: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    myAvgRating: 0,
    competitorAvgRating: 0,
    diff: 0,
  };

  const allReviews = reviewsData?.reviews || [];
  const reviews = maxReviews ? allReviews.slice(0, maxReviews) : allReviews;
  const lockedReviews = maxReviews ? allReviews.slice(maxReviews, maxReviews + 3) : [];
  const hasMoreReviews = maxReviews ? allReviews.length > maxReviews : false;

  if (mySummary.totalReviews === 0 && reviews.length === 0) {
    return <EmptyState />;
  }

  const sentimentData = [
    { name: 'Positivas', value: mySummary.positive, color: 'emerald' },
    { name: 'Neutras', value: mySummary.neutral, color: 'amber' },
    { name: 'Negativas', value: mySummary.negative, color: 'rose' },
  ];

  const comparisonData = [
    { name: 'Meu Hotel', 'Nota Média': mySummary.myAvgRating },
    { name: 'Concorrentes', 'Nota Média': mySummary.competitorAvgRating },
  ];

  return (
    <div className="space-y-6">
      <Joyride
        steps={reviewsSteps}
        run={isRunning && currentPage === 'reviews'}
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

      {/* Smart Reply Panel */}
      {smartReplyReview && (
        <SmartReplyPanel
          review={smartReplyReview}
          onClose={() => setSmartReplyReview(null)}
        />
      )}

      {/* Header */}
      <div
        data-tour="reviews-header"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
          >
            Avaliações
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Analise e responda as avaliações do seu hotel e da concorrência
          </p>
        </div>
        <div data-tour="reviews-hotel-selector">
          <HotelSelector
            ownHotels={ownHotels}
            competitorHotels={competitorHotels}
            selectedHotelId={selectedHotelId}
            onChange={setSelectedHotelId}
          />
        </div>
      </div>

      {/* Response Rate Banner */}
      {responseStats && (
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            background:
              responseStats.responseRate >= 80
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))'
                : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))',
            border: `1px solid ${
              responseStats.responseRate >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'
            }`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor:
                  responseStats.responseRate >= 80
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(245,158,11,0.15)',
              }}
            >
              <MessageSquare
                className="w-5 h-5"
                style={{ color: responseStats.responseRate >= 80 ? '#10b981' : '#f59e0b' }}
              />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Taxa de resposta:{' '}
                <span
                  style={{ color: responseStats.responseRate >= 80 ? '#10b981' : '#f59e0b' }}
                >
                  {responseStats.responseRate}%
                </span>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {responseStats.totalPending > 0
                  ? `${responseStats.totalPending} avaliações aguardando resposta`
                  : 'Todas as avaliações foram respondidas!'}
              </p>
            </div>
          </div>
          {responseStats.totalPending > 0 && (
            <button
              onClick={() => {
                setResponseFilter('PENDING');
                setTimeout(() => {
                  document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0"
              style={{
                backgroundColor: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              Ver pendentes
            </button>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div
        data-tour="reviews-summary"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            value: mySummary.avgRating,
            label: 'Nota Média',
            icon: Star,
            bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            iconColor: 'white',
            valueColor: 'var(--text-primary)',
          },
          {
            value: mySummary.positive,
            label: 'Positivas',
            icon: ThumbsUp,
            bg: 'rgba(16,185,129,0.12)',
            iconColor: '#10b981',
            valueColor: 'var(--text-primary)',
          },
          {
            value: mySummary.negative,
            label: 'Negativas',
            icon: ThumbsDown,
            bg: 'rgba(239,68,68,0.12)',
            iconColor: '#ef4444',
            valueColor: 'var(--text-primary)',
          },
          {
            value: `${mySummary.diff >= 0 ? '+' : ''}${mySummary.diff}`,
            label: 'vs Concorrentes',
            icon: mySummary.diff >= 0 ? TrendingUp : TrendingDown,
            bg: mySummary.diff >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            iconColor: mySummary.diff >= 0 ? '#10b981' : '#ef4444',
            valueColor: mySummary.diff >= 0 ? '#10b981' : '#ef4444',
          },
        ].map(({ value, label, icon: Icon, bg, iconColor, valueColor }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: valueColor, fontFamily: 'Lexend, sans-serif' }}
                >
                  {value}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="reviews-sentiment-chart">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Sentimento</CardTitle>
              <CardDescription>Classificação das avaliações do seu hotel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <DonutChart
                  className="h-48 w-48"
                  data={sentimentData}
                  category="value"
                  index="name"
                  colors={['emerald', 'amber', 'rose']}
                  showAnimation
                />
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Positivas', count: mySummary.positive, color: '#10b981' },
                    { label: 'Neutras', count: mySummary.neutral, color: '#f59e0b' },
                    { label: 'Negativas', count: mySummary.negative, color: '#f43f5e' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {label}
                        </span>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div data-tour="reviews-comparison-chart">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Notas</CardTitle>
              <CardDescription>Sua nota vs média dos concorrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                className="h-48"
                data={comparisonData}
                index="name"
                categories={['Nota Média']}
                colors={['indigo']}
                valueFormatter={(value) => value.toFixed(1)}
                showAnimation
              />
              <div
                className="mt-4 p-3 rounded-xl"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {mySummary.diff >= 0 ? (
                    <>
                      Seu hotel está{' '}
                      <span className="font-semibold" style={{ color: '#10b981' }}>
                        {mySummary.diff} pontos acima
                      </span>{' '}
                      da média dos concorrentes!
                    </>
                  ) : (
                    <>
                      Seu hotel está{' '}
                      <span className="font-semibold" style={{ color: '#ef4444' }}>
                        {Math.abs(mySummary.diff)} pontos abaixo
                      </span>{' '}
                      da média dos concorrentes.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Summary */}
      <div data-tour="reviews-ai-summary">
        <AiSummaryCard
          summary={aiSummary}
          isLoading={aiLoading}
          isError={aiError}
          isLocked={!!maxReviews}
          hotels={allHotels.map((h) => ({ id: h.id, name: h.name, isOwn: h.isOwn }))}
          selectedHotelId={aiHotelId}
          onHotelChange={setAiHotelId}
          onRefresh={() => {
            if (aiHotelId) {
              queryClient.removeQueries({ queryKey: ['ai-review-summary', aiHotelId] });
              queryClient.fetchQuery({
                queryKey: ['ai-review-summary', aiHotelId],
                queryFn: () => getAiReviewSummary(aiHotelId, true),
              });
            }
          }}
        />
      </div>

      {/* Reviews List */}
      <div data-tour="reviews-list" id="reviews-list">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Avaliações Recentes</CardTitle>
              <CardDescription>
                {reviewsData?.pagination?.total
                  ? `${reviewsData.pagination.total} avaliações`
                  : 'Últimas avaliações recebidas'}
              </CardDescription>
            </div>

            {/* Dual filter bar */}
            <div className="flex flex-col gap-2 mt-4">
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'positive', label: 'Positivas' },
                  { value: 'neutral', label: 'Neutras' },
                  { value: 'negative', label: 'Negativas' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as typeof filter)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
                    style={
                      filter === f.value
                        ? {
                            backgroundColor: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                {[
                  { value: 'ALL', label: 'Todos os status' },
                  { value: 'PENDING', label: 'Pendentes' },
                  { value: 'ANSWERED', label: 'Respondidos' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setResponseFilter(f.value as typeof responseFilter)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
                    style={
                      responseFilter === f.value
                        ? {
                            backgroundColor: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canSmartReply={canSmartReply}
                  onMarkAnswered={(id) => markAnsweredMutation.mutate(id)}
                  onSmartReply={(r) => setSmartReplyReview(r)}
                  isMarkingAnswered={markAnsweredMutation.isPending}
                />
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma avaliação encontrada com este filtro.
                </div>
              )}
            </div>

            {hasMoreReviews && (
              <div className="relative mt-4">
                <div className="blur-sm pointer-events-none select-none space-y-3">
                  {lockedReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      canSmartReply={false}
                      onMarkAnswered={() => {}}
                      onSmartReply={() => {}}
                      isMarkingAnswered={false}
                    />
                  ))}
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(to top, var(--surface-card) 60%, transparent)',
                  }}
                >
                  <Sparkles className="w-6 h-6 mb-2" style={{ color: 'var(--accent-primary)' }} />
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Ver todas as avaliações requer upgrade
                  </p>
                  <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                    O plano Starter exibe apenas as últimas 10 avaliações
                  </p>
                  <Link to="/billing">
                    <Button size="sm" variant="primary">
                      Ver planos e fazer upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  canSmartReply,
  onMarkAnswered,
  onSmartReply,
  isMarkingAnswered,
}: {
  review: ReviewWithHotel;
  canSmartReply: boolean;
  onMarkAnswered: (id: string) => void;
  onSmartReply: (review: ReviewWithHotel) => void;
  isMarkingAnswered: boolean;
}) {
  const sentimentConfig = {
    positive: { label: 'Positiva', bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: ThumbsUp },
    neutral: { label: 'Neutra', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: MessageSquare },
    negative: { label: 'Negativa', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', icon: ThumbsDown },
  };

  const config = sentimentConfig[review.sentiment];
  const SentIcon = config.icon;
  const isPending = review.responseStatus === 'PENDING';

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--surface-secondary)',
        border: '1px solid var(--surface-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-card)' }}
          >
            <User className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {review.reviewerName || 'Anônimo'}
            </p>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              {review.reviewerCountry && (
                <>
                  <MapPin className="w-3 h-3" />
                  {review.reviewerCountry}
                  <span className="mx-1">|</span>
                </>
              )}
              {review.reviewDate && (
                <>
                  <Calendar className="w-3 h-3" />
                  {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            <SentIcon className="w-3 h-3" />
            {config.label}
          </span>
          <span
            className="text-sm px-2 py-1 rounded-lg font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {review.title}
        </h4>
      )}

      <div className="space-y-2">
        {review.positive && (
          <div className="flex gap-2">
            <ThumbsUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {review.positive}
            </p>
          </div>
        )}
        {review.negative && (
          <div className="flex gap-2">
            <ThumbsDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {review.negative}
            </p>
          </div>
        )}
      </div>

      {/* Action row */}
      <div
        className="mt-3 pt-3 flex items-center justify-between flex-wrap gap-2"
        style={{ borderTop: '1px solid var(--surface-border)' }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Building2 className="w-4 h-4" />
          {review.hotelName}
          {review.isOwnHotel && <span className="badge-gradient text-xs">Meu Hotel</span>}
        </div>

        {review.isOwnHotel && (
          <div className="flex items-center gap-2">
            {isPending ? (
              <button
                onClick={() => onMarkAnswered(review.id)}
                disabled={isMarkingAnswered}
                className="text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 font-medium"
                style={{
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
                  (e.currentTarget as HTMLElement).style.color = '#10b981';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                <CheckCircle className="w-3 h-3" />
                Marcar Respondido
              </button>
            ) : (
              <span className="text-xs flex items-center gap-1 font-medium" style={{ color: '#10b981' }}>
                <CheckCircle className="w-3 h-3" />
                Respondido
              </span>
            )}

            {canSmartReply ? (
              <button
                onClick={() => onSmartReply(review)}
                className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-white flex items-center gap-1 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Sparkles className="w-3 h-3" />
                Smart Reply
              </button>
            ) : (
              <button
                disabled
                className="text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 cursor-not-allowed opacity-50"
                style={{ border: '1px dashed var(--surface-border)', color: 'var(--text-muted)' }}
                title="Disponível no plano Insight"
              >
                <Lock className="w-3 h-3" />
                Smart Reply
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AiSummaryCard({
  summary,
  isLoading,
  isError,
  isLocked,
  hotels,
  selectedHotelId,
  onHotelChange,
  onRefresh,
}: {
  summary: AiReviewSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  isLocked: boolean;
  hotels: Array<{ id: string; name: string; isOwn: boolean }>;
  selectedHotelId: string | null;
  onHotelChange: (hotelId: string) => void;
  onRefresh: () => void;
}) {
  if (isLocked) {
    return (
      <Card className="relative overflow-hidden">
        <div className="blur-sm pointer-events-none select-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle>Resumo IA</CardTitle>
                <CardDescription>Análise inteligente das avaliações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--surface-border)' }} />
              <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--surface-border)' }} />
              <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--surface-border)' }} />
            </div>
          </CardContent>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'rgba(30,35,55,0.92)' }}
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle>Resumo IA</CardTitle>
              <CardDescription>Análise inteligente das avaliações</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedHotelId || ''}
              onChange={(e) => onHotelChange(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)',
              }}
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.isOwn ? ' (Meu Hotel)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Gerar novo resumo"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Analisando avaliações com IA...
            </span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm">Não foi possível gerar o resumo IA.</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {summary.summary}
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
                  {summary.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
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
                  {summary.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }}>-</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {summary.trendInsight && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.06))',
                  border: '1px solid rgba(79,70,229,0.15)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: '#818cf8' }}>Insight: </span>
                  {summary.trendInsight}
                </p>
              </div>
            )}

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Baseado em {summary.reviewCount} avaliações. Gerado em{' '}
              {new Date(summary.generatedAt).toLocaleDateString('pt-BR')}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <Star className="w-8 h-8 text-white" />
      </div>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, sans-serif' }}
      >
        Nenhuma avaliação encontrada
      </h2>
      <p className="max-w-md mb-4" style={{ color: 'var(--text-muted)' }}>
        Adicione seu hotel para começar a monitorar as avaliações.
      </p>
      <a
        href="/hotels"
        className="font-medium hover:opacity-80 transition-opacity"
        style={{ color: '#818cf8' }}
      >
        Ir para Meus Hotéis
      </a>
    </div>
  );
}
