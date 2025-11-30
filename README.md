# HostWise Frontend

Frontend da plataforma HostWise - Inteligência competitiva para hotéis.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Components:** Tremor (dashboards/charts)
- **Auth:** Clerk
- **State:** React Query (TanStack Query)
- **Routing:** React Router

## Estrutura do Projeto

```
src/
├── main.tsx            # Entry point
├── App.tsx             # App with providers
├── routes.tsx          # React Router config
├── index.css           # Tailwind + custom styles
├── components/
│   ├── ui/             # Base components (Button, Card)
│   └── layout/         # Layout components (Sidebar, Header)
├── pages/
│   ├── auth/           # Sign In / Sign Up
│   ├── dashboard/      # Dashboard page
│   ├── billing/        # Pricing, Checkout, Manage
│   └── settings/       # Settings page
├── hooks/              # Custom hooks
├── services/
│   └── api.ts          # API client (axios)
├── lib/
│   └── utils.ts        # Utility functions
└── types/
    └── index.ts        # TypeScript types
```

## Setup

### 1. Instalar dependências

```bash
npm install --legacy-peer-deps
```

> Nota: O `--legacy-peer-deps` é necessário porque o Tremor ainda não suporta React 19 oficialmente.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Roda ESLint |

## Paleta de Cores

O HostWise usa uma paleta customizada definida no Tailwind:

| Cor | Classe | Hex | Uso |
|-----|--------|-----|-----|
| Purple | `hw-purple` | #8B3DFF | Marca, CTAs |
| Green | `hw-green` | #10B981 | Sucesso, conversão |
| Navy | `hw-navy` | #0F172A | Textos, fundos |

### Exemplos de uso:

```jsx
// Cores sólidas
<div className="bg-hw-purple text-white">Botão</div>
<div className="bg-hw-green-100 text-hw-green-800">Badge</div>

// Gradientes
<div className="bg-hw-gradient">Hero</div>
<div className="bg-hw-gradient-dark">Footer</div>

// Variações
<div className="bg-hw-purple-50">Light background</div>
<div className="text-hw-navy-600">Secondary text</div>
```

## Componentes Customizados

### Button
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="ghost">Ghost</Button>
<Button isLoading>Loading...</Button>
```

### Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL da API backend |
| `VITE_CLERK_PUBLISHABLE_KEY` | Chave pública do Clerk |

## Páginas

| Rota | Descrição |
|------|-----------|
| `/sign-in` | Login |
| `/sign-up` | Registro |
| `/dashboard` | Dashboard principal |
| `/billing` | Planos e preços |
| `/billing/success` | Checkout sucesso |
| `/billing/manage` | Gerenciar assinatura |
| `/settings` | Configurações |
| `/competitors` | Concorrentes (em breve) |
| `/rates` | Tarifas (em breve) |
| `/occupancy` | Lotação (em breve) |
| `/reviews` | Avaliações (em breve) |
# hostwise-frontend
