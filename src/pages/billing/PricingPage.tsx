import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Settings, Clock, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { getPrices, createCheckoutSession, getMe, validateCoupon, redeemPromoCode, type CouponValidationResult } from '../../services/api';

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
  const [promoRedeemed, setPromoRedeemed] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const redeemPromoMutation = useMutation({
    mutationFn: redeemPromoCode,
    onSuccess: () => {
      setPromoRedeemed(true);
      setCouponCode('');
      setCouponError(null);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setTimeout(() => navigate('/dashboard'), 2000);
    },
    onError: (error: { response?: { status?: number; data?: { error?: string } } }) => {
      // 404 = not an internal promo code, try Stripe coupon
      if (error.response?.status === 404) {
        validateCouponMutation.mutate(couponCode.trim());
      } else {
        setCouponError(error.response?.data?.error || 'Erro ao resgatar cupom.');
      }
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    // Try internal promo code first, fallback to Stripe coupon on 404
    redeemPromoMutation.mutate(couponCode.trim());
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4f46e5' }} />
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

  const starterPrice = prices.find((p: { name: string }) => p.name === 'Starter');
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
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>
          Escolha seu plano
        </h1>
        <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
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
        <div
          className="mb-8 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4" style={{ color: '#818cf8' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Tem um cupom de desconto?</span>
          </div>

          {promoRedeemed ? (
            <div
              className="flex items-center rounded-lg px-4 py-3"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                  Cupom resgatado com sucesso!
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Seu plano foi atualizado. Redirecionando...
                </p>
              </div>
            </div>
          ) : appliedCoupon ? (
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                  Cupom aplicado: {appliedCoupon.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
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
                className="ml-4 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
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
                  className="input flex-1 text-sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyCoupon}
                  isLoading={redeemPromoMutation.isPending || validateCouponMutation.isPending}
                  disabled={!couponCode.trim()}
                >
                  Aplicar
                </Button>
              </div>
              {couponError && (
                <p className="mt-1.5 text-xs text-red-400">{couponError}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 pt-3">
        {allPlans.map((plan) => {
          const isPopular = plan.name === 'Insight';
          const isCurrentPlan = !isTrialExpired && (user?.plan === plan.name.toUpperCase() || (plan.name === 'Professional' && user?.plan === 'PRO'));
          const isStarter = plan.isStarter;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl ${isPopular ? 'mt-0' : ''}`}
              style={{
                backgroundColor: 'var(--surface-card)',
                border: isPopular
                  ? '2px solid #10b981'
                  : '1px solid var(--surface-border)',
                boxShadow: isPopular ? '0 0 0 4px rgba(16,185,129,0.1)' : undefined,
              }}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="text-sm font-semibold px-4 py-1 rounded-full text-white" style={{ backgroundColor: '#10b981' }}>
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Lexend', sans-serif" }}>{plan.name}</h3>

                <div className="mt-4 mb-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    R$ {plan.price}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/mês</span>
                </div>

                {isStarter && (
                  <p className="text-sm font-medium mb-4" style={{ color: '#10b981' }}>
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
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                      <span className="text-sm flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {feature.text}
                        {feature.comingSoon && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
                          >
                            <Clock className="w-3 h-3" />
                            em breve
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ or additional info */}
      <div className="mt-12 text-center">
        <p style={{ color: 'var(--text-muted)' }}>
          Todos os planos incluem 7 dias de teste grátis.{' '}
          <a href="#" className="hover:underline" style={{ color: '#818cf8' }}>
            Dúvidas? Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
}
