import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getReviews, getReviewsSummary, getHotels, getAiReviewSummary } from '../../services/api';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BarChart, DonutChart } from '@tremor/react';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { reviewsSteps } from '../../tour/steps/reviews';
import { TourTooltip } from '../../tour/TourTooltip';
import { tourStyles } from '../../tour/tourStyles';

export function ReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const handleTourCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
      markTourSeen('reviews');
    }
  }, [stopTour, markTourSeen]);

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['reviews-summary'],
    queryFn: getReviewsSummary,
  });

  const { data: reviewsData, isLoading: reviewsLoading, isError, refetch } = useQuery({
    queryKey: ['reviews', filter, selectedHotelId],
    queryFn: () => getReviews({
      sentiment: filter,
      limit: 50,
      hotelId: selectedHotelId !== 'all' ? selectedHotelId : undefined,
    }),
  });

  const ownHotels = hotelsData?.ownHotels || [];
  const competitorHotels = hotelsData?.competitorHotels || [];
  const allHotels = [...ownHotels, ...competitorHotels];

  const [aiHotelId, setAiHotelId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
        <Loader2 className="w-8 h-8 text-hw-purple animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-hw-navy-900">Erro ao carregar avaliacoes</h2>
        <p className="text-hw-navy-500 mt-1">Tente novamente mais tarde.</p>
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
    competitorAvgRating: 0,
    diff: 0,
  };

  const reviews = reviewsData?.reviews || [];

  // No reviews at all
  if (mySummary.totalReviews === 0 && reviews.length === 0) {
    return <EmptyState />;
  }

  // Sentiment distribution for chart
  const sentimentData = [
    { name: 'Positivas', value: mySummary.positive, color: 'emerald' },
    { name: 'Neutras', value: mySummary.neutral, color: 'amber' },
    { name: 'Negativas', value: mySummary.negative, color: 'rose' },
  ];

  // Comparison bar chart data
  const comparisonData = [
    { name: 'Meu Hotel', 'Nota Media': mySummary.avgRating },
    { name: 'Concorrentes', 'Nota Media': mySummary.competitorAvgRating },
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

      {/* Header */}
      <div data-tour="reviews-header" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Raio-X de Avaliacoes</h1>
          <p className="text-hw-navy-500 mt-1">
            Analise as avaliacoes do seu hotel e da concorrencia
          </p>
        </div>
        <div data-tour="reviews-hotel-selector" className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-hw-navy-400" />
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="bg-white border border-hw-navy-200 rounded-lg px-3 py-2 text-sm text-hw-navy-900 focus:outline-none focus:ring-2 focus:ring-hw-purple focus:border-hw-purple"
          >
            <option value="all">Todos os Hoteis</option>
            {ownHotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name} (Meu Hotel)</option>
            ))}
            {competitorHotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div data-tour="reviews-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-hw-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{mySummary.avgRating}</p>
              <p className="text-sm text-hw-navy-500">Nota Media</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{mySummary.positive}</p>
              <p className="text-sm text-hw-navy-500">Positivas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">{mySummary.negative}</p>
              <p className="text-sm text-hw-navy-500">Negativas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              mySummary.diff >= 0 ? 'bg-green-100' : 'bg-red-100'
            )}>
              {mySummary.diff >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">
                {mySummary.diff >= 0 ? '+' : ''}{mySummary.diff}
              </p>
              <p className="text-sm text-hw-navy-500">vs Concorrentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div data-tour="reviews-sentiment-chart">
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao de Sentimento</CardTitle>
            <CardDescription>Classificacao das avaliacoes do seu hotel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <DonutChart
                className="h-48 w-48"
                data={sentimentData}
                category="value"
                index="name"
                colors={['emerald', 'amber', 'rose']}
                showAnimation={true}
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-hw-navy-700">Positivas</span>
                  </div>
                  <span className="font-semibold text-hw-navy-900">{mySummary.positive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-sm text-hw-navy-700">Neutras</span>
                  </div>
                  <span className="font-semibold text-hw-navy-900">{mySummary.neutral}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full" />
                    <span className="text-sm text-hw-navy-700">Negativas</span>
                  </div>
                  <span className="font-semibold text-hw-navy-900">{mySummary.negative}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Comparison with Competitors */}
        <div data-tour="reviews-comparison-chart">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Notas</CardTitle>
            <CardDescription>Sua nota vs media dos concorrentes</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-48"
              data={comparisonData}
              index="name"
              categories={['Nota Media']}
              colors={['violet']}
              valueFormatter={(value) => value.toFixed(1)}
              showAnimation={true}
            />
            <div className="mt-4 p-4 bg-hw-navy-50 rounded-lg">
              <p className="text-sm text-hw-navy-600">
                {mySummary.diff >= 0 ? (
                  <>Seu hotel esta <span className="font-semibold text-green-600">{mySummary.diff} pontos acima</span> da media dos concorrentes!</>
                ) : (
                  <>Seu hotel esta <span className="font-semibold text-red-600">{Math.abs(mySummary.diff)} pontos abaixo</span> da media dos concorrentes.</>
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
      <div data-tour="reviews-list">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Avaliacoes Recentes</CardTitle>
              <CardDescription>Ultimas avaliacoes recebidas</CardDescription>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-hw-navy-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'positive', label: 'Positivas' },
                { value: 'neutral', label: 'Neutras' },
                { value: 'negative', label: 'Negativas' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as typeof filter)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    filter === f.value
                      ? 'bg-white text-hw-navy-900 shadow-sm'
                      : 'text-hw-navy-600 hover:text-hw-navy-900'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-8 text-hw-navy-500">
                Nenhuma avaliacao encontrada com este filtro.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: ReviewWithHotel }) {
  const sentimentConfig = {
    positive: { color: 'bg-green-100 text-green-700', icon: ThumbsUp },
    neutral: { color: 'bg-yellow-100 text-yellow-700', icon: MessageSquare },
    negative: { color: 'bg-red-100 text-red-700', icon: ThumbsDown },
  };

  const config = sentimentConfig[review.sentiment];
  const Icon = config.icon;

  return (
    <div className="p-4 border border-hw-navy-100 rounded-lg hover:border-hw-navy-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-hw-navy-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-hw-navy-500" />
          </div>

          {/* Reviewer Info */}
          <div>
            <p className="font-medium text-hw-navy-900">{review.reviewerName || 'Anonimo'}</p>
            <div className="flex items-center gap-2 text-sm text-hw-navy-500">
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

        {/* Rating & Sentiment */}
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', config.color)}>
            <Icon className="w-3 h-3" />
            {review.sentiment === 'positive' ? 'Positiva' : review.sentiment === 'neutral' ? 'Neutra' : 'Negativa'}
          </span>
          <span className="bg-hw-purple text-white text-sm px-2 py-1 rounded font-semibold">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-hw-navy-900 mb-2">{review.title}</h4>
      )}

      {/* Review Content */}
      <div className="space-y-2">
        {review.positive && (
          <div className="flex gap-2">
            <ThumbsUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-hw-navy-700">{review.positive}</p>
          </div>
        )}
        {review.negative && (
          <div className="flex gap-2">
            <ThumbsDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-hw-navy-700">{review.negative}</p>
          </div>
        )}
      </div>

      {/* Hotel Badge */}
      <div className="mt-3 pt-3 border-t border-hw-navy-100">
        <div className="flex items-center gap-2 text-sm text-hw-navy-500">
          <Building2 className="w-4 h-4" />
          {review.hotelName}
          {review.isOwnHotel && (
            <span className="bg-hw-purple-100 text-hw-purple text-xs px-2 py-0.5 rounded-full">
              Meu Hotel
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// AI Summary Card Component
function AiSummaryCard({
  summary,
  isLoading,
  isError,
  hotels,
  selectedHotelId,
  onHotelChange,
  onRefresh,
}: {
  summary: AiReviewSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  hotels: Array<{ id: string; name: string; isOwn: boolean }>;
  selectedHotelId: string | null;
  onHotelChange: (hotelId: string) => void;
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle>Resumo IA</CardTitle>
              <CardDescription>Analise inteligente das avaliacoes</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedHotelId || ''}
              onChange={(e) => onHotelChange(e.target.value)}
              className="bg-white border border-hw-navy-200 rounded-lg px-3 py-1.5 text-sm text-hw-navy-900 focus:outline-none focus:ring-2 focus:ring-hw-purple"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.isOwn ? ' (Meu Hotel)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-hw-navy-100 rounded-lg transition-colors"
              title="Gerar novo resumo"
            >
              <RefreshCw className="w-4 h-4 text-hw-navy-500" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-hw-purple animate-spin" />
            <span className="ml-2 text-sm text-hw-navy-500">Analisando avaliacoes com IA...</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-6 text-hw-navy-500">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm">Nao foi possivel gerar o resumo IA.</p>
            <p className="text-xs text-hw-navy-400 mt-1">Verifique se a chave do Gemini esta configurada.</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="space-y-4">
            <p className="text-sm text-hw-navy-700 leading-relaxed">{summary.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-1">
                  {summary.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4" />
                  Pontos Fracos
                </h4>
                <ul className="space-y-1">
                  {summary.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">-</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {summary.trendInsight && (
              <div className="p-3 bg-hw-purple-50 rounded-lg">
                <p className="text-sm text-hw-purple-700">
                  <span className="font-semibold">Insight:</span> {summary.trendInsight}
                </p>
              </div>
            )}

            <p className="text-xs text-hw-navy-400">
              Baseado em {summary.reviewCount} avaliacoes. Gerado em {new Date(summary.generatedAt).toLocaleDateString('pt-BR')}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-hw-purple-100 rounded-full flex items-center justify-center mb-4">
        <Star className="w-8 h-8 text-hw-purple" />
      </div>
      <h2 className="text-xl font-semibold text-hw-navy-900 mb-2">Nenhuma avaliacao encontrada</h2>
      <p className="text-hw-navy-500 max-w-md mb-4">
        Adicione seu hotel para comecar a monitorar as avaliacoes.
      </p>
      <a href="/hotels" className="text-hw-purple font-medium hover:underline">
        Ir para Meus Hoteis
      </a>
    </div>
  );
}
