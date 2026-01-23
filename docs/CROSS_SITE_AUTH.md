# Sistema de Autenticação Cross-Site (Hub → Festa Mágica)

## Visão Geral

O Hub é o portal central onde usuários compram acesso aos produtos. Quando um usuário compra "Festa Mágica", ele recebe um código de ativação e pode ser redirecionado para o produto com sessão já autenticada.

---

## Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────────────────┐
│                         FLUXO COMPLETO                           │
└──────────────────────────────────────────────────────────────────┘

1. COMPRA NO HUB
   ┌─────────┐
   │  Hub    │ → Usuário compra "Festa Mágica"
   └────┬────┘
        │
        ▼
   ┌─────────────────────────────────────┐
   │ Gera código de ativação único       │
   │ Ex: FM-2024-XXXX-YYYY-ZZZZ          │
   │                                     │
   │ Salva no banco:                     │
   │ - user_id                           │
   │ - product_id: 'festa-magica'        │
   │ - expires_at: now + 3 months        │
   │ - activation_code                   │
   └────┬────────────────────────────────┘
        │
        ▼
2. REDIRECIONAMENTO SEGURO
   ┌─────────────────────────────────────┐
   │ Hub gera token JWT assinado:        │
   │                                     │
   │ {                                   │
   │   sub: user_id,                     │
   │   email: user@email.com,            │
   │   product: 'festa-magica',          │
   │   exp: now + 5 minutes,             │
   │   iat: now,                         │
   │   nonce: random_string              │
   │ }                                   │
   │                                     │
   │ Assinado com: HUB_JWT_SECRET        │
   └────┬────────────────────────────────┘
        │
        │  Redirect: festamagica.com/auth/callback?token=JWT
        ▼
3. VALIDAÇÃO NO FESTA MÁGICA
   ┌─────────────────────────────────────┐
   │ /auth/callback recebe token         │
   │                                     │
   │ 1. Verifica assinatura JWT          │
   │ 2. Verifica expiração (5 min)       │
   │ 3. Verifica nonce (anti-replay)     │
   │ 4. Verifica produto = festa-magica  │
   │ 5. Verifica subscription ativa      │
   └────┬────────────────────────────────┘
        │
        ▼
4. CRIAÇÃO DE SESSÃO LOCAL
   ┌─────────────────────────────────────┐
   │ Se válido:                          │
   │ - Cria/atualiza usuário local       │
   │ - Gera session cookie (httpOnly)    │
   │ - Redireciona para /criar           │
   │                                     │
   │ Se inválido:                        │
   │ - Redireciona para hub.com/error    │
   └─────────────────────────────────────┘
```

---

## Segurança

### 1. Token JWT de Curta Duração
- Expira em **5 minutos**
- Só pode ser usado uma vez (nonce)
- Assinado com secret compartilhado entre Hub e produtos

### 2. Nonce Anti-Replay
```typescript
// Hub salva nonce antes de redirecionar
await db.insert('used_nonces', { nonce, created_at: now });

// Festa Mágica verifica se nonce já foi usado
const used = await db.query('used_nonces', { nonce });
if (used) throw new Error('Token já utilizado');
```

### 3. Verificação de Subscription
```typescript
// Sempre verifica se subscription está ativa
const subscription = await db.query('subscriptions', {
  user_id,
  product_id: 'festa-magica',
  status: 'active',
  expires_at: { $gt: now }
});

if (!subscription) {
  redirect('hub.com/renew?product=festa-magica');
}
```

### 4. Cookies HttpOnly
- Session token em cookie `httpOnly`, `secure`, `sameSite: strict`
- Não acessível via JavaScript (proteção XSS)

---

## Código de Ativação

Para usuários que não vêm do redirect automático:

```
Formato: FM-XXXX-YYYY-ZZZZ
         │  │    │    │
         │  │    │    └── Checksum (4 chars)
         │  │    └─────── Random (4 chars)
         │  └──────────── Timestamp encoded (4 chars)
         └─────────────── Product prefix
```

### Fluxo de Ativação Manual
1. Usuário acessa festamagica.com
2. Não está logado → mostra tela de ativação
3. Insere código de ativação
4. Sistema valida código no banco do Hub
5. Cria sessão local

---

## Estrutura do Banco (Supabase)

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id TEXT NOT NULL DEFAULT 'festa-magica',
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  activation_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_code ON subscriptions(activation_code);
```

### Tabela: sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_token ON sessions(token);
```

### Tabela: used_nonces (anti-replay)
```sql
CREATE TABLE used_nonces (
  nonce TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar nonces antigos (cron job)
DELETE FROM used_nonces WHERE created_at < now() - interval '1 hour';
```

---

## Variáveis de Ambiente

```env
# Hub Integration
HUB_URL=https://hub.com
HUB_JWT_SECRET=your-shared-secret-min-32-chars

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://festamagica.com
```

---

## Endpoints Necessários

### Festa Mágica
- `GET /auth/callback?token=JWT` - Recebe redirect do Hub
- `POST /auth/activate` - Ativa com código manual
- `GET /auth/verify` - Verifica sessão atual
- `POST /auth/logout` - Encerra sessão

### Hub (para referência)
- `POST /api/products/festa-magica/redirect` - Gera token e redireciona
- `GET /api/subscriptions/verify` - Verifica subscription (chamado pelo produto)

---

## Fluxo de Usuário Não Autenticado

```
Usuário acessa festamagica.com
         │
         ▼
    Tem sessão válida?
         │
    ┌────┴────┐
    │         │
   Sim       Não
    │         │
    ▼         ▼
  /criar    Mostrar tela:
            "Você precisa de acesso"
            [Ir para Hub] [Tenho código]
                 │              │
                 ▼              ▼
            hub.com      /auth/activate
```
