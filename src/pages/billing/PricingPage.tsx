import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Settings, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPrices, createCheckoutSession, getMe } from '../../services/api';
import { cn } from '../../lib/utils';

type PlanFeature = {
  text: string;
  comingSoon?: boolean;
};

type PlanDefinition = {
  id: string;
  name: string;
  price: number | 'trial';
  trialDays?: number;
  currency: string;
  interval: string;
  features: PlanFeature[];
  isFree?: boolean;
  isStarter?: boolean;
};

const STARTER_FEATURES: PlanFeature[] = [
  { text: '1 Concorrente Monitorado' },
  { text: 'Espião de Tarifas (7 dias futuros)' },
  { text: 'Sensor de Lotação (7 dias futuros)' },
  { text: 'Raio-X: Últimas 10 avaliações' },
];

const INSIGHT_FEATURES: PlanFeature[] = [
  { text: '5 Concorrentes Monitorados' },
  { text: 'Atualização a cada 24h' },
  { text: 'Espião de Tarifas (90 dias futuro e passado)' },
  { text: 'Sensor de Lotação (90 dias futuro)' },
  { text: 'Raio-X de avaliações: Análise IA ilimitada de histórico e atualizada diariamente' },
  { text: 'Alertas Ativos (Email)' },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: '15 Concorrentes Monitorados' },
  { text: 'Gestão Multi-Propriedade (3 Hotéis)', comingSoon: true },
  { text: 'Atualização a cada 24h' },
  { text: 'Espião de Tarifas (90 dias futuro e passado)' },
  { text: 'Sensor de Lotação (90 dias futuro)' },
  { text: 'Raio-X de avaliações: Análise IA ilimitada de histórico e atualizada diariamente' },
  { text: 'Alertas Ativos (Email)' },
];

export function PricingPage() {
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: pricesData, isLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: getPrices,
  });

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleCheckout = (priceId: string) => {
    setSelectedPrice(priceId);
    checkoutMutation.mutate(priceId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hw-purple"></div>
      </div>
    );
  }

  const prices = pricesData?.prices || [];
  const hasPaidPlan = user?.plan !== 'STARTER';

  // Find Starter price from Stripe if available
  const starterPrice = prices.find((p: { name: string }) => p.name === 'Starter');
  // Find Insight and Pro prices
  const insightPrice = prices.find((p: { name: string }) => p.name === 'Insight');
  const proPrice = prices.find((p: { name: string }) => p.name === 'Professional' || p.name === 'Pro');

  const allPlans: PlanDefinition[] = [
    {
      id: starterPrice?.id || 'starter',
      name: 'Starter',
      price: 57,
      trialDays: 7,
      currency: 'BRL',
      interval: 'month',
      features: STARTER_FEATURES,
      isStarter: true,
    },
    {
      id: insightPrice?.id || 'insight',
      name: 'Insight',
      price: 127,
      currency: 'BRL',
      interval: 'month',
      features: INSIGHT_FEATURES,
    },
    {
      id: proPrice?.id || 'pro',
      name: 'Professional',
      price: 297,
      currency: 'BRL',
      interval: 'month',
      features: PRO_FEATURES,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-hw-navy-900 mb-3">
          Escolha seu plano
        </h1>
        <p className="text-hw-navy-600 max-w-2xl mx-auto">
          Monitore a concorrência e otimize suas tarifas com inteligência de mercado.
        </p>
        {hasPaidPlan && (
          <div className="mt-4">
            <Link to="/billing/manage">
              <Button variant="secondary" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar assinatura
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isPopular = plan.name === 'Insight';
          const isCurrentPlan = user?.plan === plan.name.toUpperCase() || (plan.name === 'Professional' && user?.plan === 'PRO');
          const isStarter = plan.isStarter;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                isPopular && 'border-2 border-hw-green ring-2 ring-hw-green/20'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-hw-green text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-hw-navy-900">{plan.name}</h3>

                <div className="mt-4 mb-1">
                  <span className="text-4xl font-bold text-hw-navy-900">
                    R$ {plan.price}
                  </span>
                  <span className="text-hw-navy-500">/mês</span>
                </div>

                {isStarter && (
                  <p className="text-sm text-hw-green font-medium mb-4">
                    7 dias grátis para começar
                  </p>
                )}

                {!isStarter && <div className="mb-4" />}

                {isCurrentPlan ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled
                  >
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'success' : 'primary'}
                    className="w-full"
                    onClick={() => handleCheckout(plan.id)}
                    isLoading={checkoutMutation.isPending && selectedPrice === plan.id}
                  >
                    {isStarter ? 'Começar grátis' : 'Assinar agora'}
                  </Button>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-hw-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-hw-navy-600 flex items-center gap-2 flex-wrap">
                        {feature.text}
                        {feature.comingSoon && (
                          <span className="inline-flex items-center gap-1 bg-hw-navy-100 text-hw-navy-500 text-xs px-2 py-0.5 rounded-full font-medium">
                            <Clock className="w-3 h-3" />
                            em breve
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ or additional info */}
      <div className="mt-12 text-center">
        <p className="text-hw-navy-500">
          Todos os planos incluem 7 dias de teste grátis.{' '}
          <a href="#" className="text-hw-purple hover:underline">
            Dúvidas? Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
}
