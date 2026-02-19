import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Settings, Clock, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPrices, createCheckoutSession, getMe, validateCoupon, type CouponValidationResult } from '../../services/api';
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: pricesData, isLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: getPrices,
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ priceId, couponId }: { priceId: string; couponId?: string }) =>
      createCheckoutSession(priceId, couponId),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const validateCouponMutation = useMutation({
    mutationFn: validateCoupon,
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon(data);
        setCouponCode('');
        setCouponError(null);
      } else {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      }
    },
    onError: () => {
      setCouponError('Erro ao validar o cupom. Tente novamente.');
      setAppliedCoupon(null);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    validateCouponMutation.mutate(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleCheckout = (priceId: string, isInsight?: boolean) => {
    setSelectedPrice(priceId);
    const couponId = isInsight && appliedCoupon?.couponId ? appliedCoupon.couponId : undefined;
    checkoutMutation.mutate({ priceId, couponId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hw-purple"></div>
      </div>
    );
  }

  const prices = pricesData?.prices || [];
  const hasPaidPlan = user?.plan === 'INSIGHT' || user?.plan === 'PRO';
  const isTrialExpired =
    user?.plan === 'STARTER' &&
    !user?.isTrialActive &&
    !!user?.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date();

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

      {/* Coupon Banner */}
      {!hasPaidPlan && (
        <div className="mb-8 p-4 rounded-xl border border-hw-navy-200 bg-hw-navy-50">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-hw-purple" />
            <span className="text-sm font-semibold text-hw-navy-700">Tem um cupom de desconto?</span>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-hw-green/10 border border-hw-green/30 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-hw-green">
                  Cupom aplicado: {appliedCoupon.name}
                </p>
                <p className="text-xs text-hw-navy-500 mt-0.5">
                  {appliedCoupon.percentOff
                    ? `${appliedCoupon.percentOff}% de desconto`
                    : appliedCoupon.amountOff
                    ? `R$ ${(appliedCoupon.amountOff / 100).toFixed(2)} de desconto`
                    : 'Desconto aplicado'}
                  {' '}— válido para o plano Insight
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-hw-navy-400 hover:text-hw-navy-600 ml-4"
                aria-label="Remover cupom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Digite seu cupom"
                  className="flex-1 px-3 py-2 text-sm border border-hw-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw-purple/30 bg-white"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyCoupon}
                  isLoading={validateCouponMutation.isPending}
                  disabled={!couponCode.trim()}
                >
                  Aplicar
                </Button>
              </div>
              {couponError && (
                <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isPopular = plan.name === 'Insight';
          // When trial expired, Starter is NOT considered current plan — user must subscribe to continue
          const isCurrentPlan = !isTrialExpired && (user?.plan === plan.name.toUpperCase() || (plan.name === 'Professional' && user?.plan === 'PRO'));
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
                    onClick={() => handleCheckout(plan.id, plan.name === 'Insight')}
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
