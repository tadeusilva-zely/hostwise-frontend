# Design: Cupom de Desconto no Checkout

**Data:** 2026-02-19
**Status:** Aprovado

## Contexto

O sistema de billing já suporta checkout via Stripe para os planos Starter, Insight e Professional. Um cupom foi criado no Stripe ("Desconto 3 meses starter" — 100% off, 3 meses, repeating). O objetivo é permitir que usuários insiram esse cupom na tela de planos, aplicável apenas ao plano Insight.

## Requisitos

- Campo de cupom exibido como banner na PricingPage
- Aplicável somente ao plano Insight
- Usuário digita o código → valida no backend → mostra feedback → assina com desconto
- Erro inline (embaixo do campo) se cupom inválido
- Sucesso exibido no banner com detalhes do desconto

## Abordagem Escolhida

Validação server-side via novo endpoint, com `couponId` passado na criação da checkout session.

## Frontend

**Arquivo:** `src/pages/billing/PricingPage.tsx`

- Adicionar banner de cupom acima dos cards (visível apenas se o usuário pode assinar o Insight)
- State: `couponCode` (input), `appliedCoupon` (dados do cupom validado), `couponError`, `couponLoading`
- Ao aplicar: chama `POST /billing/validate-coupon`
- Se válido: armazena `appliedCoupon`, exibe mensagem de sucesso em verde
- Se inválido: exibe mensagem de erro em vermelho embaixo do campo
- Botão "Assinar agora" do Insight: passa `couponId` se `appliedCoupon` estiver definido

**Arquivo:** `src/services/api.ts`

- Nova função `validateCoupon(couponCode: string)`

## Backend

**Arquivo:** `src/modules/billing/billing.routes.ts`

- Novo endpoint `POST /billing/validate-coupon`
- Recebe `{ couponCode: string }`
- Consulta Stripe: `stripe.coupons.retrieve(couponCode)`
- Retorna `{ valid: true, couponId, percentOff, amountOff, name }` ou `{ valid: false }`

**Arquivo:** `src/modules/billing/billing.service.ts`

- `createCheckoutSession` recebe parâmetro opcional `couponId`
- Se `couponId` presente E `priceId === env.STRIPE_PRICE_INSIGHT`: adiciona `discounts: [{ coupon: couponId }]` na session
- Caso contrário: ignora o cupom (segurança server-side)

## Fluxo

```
Usuário digita código
→ POST /billing/validate-coupon
→ { valid: true, couponId, percentOff: 100, name: "Desconto 3 meses starter" }
→ Banner exibe "Cupom aplicado! 100% off por 3 meses"
→ Usuário clica "Assinar agora" no card Insight
→ POST /billing/checkout { priceId: insightPriceId, couponId }
→ Stripe aplica desconto na checkout session
```

## O que NÃO muda

- Fluxo dos planos Starter e Professional
- Webhook handlers
- Schema do banco (cupom é gerenciado 100% pelo Stripe)
