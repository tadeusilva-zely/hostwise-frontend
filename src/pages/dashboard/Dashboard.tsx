import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMe, getDashboardSummary, getHotels, getAiReviewSummary } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart } from '@tremor/react';
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

  const { data: dashboard, isLoading: dashLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const ownHotelId = hotelsData?.ownHotels?.[0]?.id;

  const { data: aiInsight } = useQuery({
    queryKey: ['ai-review-summary', ownHotelId],
    queryFn: () => getAiReviewSummary(ownHotelId!),
    enabled: !!ownHotelId,
    staleTime: 1000 * 60 * 60,
  });

  const handleTourCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
      markTourSeen('dashboard');
    }
  }, [stopTour, markTourSeen]);

  const isLoading = userLoading || dashLoading;

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
        <h2 className="text-lg font-semibold text-hw-navy-900">Erro ao carregar dashboard</h2>
        <p className="text-hw-navy-500 mt-1">Tente novamente mais tarde.</p>
        <Button variant="secondary" onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hotels = dashboard?.hotels || { ownCount: 0, competitorCount: 0 };
  const rates = dashboard?.rates || { avgMyHotel: 0, avgCompetitors: 0, avgDiff: 0, cheaper: 0, expensive: 0, average: 0, total: 0, chartData: [] };
  const reviews = dashboard?.reviews || { avgRating: 0, totalReviews: 0, positive: 0, neutral: 0, negative: 0, competitorAvgRating: 0, diff: 0 };
  const occupancy = dashboard?.occupancy || { avgMyHotel: 0, avgCompetitor: 0, diff: 0, avgWeekend: 0, avgWeekday: 0, highest: { date: '', occupancy: 0 }, lowest: { date: '', occupancy: 0 } };

  const hasHotels = hotels.ownCount > 0;

  const isTrialActive = user?.isTrialActive;
  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Mini chart data from API
  const miniChartData = rates.chartData.map(r => ({
    date: r.date.slice(5),
    'Meu Hotel': r.myHotel,
    'Concorrentes': r.competitors,
  }));

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
      <div data-tour="dashboard-welcome">
        <h1 className="text-2xl font-bold text-hw-navy-900">
          Ola, {authUser?.name?.split(' ')[0] || 'Hoteleiro'}!
        </h1>
        <p className="text-hw-navy-500 mt-1">
          {hasHotels
            ? 'Aqui esta o resumo do seu hotel e concorrentes.'
            : 'Bem-vindo ao HostWise. Cadastre seu hotel para comecar a monitorar.'}
        </p>
      </div>

      {/* Trial Banner */}
      {isTrialActive && (
        <Card className="bg-gradient-to-r from-hw-purple-50 to-hw-purple-100 border border-hw-purple-200">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-hw-purple rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-hw-navy-900">
                  Periodo de teste ativo
                </p>
                <p className="text-sm text-hw-navy-600">
                  Voce tem acesso as funcionalidades do plano Insight por mais {trialDaysLeft} dias.
                </p>
              </div>
            </div>
            <Link to="/billing">
              <Button variant="primary" size="sm">
                Fazer upgrade
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* No Hotels State */}
      {!hasHotels ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-hw-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-hw-purple" />
            </div>
            <h2 className="text-xl font-semibold text-hw-navy-900 mb-2">
              Cadastre seu primeiro hotel
            </h2>
            <p className="text-hw-navy-600 mb-6 max-w-md mx-auto">
              Adicione seu hotel e seus concorrentes para comecar a monitorar tarifas, avaliacoes e ocupacao.
            </p>
            <Link to="/hotels">
              <Button variant="primary">
                <Building2 className="w-4 h-4 mr-2" />
                Adicionar Meu Hotel
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-hw-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-navy-900">{hotels.ownCount}</p>
                  <p className="text-sm text-hw-navy-500">Meu(s) Hotel(is)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hw-navy-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-hw-navy-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-navy-900">{hotels.competitorCount}</p>
                  <p className="text-sm text-hw-navy-500">Concorrentes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-navy-900">{reviews.avgRating}</p>
                  <p className="text-sm text-hw-navy-500">Nota Media</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-navy-900">{occupancy.avgMyHotel}%</p>
                  <p className="text-sm text-hw-navy-500">Ocupacao Media</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison Highlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Price Position */}
            <div data-tour="dashboard-price-position">
              <Card className={cn(
                'border-2',
                rates.avgDiff < 0 ? 'border-green-200 bg-green-50/50' :
                rates.avgDiff > 0 ? 'border-red-200 bg-red-50/50' :
                'border-yellow-200 bg-yellow-50/50'
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Posicao de Preco
                  </CardTitle>
                  <CardDescription>Comparativo com a media dos concorrentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-hw-navy-900">
                        R$ {rates.avgMyHotel}
                      </p>
                      <p className="text-sm text-hw-navy-500">Sua tarifa media</p>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'flex items-center gap-2 text-2xl font-bold',
                        rates.avgDiff < 0 ? 'text-green-600' :
                        rates.avgDiff > 0 ? 'text-red-600' :
                        'text-yellow-600'
                      )}>
                        {rates.avgDiff < 0 ? <ArrowDown className="w-6 h-6" /> :
                         rates.avgDiff > 0 ? <ArrowUp className="w-6 h-6" /> :
                         <Minus className="w-6 h-6" />}
                        {Math.abs(rates.avgDiff)}%
                      </div>
                      <p className="text-sm text-hw-navy-500">
                        {rates.avgDiff < 0 ? 'Abaixo da media' :
                         rates.avgDiff > 0 ? 'Acima da media' :
                         'Na media'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      {rates.cheaper} dias mais barato
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      {rates.expensive} dias mais caro
                    </span>
                  </div>
                  <Link to="/rates" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                    Ver detalhes
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Price Evolution Mini Chart */}
            <div data-tour="dashboard-price-chart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolucao de Precos
                  </CardTitle>
                  <CardDescription>Ultimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    className="h-40"
                    data={miniChartData}
                    index="date"
                    categories={['Meu Hotel', 'Concorrentes']}
                    colors={['violet', 'slate']}
                    valueFormatter={(value) => `R$ ${value}`}
                    showLegend={false}
                    showAnimation={true}
                  />
                  <div className="mt-2 flex items-center justify-center gap-6 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
                      Meu Hotel
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                      Concorrentes
                    </span>
                  </div>
                  <Link to="/rates" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                    Ver analise completa
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews & Occupancy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews Summary */}
            <div data-tour="dashboard-reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Avaliacoes
                  </CardTitle>
                  <CardDescription>Resumo das ultimas avaliacoes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-hw-purple rounded-xl flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{reviews.avgRating}</span>
                      </div>
                      <p className="text-sm text-hw-navy-500 mt-2">Nota media</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-hw-navy-600">Positivas</span>
                        <span className="font-semibold text-green-600">{reviews.positive}</span>
                      </div>
                      <div className="w-full bg-hw-navy-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${reviews.totalReviews > 0 ? (reviews.positive / reviews.totalReviews) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-hw-navy-600">Negativas</span>
                        <span className="font-semibold text-red-600">{reviews.negative}</span>
                      </div>
                      <div className="w-full bg-hw-navy-100 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${reviews.totalReviews > 0 ? (reviews.negative / reviews.totalReviews) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Link to="/reviews" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                    Ver todas avaliacoes
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Occupancy Summary */}
            <div data-tour="dashboard-occupancy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Ocupacao
                  </CardTitle>
                  <CardDescription>Proximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={cn(
                        'w-20 h-20 rounded-xl flex items-center justify-center',
                        occupancy.avgMyHotel >= 70 ? 'bg-green-500' :
                        occupancy.avgMyHotel >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      )}>
                        <span className="text-3xl font-bold text-white">{occupancy.avgMyHotel}%</span>
                      </div>
                      <p className="text-sm text-hw-navy-500 mt-2">Media geral</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                        <span className="text-sm text-hw-navy-600">Fins de semana</span>
                        <span className="font-semibold text-hw-navy-900">{occupancy.avgWeekend}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                        <span className="text-sm text-hw-navy-600">Dias uteis</span>
                        <span className="font-semibold text-hw-navy-900">{occupancy.avgWeekday}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {occupancy.diff >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      occupancy.diff >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {occupancy.diff >= 0 ? '+' : ''}{occupancy.diff}% vs concorrentes
                    </span>
                  </div>
                  <Link to="/occupancy" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                    Ver calendario completo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insight */}
          {aiInsight?.trendInsight && (
            <Card className="border-2 border-hw-purple-200 bg-gradient-to-r from-hw-purple-50 to-indigo-50">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="w-10 h-10 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-hw-navy-900 mb-1">Insight IA</p>
                  <p className="text-sm text-hw-navy-700 leading-relaxed">{aiInsight.trendInsight}</p>
                  <Link to="/reviews" className="mt-2 inline-flex items-center text-hw-purple text-sm font-medium hover:underline">
                    Ver analise completa
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div data-tour="dashboard-quick-actions">
            <Card>
              <CardHeader>
                <CardTitle>Acoes Rapidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/hotels" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <Building2 className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Gerenciar Hoteis</p>
                    <p className="text-sm text-hw-navy-500">Adicionar ou remover hoteis</p>
                  </Link>
                  <Link to="/rates" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <DollarSign className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Analisar Tarifas</p>
                    <p className="text-sm text-hw-navy-500">Ver comparativo de precos</p>
                  </Link>
                  <Link to="/reviews" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <Star className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Ver Avaliacoes</p>
                    <p className="text-sm text-hw-navy-500">Acompanhar sentimento</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
