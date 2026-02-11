import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, CreditCard, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMe, createPortalSession, getHotels } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function ManageSubscription() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotels,
  });

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hw-purple"></div>
      </div>
    );
  }

  const planName = user?.plan === 'STARTER' ? 'Starter' : user?.plan === 'INSIGHT' ? 'Insight' : 'Pro';
  const isFreePlan = user?.plan === 'STARTER';

  const ownHotelsCount = hotelsData?.ownHotels?.length || 0;
  const competitorsCount = hotelsData?.competitorHotels?.length || 0;
  const maxOwnHotels = user?.limits.maxProperties || 0;
  const maxCompetitors = user?.limits.maxCompetitors || 0;

  const ownHotelsPercent = maxOwnHotels > 0 ? Math.round((ownHotelsCount / maxOwnHotels) * 100) : 0;
  const competitorsPercent = maxCompetitors > 0 ? Math.round((competitorsCount / maxCompetitors) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-navy-900">Assinatura</h1>
        <p className="text-hw-navy-500 mt-1">
          Gerencie seu plano e método de pagamento.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-hw-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-hw-purple" />
              </div>
              <div>
                <p className="font-semibold text-hw-navy-900 text-lg">
                  {planName}
                  {user?.isTrialActive && (
                    <span className="ml-2 text-sm bg-hw-purple-100 text-hw-purple px-2 py-0.5 rounded">
                      Trial
                    </span>
                  )}
                </p>
                <p className="text-sm text-hw-navy-500">
                  {user?.limits.maxCompetitors} concorrente{user?.limits.maxCompetitors !== 1 ? 's' : ''} •{' '}
                  Atualização a cada {user?.limits.updateIntervalHours}h
                </p>
              </div>
            </div>
            <Link to="/billing">
              <Button variant="secondary" size="sm">
                Alterar plano
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Trial Info */}
      {user?.isTrialActive && user?.trialEndsAt && (
        <Card className="border-hw-purple-200 bg-hw-purple-50">
          <CardContent className="flex items-center gap-4 py-4">
            <Calendar className="w-6 h-6 text-hw-purple" />
            <div>
              <p className="font-medium text-hw-navy-900">
                Período de teste termina em {formatDate(user.trialEndsAt)}
              </p>
              <p className="text-sm text-hw-navy-600">
                Após o período de teste, você será movido para o plano Starter gratuito.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Portal */}
      {!isFreePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-hw-navy-600 mb-4">
              Atualize seu método de pagamento, veja faturas anteriores ou cancele sua assinatura.
            </p>
            <Button
              variant="secondary"
              onClick={() => portalMutation.mutate()}
              isLoading={portalMutation.isPending}
            >
              Abrir Portal de Pagamento
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-hw-navy-600">Concorrentes</span>
                <span className="font-medium text-hw-navy-900">
                  {competitorsCount} / {maxCompetitors}
                </span>
              </div>
              <div className="h-2 bg-hw-navy-100 rounded-full">
                <div
                  className="h-2 bg-hw-purple rounded-full"
                  style={{ width: `${competitorsPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-hw-navy-600">Propriedades</span>
                <span className="font-medium text-hw-navy-900">
                  {ownHotelsCount} / {maxOwnHotels}
                </span>
              </div>
              <div className="h-2 bg-hw-navy-100 rounded-full">
                <div
                  className="h-2 bg-hw-green rounded-full"
                  style={{ width: `${ownHotelsPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
