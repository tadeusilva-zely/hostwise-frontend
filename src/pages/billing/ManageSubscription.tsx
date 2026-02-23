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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4f46e5' }} />
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
          Assinatura
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
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
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.2))' }}
              >
                <CreditCard className="w-6 h-6" style={{ color: '#818cf8' }} />
              </div>
              <div>
                <p className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  {planName}
                  {user?.isTrialActive && (
                    <span
                      className="text-sm px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: 'rgba(79,70,229,0.2)', color: '#818cf8' }}
                    >
                      Trial
                    </span>
                  )}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.1))',
            border: '1px solid rgba(79,70,229,0.3)',
          }}
        >
          <Calendar className="w-6 h-6 flex-shrink-0" style={{ color: '#818cf8' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Período de teste termina em {formatDate(user.trialEndsAt)}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Após o período de teste, você será movido para o plano Starter gratuito.
            </p>
          </div>
        </div>
      )}

      {/* Billing Portal */}
      {!isFreePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
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
                <span style={{ color: 'var(--text-secondary)' }}>Concorrentes</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {competitorsCount} / {maxCompetitors}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${competitorsPercent}%`, backgroundColor: '#4f46e5' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Propriedades</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {ownHotelsCount} / {maxOwnHotels}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${ownHotelsPercent}%`, backgroundColor: '#10b981' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
