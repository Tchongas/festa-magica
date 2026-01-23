# Festa Mágica 🎉

Plataforma brasileira para criação de convites e kits de festa infantil personalizados usando IA (Google Gemini).

## Arquitetura

Este produto faz parte do ecossistema **Hub**, onde usuários compram acesso aos produtos. O Festa Mágica:
- Recebe usuários autenticados via redirect do Hub
- Valida assinaturas (plano trimestral)
- Oferece geração ilimitada durante o período ativo

## Funcionalidades

- 🎨 **Geração de Kits com IA**: Crie 10 itens personalizados (convites, toppers, adesivos, etc.)
- 👶 **Semelhança Facial**: A IA mantém a semelhança com a foto da criança
- 🎭 **Estilos Variados**: Cartoon 2D ou 3D estilo Pixar
- ♾️ **Uso Ilimitado**: Gere quantos kits quiser durante a assinatura
- 🔐 **Auth via Hub**: Autenticação cross-site segura com JWT

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT cross-site (via Hub)
- **IA**: Google Gemini API

## Início Rápido

### 1. Instalar dependências

```bash
cd festa-magica
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o schema SQL em `supabase/schema.sql`
3. Copie as credenciais para `.env.local`

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HUB_JWT_SECRET` (mesmo secret usado no Hub)
- `GEMINI_API_KEY`

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/       # Área logada (criar, meus-kits)
│   ├── api/auth/          # Endpoints de autenticação
│   └── api/generate/      # Endpoints de geração IA
├── components/
│   ├── auth/              # AccessGate, AuthProvider
│   ├── kit-creator/       # Wizard de criação
│   ├── landing/           # Landing page
│   └── ui/                # Componentes base
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── hub/               # JWT validation, activation codes
│   └── gemini/            # Gemini API client
├── hooks/                 # use-auth, use-kit-generation
├── stores/                # Zustand (auth, kit-creator)
└── types/                 # TypeScript interfaces
```

## Documentação

- `docs/DATABASE_COMPARISON.md` - Por que Supabase
- `docs/CROSS_SITE_AUTH.md` - Sistema de autenticação Hub → Produto
- `docs/WOOVI_INTEGRATION.md` - Integração de pagamentos (para o Hub)
- `docs/STORAGE.md` - Estratégia de armazenamento de imagens
- `supabase/schema.sql` - Schema do banco de dados

## Fluxo de Autenticação

```
Hub.com                          FestaMagica.com
   │                                   │
   │ 1. User buys access               │
   │ 2. Generate JWT token             │
   │ 3. Redirect ──────────────────────►
   │                            4. Validate JWT
   │                            5. Create session
   │                            6. Show /criar
```

## Licença

Projeto privado - Todos os direitos reservados.
