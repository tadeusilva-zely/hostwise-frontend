import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPrices, createCheckoutSession, getMe } from '../../services/api';
import { cn } from '../../lib/utils';

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

  // Add Starter plan info
  const allPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'BRL',
      interval: 'month',
      features: [
        '1 concorrente monitorado',
        'Atualização a cada 24 horas',
        '15 dias de horizonte',
        'Sem histórico',
        'Sem alertas',
      ],
      isFree: true,
    },
    ...prices,
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
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isPopular = plan.name === 'Insight';
          const isCurrentPlan = user?.plan === plan.name.toUpperCase();
          const isFree = 'isFree' in plan && plan.isFree;

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

                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-hw-navy-900">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-hw-navy-500">/mês</span>
                  )}
                </div>

                {isFree ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano atual' : 'Plano gratuito'}
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'success' : 'primary'}
                    className="w-full"
                    onClick={() => handleCheckout(plan.id)}
                    isLoading={checkoutMutation.isPending && selectedPrice === plan.id}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano atual' : 'Assinar agora'}
                  </Button>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-hw-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-hw-navy-600">{feature}</span>
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
          Todos os planos incluem 15 dias de teste grátis.{' '}
          <a href="#" className="text-hw-purple hover:underline">
            Dúvidas? Fale conosco
          </a>
        </p>
      </div>
    </div>
  );
}
