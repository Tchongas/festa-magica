# Comparação de Provedores: Firebase vs Supabase vs Convex

## Resumo Executivo

**Recomendação: Supabase** para este projeto específico.

---

## Análise Detalhada

### 1. Firebase (Google)

#### Free Tier
| Recurso | Limite Gratuito |
|---------|-----------------|
| Auth | 50k MAU |
| Firestore | 1GB storage, 50k reads/day, 20k writes/day |
| Storage | 5GB, 1GB/day download |
| Functions | 2M invocations/month |

#### Prós
- ✅ Excelente SDK para React/Next.js
- ✅ Auth muito robusto (Google, email, phone)
- ✅ Realtime listeners nativos
- ✅ Boa documentação

#### Contras
- ❌ NoSQL (Firestore) - queries complexas são difíceis
- ❌ Vendor lock-in forte
- ❌ Custos escalam rápido após free tier
- ❌ Não tem SQL - difícil fazer relatórios

#### Para este projeto
- Auth cross-site: **Médio** - precisa de custom tokens
- Custo estimado: **R$ 0-50/mês** para MVP

---

### 2. Supabase (PostgreSQL)

#### Free Tier
| Recurso | Limite Gratuito |
|---------|-----------------|
| Auth | Ilimitado |
| Database | 500MB |
| Storage | 1GB |
| Edge Functions | 500k invocations |
| Bandwidth | 5GB |

#### Prós
- ✅ **PostgreSQL** - queries SQL completas
- ✅ Auth com JWT customizável
- ✅ Row Level Security (RLS) nativo
- ✅ Realtime subscriptions
- ✅ **Self-hostable** (sem vendor lock-in)
- ✅ API REST automática
- ✅ Edge Functions (Deno)

#### Contras
- ❌ Free tier pausa após 7 dias de inatividade
- ❌ Menos maduro que Firebase
- ❌ Storage menos robusto

#### Para este projeto
- Auth cross-site: **EXCELENTE** - JWT nativo, fácil de validar entre domínios
- Custo estimado: **R$ 0/mês** para MVP (free tier generoso)

---

### 3. Convex

#### Free Tier
| Recurso | Limite Gratuito |
|---------|-----------------|
| Database | 1GB |
| Bandwidth | 1GB/day |
| Functions | Ilimitado |

#### Prós
- ✅ TypeScript end-to-end
- ✅ Realtime por padrão
- ✅ Queries são funções TypeScript
- ✅ Muito developer-friendly

#### Contras
- ❌ **Sem auth próprio** - precisa integrar (Clerk, Auth0)
- ❌ Muito novo (menos comunidade)
- ❌ Vendor lock-in total
- ❌ Não tem storage de arquivos

#### Para este projeto
- Auth cross-site: **Ruim** - precisa de terceiro (Clerk = $$$)
- Custo estimado: **R$ 50-100/mês** (Clerk obrigatório)

---

### 4. Outras Opções

#### PlanetScale (MySQL)
- Free tier: 5GB, 1B reads/month
- Sem auth - precisa integrar
- Bom para escala, ruim para MVP

#### Neon (PostgreSQL)
- Free tier: 512MB, 3GB storage
- Serverless PostgreSQL
- Sem auth próprio

#### Appwrite
- Self-hosted ou cloud
- Auth + DB + Storage
- Free tier limitado no cloud

---

## Comparação para Cross-Site Auth (Hub → Festa Mágica)

| Provider | Facilidade | Segurança | Custo |
|----------|------------|-----------|-------|
| **Supabase** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Grátis |
| Firebase | ⭐⭐⭐ | ⭐⭐⭐⭐ | Grátis |
| Convex + Clerk | ⭐⭐ | ⭐⭐⭐⭐⭐ | $25+/mês |

### Por que Supabase é melhor para cross-site auth:

1. **JWT Nativo**: Supabase usa JWT padrão que pode ser validado em qualquer lugar
2. **Custom Claims**: Pode adicionar `products: ['festa-magica']` no token
3. **Refresh Tokens**: Gerenciamento automático
4. **RLS**: Segurança no nível do banco de dados

---

## Arquitetura Recomendada

```
┌─────────────────┐         ┌─────────────────┐
│    hub.com      │         │  festamagica    │
│   (Supabase)    │         │   (Supabase)    │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  1. User buys product     │
         │  2. Generate activation   │
         │     code                  │
         │                           │
         │  3. Redirect with         │
         │     signed JWT            │
         ├──────────────────────────►│
         │                           │
         │                    4. Validate JWT
         │                    5. Check product access
         │                    6. Create session
         │                           │
         └───────────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   Supabase    │
            │  (shared DB)  │
            └───────────────┘
```

---

## Decisão Final

### Use **Supabase** porque:

1. **Free tier mais generoso** para auth (ilimitado vs 50k)
2. **JWT padrão** facilita cross-site auth
3. **PostgreSQL** permite queries complexas para relatórios
4. **Self-hostable** se precisar escalar sem custos
5. **Row Level Security** para segurança robusta
6. **Melhor fit** para sistema multi-produto (hub)

### Migração necessária:
- Firebase Auth → Supabase Auth
- Firestore → Supabase PostgreSQL
- Firebase Storage → Supabase Storage (ou Cloudflare R2)

---

## Custos Estimados (12 meses)

| Provider | MVP (0-100 users) | Growth (100-1000) | Scale (1000+) |
|----------|-------------------|-------------------|---------------|
| Supabase | R$ 0 | R$ 0-100 | R$ 100-500 |
| Firebase | R$ 0 | R$ 50-200 | R$ 200-1000 |
| Convex+Clerk | R$ 125+ | R$ 250+ | R$ 500+ |

**Supabase é a escolha clara para este projeto.**
