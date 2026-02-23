# Coupon Code Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir que usuários insiram um código de cupom na PricingPage para obter desconto no plano Insight.

**Architecture:** Novo endpoint `POST /billing/validate-coupon` no backend valida o cupom via Stripe API e retorna os dados. O frontend exibe um banner com campo de input na PricingPage; ao validar com sucesso, o botão "Assinar agora" do Insight inclui o `couponId` no checkout. A restrição ao plano Insight é feita server-side.

**Tech Stack:** Fastify (backend), React + TanStack Query (frontend), Stripe Node SDK, TypeScript, Zod

---

### Task 1: Endpoint de validação de cupom (backend)

**Files:**
- Modify: `hostwise-api/src/modules/billing/billing.routes.ts`

**Step 1: Adicionar schema de validação e endpoint**

No arquivo `hostwise-api/src/modules/billing/billing.routes.ts`, adicionar logo após o schema `checkoutSchema` existente (linha ~11):

```typescript
const validateCouponSchema = z.object({
  couponCode: z.string().min(1),
});
```

Depois, adicionar o endpoint dentro da função `billingRoutes`, após o endpoint `/portal`:

```typescript
// POST /billing/validate-coupon - Validate a Stripe coupon code
fastify.post(
  '/validate-coupon',
  { preHandler: requireOwner },
  async (request, reply) => {
    try {
      const { couponCode } = validateCouponSchema.parse(request.body);

      const coupon = await stripe.coupons.retrieve(couponCode);

      if (!coupon || coupon.deleted || !coupon.valid) {
        return { valid: false };
      }

      return {
        valid: true,
        couponId: coupon.id,
        name: coupon.name,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off,
      };
    } catch (error: unknown) {
      // Stripe throws when coupon not found
      if (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        (error as { type: string }).type === 'StripeInvalidRequestError'
      ) {
        return { valid: false };
      }
      console.error('Validate coupon error:', error);
      return reply.status(500).send({ error: 'Failed to validate coupon' });
    }
  }
);
```

> **Nota:** o `stripe` já está importado no arquivo via `import { stripe } from '../../lib/stripe.js'` — confirme que esse import já existe ou adicione.

**Step 2: Verificar import do stripe no billing.routes.ts**

O arquivo atual importa de `billing.service.ts` mas não importa `stripe` diretamente. Adicionar import no topo do arquivo se necessário:

```typescript
import { stripe } from '../../lib/stripe.js';
```

**Step 3: Testar manualmente**

```bash
curl -X POST http://localhost:3001/api/billing/validate-coupon \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"couponCode": "TF9XoIdv"}'
```

Resposta esperada:
```json
{
  "valid": true,
  "couponId": "TF9XoIdv",
  "name": "Desconto 3 meses starter",
  "percentOff": 100,
  "amountOff": null
}
```

**Step 4: Commit**

```bash
cd hostwise-api
git add src/modules/billing/billing.routes.ts
git commit -m "feat: add POST /billing/validate-coupon endpoint"
```

---

### Task 2: Suporte a couponId no createCheckoutSession (backend)

**Files:**
- Modify: `hostwise-api/src/modules/billing/billing.service.ts`
- Modify: `hostwise-api/src/modules/billing/billing.routes.ts`

**Step 1: Atualizar assinatura de createCheckoutSession**

No arquivo `hostwise-api/src/modules/billing/billing.service.ts`, alterar a assinatura da função `createCheckoutSession` (linha 12) para aceitar `couponId` opcional:

```typescript
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  couponId?: string
)
```

**Step 2: Aplicar cupom na session apenas para o Insight**

Ainda no `billing.service.ts`, dentro de `stripe.checkout.sessions.create(...)`, adicionar após o campo `mode: 'subscription'`:

```typescript
// Apply coupon only for Insight plan
...(couponId && priceId === env.STRIPE_PRICE_INSIGHT
  ? { discounts: [{ coupon: couponId }] }
  : {}),
```

O bloco `stripe.checkout.sessions.create` fica assim:

```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'subscription',
  // Apply coupon only for Insight plan
  ...(couponId && priceId === env.STRIPE_PRICE_INSIGHT
    ? { discounts: [{ coupon: couponId }] }
    : {}),
  success_url: successUrl,
  cancel_url: cancelUrl,
  subscription_data: {
    ...(shouldGiveTrial ? { trial_period_days: 7 } : {}),
    metadata: {
      organizationId: organization.id,
      userId: user.id,
    },
  },
  metadata: {
    organizationId: organization.id,
    userId: user.id,
  },
});
```

**Step 3: Atualizar billing.routes.ts para aceitar e passar couponId**

No endpoint `POST /checkout` em `billing.routes.ts`, atualizar o schema e a chamada:

Schema (linha ~11):
```typescript
const checkoutSchema = z.object({
  priceId: z.string(),
  couponId: z.string().optional(),
});
```

