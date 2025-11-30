import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMe } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  getOwnHotels,
  getCompetitorHotels,
  getRatesSummary,
  getReviewsSummary,
  getOccupancySummary,
  mockRates,
} from '../../mocks';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart } from '@tremor/react';

export function Dashboard() {
  const { user: clerkUser } = useUser();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hw-purple"></div>
      </div>
    );
  }

  const ownHotels = getOwnHotels();
  const competitorHotels = getCompetitorHotels();
  const ratesSummary = getRatesSummary();
  const reviewsSummary = getReviewsSummary('1');
  const occupancySummary = getOccupancySummary();

  const hasHotels = ownHotels.length > 0;

  const isTrialActive = user?.isTrialActive;
  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Mini chart data (last 7 days)
  const miniChartData = mockRates.slice(0, 7).map(r => ({
    date: r.date.slice(5),
    'Meu Hotel': r.myHotel,
    'Concorrentes': r.avgCompetitor,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-hw-navy-900">
          Ola, {clerkUser?.firstName || 'Hoteleiro'}!
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-hw-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-hw-navy-900">{ownHotels.length}</p>
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
                  <p className="text-2xl font-bold text-hw-navy-900">{competitorHotels.length}</p>
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
                  <p className="text-2xl font-bold text-hw-navy-900">{reviewsSummary.avgRating}</p>
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
                  <p className="text-2xl font-bold text-hw-navy-900">{occupancySummary.avgMyHotel}%</p>
                  <p className="text-sm text-hw-navy-500">Ocupacao Media</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison Highlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Price Position */}
            <Card className={cn(
              'border-2',
              ratesSummary.avgDiff < 0 ? 'border-green-200 bg-green-50/50' :
              ratesSummary.avgDiff > 0 ? 'border-red-200 bg-red-50/50' :
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
                      R$ {ratesSummary.avgMyHotel}
                    </p>
                    <p className="text-sm text-hw-navy-500">Sua tarifa media</p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'flex items-center gap-2 text-2xl font-bold',
                      ratesSummary.avgDiff < 0 ? 'text-green-600' :
                      ratesSummary.avgDiff > 0 ? 'text-red-600' :
                      'text-yellow-600'
                    )}>
                      {ratesSummary.avgDiff < 0 ? <ArrowDown className="w-6 h-6" /> :
                       ratesSummary.avgDiff > 0 ? <ArrowUp className="w-6 h-6" /> :
                       <Minus className="w-6 h-6" />}
                      {Math.abs(ratesSummary.avgDiff)}%
                    </div>
                    <p className="text-sm text-hw-navy-500">
                      {ratesSummary.avgDiff < 0 ? 'Abaixo da media' :
                       ratesSummary.avgDiff > 0 ? 'Acima da media' :
                       'Na media'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    {ratesSummary.cheaper} dias mais barato
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    {ratesSummary.expensive} dias mais caro
                  </span>
                </div>
                <Link to="/rates" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                  Ver detalhes
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Price Evolution Mini Chart */}
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

          {/* Reviews & Occupancy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews Summary */}
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
                      <span className="text-3xl font-bold text-white">{reviewsSummary.avgRating}</span>
                    </div>
                    <p className="text-sm text-hw-navy-500 mt-2">Nota media</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-hw-navy-600">Positivas</span>
                      <span className="font-semibold text-green-600">{reviewsSummary.positive}</span>
                    </div>
                    <div className="w-full bg-hw-navy-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(reviewsSummary.positive / reviewsSummary.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-hw-navy-600">Negativas</span>
                      <span className="font-semibold text-red-600">{reviewsSummary.negative}</span>
                    </div>
                    <div className="w-full bg-hw-navy-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(reviewsSummary.negative / reviewsSummary.total) * 100}%` }}
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

            {/* Occupancy Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Ocupacao
                </CardTitle>
                <CardDescription>Proximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={cn(
                      'w-20 h-20 rounded-xl flex items-center justify-center',
                      occupancySummary.avgMyHotel >= 70 ? 'bg-green-500' :
                      occupancySummary.avgMyHotel >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}>
                      <span className="text-3xl font-bold text-white">{occupancySummary.avgMyHotel}%</span>
                    </div>
                    <p className="text-sm text-hw-navy-500 mt-2">Media geral</p>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                      <span className="text-sm text-hw-navy-600">Fins de semana</span>
                      <span className="font-semibold text-hw-navy-900">{occupancySummary.avgWeekend}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-hw-navy-50 rounded-lg">
                      <span className="text-sm text-hw-navy-600">Dias uteis</span>
                      <span className="font-semibold text-hw-navy-900">{occupancySummary.avgWeekday}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {occupancySummary.diff >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    occupancySummary.diff >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {occupancySummary.diff >= 0 ? '+' : ''}{occupancySummary.diff}% vs concorrentes
                  </span>
                </div>
                <Link to="/occupancy" className="mt-4 inline-flex items-center text-hw-purple font-medium hover:underline">
                  Ver calendario completo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
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
        </>
      )}
    </div>
  );
}
