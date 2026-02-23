import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HotelSelector } from '../../components/ui/HotelSelector';
import { SmartReplyPanel } from '../../components/reviews/SmartReplyPanel';
import {
  getReviews,
  getReviewsSummary,
  getHotels,
  getReviewResponseStats,
  markReviewAnswered,
} from '../../services/api';
import type { ReviewWithHotel } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Building2,
  User,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Lock,
} from 'lucide-react';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsSteps } from '../../tour/steps/reviews';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(1);
  const [smartReplyReview, setSmartReplyReview] = useState<ReviewWithHotel | null>(null);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleResponseFilterChange = (newResponseFilter: typeof responseFilter) => {
    setResponseFilter(newResponseFilter);
    setPage(1);
  };

  const handleHotelChange = (newHotelId: string) => {
    setSelectedHotelId(newHotelId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const effectiveLimit = maxReviews ? Math.min(PAGE_SIZE, maxReviews) : PAGE_SIZE;
  const apiSentiment = filter !== 'all' ? filter : undefined;
  const apiResponseStatus = responseFilter !== 'ALL' ? responseFilter : undefined;

  const {
    data: reviewsData,
    isError,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['reviews', selectedHotelId, filter, responseFilter, page, effectiveLimit],
    queryFn: () =>
      getReviews({
        hotelId: selectedHotelId !== 'all' ? selectedHotelId : undefined,
        sentiment: apiSentiment,
        responseStatus: apiResponseStatus,
        page,
        limit: effectiveLimit,
      }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
  });

  const markAnsweredMutation = useMutation({
    mutationFn: (reviewId: string) => markReviewAnswered(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-response-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-summary'] });
    },
  });

  const ownHotels = hotelsData?.ownHotels || [];
  const competitorHotels = hotelsData?.competitorHotels || [];

  const isLoading = summaryLoading;

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

  const reviews = reviewsData?.reviews ?? [];
  const pagination = reviewsData?.pagination ?? { page: 1, limit: effectiveLimit, total: 0 };
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const isLimitedByPlan = maxReviews !== null && pagination.total > maxReviews;
  const showPagination = !maxReviews;

  if (mySummary.totalReviews === 0 && reviews.length === 0 && page === 1) {
    return <EmptyState />;
  }

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

      <PageHeader
        title="Avaliações"
        description="Monitore e responda as avaliações do seu hotel em todas as plataformas."
      />

      {/* Hotel Selector */}
      <div data-tour="reviews-hotel-selector" className="flex justify-end">
        <HotelSelector
          ownHotels={ownHotels}
          competitorHotels={competitorHotels}
          selectedHotelId={selectedHotelId}
          onChange={handleHotelChange}
        />
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
                handleResponseFilterChange('PENDING');
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

      {/* Sentiment Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            value: 'positive' as const,
            label: 'Positivas',
            count: mySummary.positive,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
            border: 'rgba(16,185,129,0.2)',
            activeBorder: '#10b981',
            icon: ThumbsUp,
          },
          {
            value: 'neutral' as const,
            label: 'Neutras',
            count: mySummary.neutral,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
            border: 'rgba(245,158,11,0.2)',
            activeBorder: '#f59e0b',
            icon: MessageSquare,
          },
          {
            value: 'negative' as const,
            label: 'Negativas',
            count: mySummary.negative,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.08)',
            border: 'rgba(239,68,68,0.2)',
            activeBorder: '#ef4444',
            icon: ThumbsDown,
          },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = filter === s.value;
          return (
            <button
              key={s.value}
              onClick={() => {
                handleFilterChange(isActive ? 'all' : s.value);
              }}
              className="rounded-2xl p-4 text-left transition-all duration-200 w-full"
              style={{
                background: isActive ? s.bg : 'var(--surface-card)',
                border: `1px solid ${isActive ? s.activeBorder : 'var(--surface-border)'}`,
                boxShadow: isActive ? `0 0 0 1px ${s.activeBorder}` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: s.bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                {isActive && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                    ativo
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold" style={{ color: isActive ? s.color : 'var(--text-primary)' }}>
                {s.count}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div data-tour="reviews-list" id="reviews-list">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Avaliações Recentes</CardTitle>
              <CardDescription>
                {pagination.total > 0
                  ? `${pagination.total} avaliações`
                  : 'Últimas avaliações recebidas'}
              </CardDescription>
            </div>

            {/* Status filter bar */}
            <div className="mt-4">
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
                    onClick={() => handleResponseFilterChange(f.value as typeof responseFilter)}
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
            <div
              className="space-y-3 transition-opacity duration-200"
              style={{ opacity: isFetching && isPlaceholderData ? 0.6 : 1 }}
            >
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

              {reviews.length === 0 && !isFetching && (
                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma avaliação encontrada com este filtro.
                </div>
              )}
            </div>

            {isLimitedByPlan && (
              <div className="relative mt-4">
                <div className="blur-sm pointer-events-none select-none space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 h-32"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--surface-border)',
                      }}
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
                    O plano Starter exibe apenas as últimas {maxReviews} avaliações
                  </p>
                  <Link to="/billing">
                    <Button size="sm" variant="primary">
                      Ver planos e fazer upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {showPagination && totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isFetching}
                />
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