Na chamada de `createCheckoutSession` (linha ~37):
```typescript
const { priceId, couponId } = checkoutSchema.parse(request.body);

// ... código existente ...

const session = await createCheckoutSession(
  user.id,
  priceId,
  `${env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  `${env.FRONTEND_URL}/billing/canceled`,
  couponId
);
```

**Step 4: Commit**

```bash
cd hostwise-api
git add src/modules/billing/billing.service.ts src/modules/billing/billing.routes.ts
git commit -m "feat: support optional couponId in checkout session (Insight only)"
```

---

### Task 3: Função validateCoupon no api.ts (frontend)

**Files:**
- Modify: `hostwise-frontend/src/services/api.ts`

**Step 1: Adicionar tipo e função**

No arquivo `hostwise-frontend/src/services/api.ts`, após a função `createCheckoutSession` (linha ~146), adicionar:

```typescript
export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  name?: string;
  percentOff?: number | null;
  amountOff?: number | null;
}

export async function validateCoupon(couponCode: string): Promise<CouponValidationResult> {
  const response = await api.post<CouponValidationResult>('/billing/validate-coupon', { couponCode });
  return response.data;
}
```

**Step 2: Atualizar createCheckoutSession para aceitar couponId opcional**

Alterar a função existente (linha ~143):

```typescript
export async function createCheckoutSession(priceId: string, couponId?: string): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/billing/checkout', { priceId, couponId });
  return response.data;
}
```

**Step 3: Commit**

```bash
cd hostwise-frontend
git add src/services/api.ts
git commit -m "feat: add validateCoupon function and update createCheckoutSession signature"
```

---

### Task 4: Banner de cupom na PricingPage (frontend)

**Files:**
- Modify: `hostwise-frontend/src/pages/billing/PricingPage.tsx`

**Step 1: Adicionar imports necessários**

No topo do arquivo, atualizar imports:

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Settings, Clock, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPrices, createCheckoutSession, getMe, validateCoupon, type CouponValidationResult } from '../../services/api';
import { cn } from '../../lib/utils';
```

**Step 2: Adicionar estados de cupom**

Logo após `const [selectedPrice, setSelectedPrice] = useState<string | null>(null);` (linha ~54), adicionar:

```typescript
const [couponCode, setCouponCode] = useState('');
const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
const [couponError, setCouponError] = useState<string | null>(null);
```

**Step 3: Adicionar mutation de validação de cupom**

Após o `checkoutMutation` (linha ~66), adicionar:

```typescript
const validateCouponMutation = useMutation({
  mutationFn: validateCoupon,
  onSuccess: (data) => {
    if (data.valid) {
      setAppliedCoupon(data);
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
```

**Step 4: Atualizar handleCheckout para passar couponId**

Substituir a função `handleCheckout` (linha ~75):

```typescript
const handleCheckout = (priceId: string, isInsight?: boolean) => {
  setSelectedPrice(priceId);
  const couponId = isInsight && appliedCoupon?.couponId ? appliedCoupon.couponId : undefined;
  checkoutMutation.mutate({ priceId, couponId } as unknown as string);
};
```

> **Nota:** Como o `useMutation` foi tipado com `string`, vamos ajustar o tipo. Alterar o `checkoutMutation`:

```typescript
const checkoutMutation = useMutation({
  mutationFn: ({ priceId, couponId }: { priceId: string; couponId?: string }) =>
    createCheckoutSession(priceId, couponId),
  onSuccess: (data) => {
    if (data.url) {
      window.location.href = data.url;
    }
  },
});
```

E `handleCheckout`:

```typescript
const handleCheckout = (priceId: string, isInsight?: boolean) => {
  setSelectedPrice(priceId);
  const couponId = isInsight && appliedCoupon?.couponId ? appliedCoupon.couponId : undefined;
  checkoutMutation.mutate({ priceId, couponId });
};
```

**Step 5: Adicionar o banner de cupom no JSX**

Logo antes do `<div className="grid md:grid-cols-3 gap-6">` (linha ~152), adicionar:

```tsx
{/* Coupon Banner — visible only for users who can subscribe to Insight */}
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
```

**Step 6: Atualizar o botão "Assinar agora" do Insight para passar isInsight**

No mapa de cards, localizar o `onClick` do botão e atualizar:

```tsx
onClick={() => handleCheckout(plan.id, plan.name === 'Insight')}
```

**Step 7: Commit**

```bash
cd hostwise-frontend
git add src/pages/billing/PricingPage.tsx
git commit -m "feat: add coupon banner to PricingPage with validation and Insight-only discount"
```

---

## Teste manual completo

1. Acessar `/billing` como usuário STARTER
2. Ver o banner "Tem um cupom de desconto?"
3. Digitar `TF9XoIdv` e clicar "Aplicar"
4. Verificar mensagem de sucesso: "Cupom aplicado: Desconto 3 meses starter — 100% de desconto — válido para o plano Insight"
5. Clicar "Assinar agora" no card Insight
6. Verificar que o Stripe Checkout mostra o desconto aplicado
7. Testar com cupom inválido: digitar `INVALIDO` → ver erro "Cupom inválido ou expirado."
8. Verificar que os planos Starter e Professional NÃO aplicam o cupom (mesmo se digitado)
