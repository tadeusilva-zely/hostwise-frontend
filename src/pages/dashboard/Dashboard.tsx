import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HotelSelector } from '../../components/ui/HotelSelector';
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
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const { user: authUser } = useAuth();
  const { isRunning, currentPage, stopTour, markTourSeen } = useTour();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: dashboard, isLoading: dashLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', selectedHotelId],
    queryFn: () => getDashboardSummary(selectedHotelId !== 'all' ? selectedHotelId : undefined),
    staleTime: 0,
    gcTime: 0,
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
    date: r.date.slice(8) + '/' + r.date.slice(5, 7),
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
      <div data-tour="dashboard-welcome" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hw-navy-900">
            Olá, {authUser?.name?.split(' ')[0] || 'Hoteleiro'}!
          </h1>
          <p className="text-hw-navy-500 mt-1">
            {hasHotels
              ? 'Aqui está o resumo do seu hotel e concorrentes.'
              : 'Bem-vindo ao HostWise. Cadastre seu hotel para começar a monitorar.'}
          </p>
        </div>
        {hasHotels && (
          <HotelSelector
            ownHotels={hotelsData?.ownHotels || []}
            competitorHotels={hotelsData?.competitorHotels || []}
            selectedHotelId={selectedHotelId}
            onChange={setSelectedHotelId}
          />
        )}
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
                  Período de teste ativo
                </p>
                <p className="text-sm text-hw-navy-600">
                  Você tem acesso às funcionalidades do plano Insight por mais {trialDaysLeft} dias.
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
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-hw-purple-50 via-white to-indigo-50 border-2 border-hw-purple-100 overflow-hidden">
            <CardContent className="text-center py-16 px-6 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-hw-purple-100 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-hw-navy-900 mb-3">
                  Bem-vindo ao HostWise!
                </h2>
                <p className="text-hw-navy-600 mb-8 max-w-lg mx-auto text-base lg:text-lg">
                  Comece cadastrando seu hotel para desbloquear o monitoramento inteligente de tarifas, avaliações e ocupação.
                </p>
                <Link to="/hotels">
                  <Button variant="primary" size="lg" className="shadow-lg">
                    <Building2 className="w-5 h-5 mr-2" />
                    Cadastrar Meu Hotel
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-hw-navy-900 mb-1">Espião de Tarifas</h3>
                <p className="text-sm text-hw-navy-500">
                  Compare seus preços com a concorrência em tempo real.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-hw-navy-900 mb-1">Avaliações</h3>
                <p className="text-sm text-hw-navy-500">
                  Monitore e analise o que os hóspedes estão dizendo.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-hw-navy-900 mb-1">Ocupação</h3>
                <p className="text-sm text-hw-navy-500">
                  Acompanhe sua taxa de ocupação e identifique oportunidades.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
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
                  <p className="text-sm text-hw-navy-500">Nota Média</p>
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
                  <p className="text-sm text-hw-navy-500">Ocupação Média</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison Highlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Today's Price Position */}
            <div data-tour="dashboard-price-position" className="flex flex-col">
              <Card className={cn('flex-1',
                'border-2',
                rates.avgDiff < 0 ? 'border-green-200 bg-green-50/50' :
                rates.avgDiff > 0 ? 'border-red-200 bg-red-50/50' :
                'border-yellow-200 bg-yellow-50/50'
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Posição de Preço
                  </CardTitle>
                  <CardDescription>Comparativo com a média dos concorrentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-hw-navy-900">
                        R$ {rates.avgMyHotel}
                      </p>
                      <p className="text-sm text-hw-navy-500">Sua tarifa média</p>
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
                        {rates.avgDiff < 0 ? 'Abaixo da média' :
                         rates.avgDiff > 0 ? 'Acima da média' :
                         'Na média'}
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
            <div data-tour="dashboard-price-chart" className="flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolução de Preços
                  </CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={miniChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashColorMyHotel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashColorCompetitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tickFormatter={(v) => `R$ ${v}`} tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
                      <Tooltip formatter={(value: number) => [`R$ ${value}`, '']} />
                      <Area type="monotone" dataKey="Meu Hotel" stroke="#7c3aed" fill="url(#dashColorMyHotel)" strokeWidth={2} dot={{ r: 3 }} />
                      <Area type="monotone" dataKey="Concorrentes" stroke="#64748b" fill="url(#dashColorCompetitors)" strokeWidth={2} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
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
                    Ver análise completa
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews & Occupancy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Reviews Summary */}
            <div data-tour="dashboard-reviews" className="flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Avaliações
                  </CardTitle>
                  <CardDescription>Resumo das últimas avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-hw-purple rounded-xl flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{reviews.avgRating}</span>
                      </div>
                      <p className="text-sm text-hw-navy-500 mt-2">Nota média</p>
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
                    Ver todas avaliações
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
                      <div className={cn(
                        'w-20 h-20 rounded-xl flex items-center justify-center',
                        occupancy.avgMyHotel >= 70 ? 'bg-green-500' :
                        occupancy.avgMyHotel >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      )}>
                        <span className="text-3xl font-bold text-white">{occupancy.avgMyHotel}%</span>
                      </div>
                      <p className="text-sm text-hw-navy-500 mt-2">Média geral</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                        <span className="text-sm text-hw-navy-600">Fins de semana</span>
                        <span className="font-semibold text-hw-navy-900">{occupancy.avgWeekend}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                        <span className="text-sm text-hw-navy-600">Dias úteis</span>
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
                    Ver calendário completo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insight */}
          {authUser?.limits.maxReviews ? (
            // STARTER: blurred preview + upgrade CTA — same style as ReviewsPage
            <Card className="relative overflow-hidden">
              <div className="blur-sm pointer-events-none select-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-lg flex items-center justify-center">
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
                    <div className="h-4 bg-hw-navy-100 rounded w-3/4" />
                    <div className="h-4 bg-hw-navy-100 rounded w-full" />
                    <div className="h-4 bg-hw-navy-100 rounded w-5/6" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-green-50 rounded-lg h-24" />
                      <div className="p-4 bg-red-50 rounded-lg h-24" />
                    </div>
                  </div>
                </CardContent>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-hw-navy-900 text-base mb-1">Análise IA de Avaliações</p>
                <p className="text-sm text-hw-navy-500 mb-4 text-center max-w-xs">
                  Disponível a partir do plano Insight — resumo automático, pontos fortes e fracos.
                </p>
                <Link to="/billing">
                  <Button variant="primary" size="sm">Ver planos e fazer upgrade</Button>
                </Link>
              </div>
            </Card>
          ) : aiInsight?.trendInsight ? (
            // INSIGHT / PRO: show real content
            <Card className="border-2 border-hw-purple-200 bg-gradient-to-r from-hw-purple-50 to-indigo-50">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="w-10 h-10 bg-gradient-to-br from-hw-purple to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-hw-navy-900 mb-1">Insight IA</p>
                  <p className="text-sm text-hw-navy-700 leading-relaxed">{aiInsight.trendInsight}</p>
                  <Link to="/reviews" className="mt-2 inline-flex items-center text-hw-purple text-sm font-medium hover:underline">
                    Ver análise completa
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Quick Actions */}
          <div data-tour="dashboard-quick-actions">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/hotels" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <Building2 className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Gerenciar Hotéis</p>
                    <p className="text-sm text-hw-navy-500">Adicionar ou remover hotéis</p>
                  </Link>
                  <Link to="/rates" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <DollarSign className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Analisar Tarifas</p>
                    <p className="text-sm text-hw-navy-500">Ver comparativo de preços</p>
                  </Link>
                  <Link to="/reviews" className="p-4 bg-hw-navy-50 rounded-lg hover:bg-hw-navy-100 transition-colors">
                    <Star className="w-6 h-6 text-hw-purple mb-2" />
                    <p className="font-semibold text-hw-navy-900">Ver Avaliações</p>
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
