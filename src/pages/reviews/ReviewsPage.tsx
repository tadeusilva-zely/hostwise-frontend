import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { mockReviews, getReviewsSummary, getReviewComparison, getHotelReviews, getOwnHotels } from '../../mocks';
import type { MockReview } from '../../mocks';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BarChart, DonutChart } from '@tremor/react';

export function ReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [selectedHotel] = useState<string>('1'); // My hotel by default

  const ownHotels = getOwnHotels();
  const mySummary = getReviewsSummary('1');
  const comparison = getReviewComparison();

  // Check if user has hotels
  if (ownHotels.length === 0) {
    return <EmptyState />;
  }

  // Filter reviews
  const allReviews = selectedHotel === 'all'
    ? mockReviews
    : getHotelReviews(selectedHotel);

  const filteredReviews = filter === 'all'
    ? allReviews
    : allReviews.filter(r => r.sentiment === filter);

  // Sentiment distribution for chart
  const sentimentData = [
    { name: 'Positivas', value: mySummary.positive, color: 'emerald' },
    { name: 'Neutras', value: mySummary.neutral, color: 'amber' },
    { name: 'Negativas', value: mySummary.negative, color: 'rose' },
  ];

  // Comparison bar chart data
  const comparisonData = [
    { name: 'Meu Hotel', 'Nota Media': comparison.myAvgRating },
    { name: 'Concorrentes', 'Nota Media': comparison.competitorAvgRating },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">Raio-X de Avaliacoes</h1>
          <p className="text-hw-navy-500 mt-1">
            Analise as avaliacoes do seu hotel e da concorrencia
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              comparison.diff >= 0 ? 'bg-green-100' : 'bg-red-100'
            )}>
              {comparison.diff >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-hw-navy-900">
                {comparison.diff >= 0 ? '+' : ''}{comparison.diff}
              </p>
              <p className="text-sm text-hw-navy-500">vs Concorrentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
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

        {/* Comparison with Competitors */}
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
                {comparison.diff >= 0 ? (
                  <>Seu hotel esta <span className="font-semibold text-green-600">{comparison.diff} pontos acima</span> da media dos concorrentes!</>
                ) : (
                  <>Seu hotel esta <span className="font-semibold text-red-600">{Math.abs(comparison.diff)} pontos abaixo</span> da media dos concorrentes.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
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
            {filteredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-8 text-hw-navy-500">
                Nenhuma avaliacao encontrada com este filtro.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: MockReview }) {
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
            <p className="font-medium text-hw-navy-900">{review.reviewerName}</p>
            <div className="flex items-center gap-2 text-sm text-hw-navy-500">
              <MapPin className="w-3 h-3" />
              {review.reviewerCountry}
              <span className="mx-1">|</span>
              <Calendar className="w-3 h-3" />
              {new Date(review.date).toLocaleDateString('pt-BR')}
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
            {review.rating}
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
          {review.hotelId === '1' && (
            <span className="bg-hw-purple-100 text-hw-purple text-xs px-2 py-0.5 rounded-full">
              Meu Hotel
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-hw-purple-100 rounded-full flex items-center justify-center mb-4">
        <Star className="w-8 h-8 text-hw-purple" />
      </div>
      <h2 className="text-xl font-semibold text-hw-navy-900 mb-2">Nenhum hotel cadastrado</h2>
      <p className="text-hw-navy-500 max-w-md mb-4">
        Adicione seu hotel para comecar a monitorar as avaliacoes.
      </p>
      <a href="/hotels" className="text-hw-purple font-medium hover:underline">
        Ir para Meus Hoteis
      </a>
    </div>
  );
}
