# Integração Woovi (Pix) - Para o Hub

> **Nota**: A integração Woovi será usada no **Hub**, não no Festa Mágica diretamente.
> Este documento serve como referência para implementação no Hub.

## Visão Geral

Woovi é uma plataforma de pagamentos Pix que oferece:
- API simples e bem documentada
- Webhooks para confirmação de pagamento
- QR Code e link de pagamento
- Sem mensalidade, apenas taxa por transação

## Fluxo de Pagamento

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO NO HUB                             │
└─────────────────────────────────────────────────────────────┘

1. Usuário seleciona "Festa Mágica" no Hub
2. Hub cria cobrança Pix via Woovi API
3. Usuário recebe QR Code / Link de pagamento
4. Usuário paga via app do banco
5. Woovi envia webhook para Hub
6. Hub ativa subscription do usuário
7. Hub gera código de ativação
8. Hub redireciona usuário para Festa Mágica com JWT
```

## Configuração

### 1. Criar conta Woovi
1. Acesse https://woovi.com
2. Crie uma conta empresarial
3. Complete a verificação

### 2. Obter credenciais
1. Acesse Dashboard → Configurações → API
2. Copie a **API Key**

### 3. Configurar webhook
1. Dashboard → Configurações → Webhooks
2. URL: `https://hub.com/api/webhooks/woovi`
3. Eventos: `OPENPIX:CHARGE_COMPLETED`

## Variáveis de Ambiente (Hub)

```env
WOOVI_API_KEY=sua-api-key-aqui
WOOVI_WEBHOOK_SECRET=seu-webhook-secret
```

## Exemplo de Uso (Hub)

### Criar cobrança

```typescript
import { createPixCharge } from '@/lib/woovi/client';

const charge = await createPixCharge({
  correlationID: `hub-${userId}-${Date.now()}`,
  value: 4990, // R$ 49,90 em centavos
  comment: 'Festa Mágica - Plano Trimestral',
  customer: {
    name: user.name,
    email: user.email,
  },
  expiresIn: 3600, // 1 hora
});

// Retornar para o frontend
return {
  qrCode: charge.charge.qrCodeImage,
  brCode: charge.charge.brCode,
  paymentLink: charge.charge.paymentLinkUrl,
  expiresAt: charge.charge.expiresAt,
};
```

### Webhook handler

```typescript
// POST /api/webhooks/woovi
export async function POST(request: Request) {
  const payload = await request.json();
  
  if (payload.event === 'OPENPIX:CHARGE_COMPLETED') {
    const { correlationID } = payload.charge;
    
    // Extrair userId do correlationID
    const [, userId] = correlationID.split('-');
    
    // Ativar subscription
    await activateSubscription(userId, 'festa-magica', 3);
    
    // Gerar código de ativação
    const code = generateActivationCode();
    
    // Enviar email com código
    await sendActivationEmail(userId, code);
  }
  
  return Response.json({ received: true });
}
```

## Comparação: Woovi vs Mercado Pago

| Aspecto | Woovi | Mercado Pago |
|---------|-------|--------------|
| **Foco** | Pix only | Multi-método |
| **Taxa Pix** | 0.99% | 0.99% |
| **Setup** | Simples | Complexo |
| **Documentação** | Excelente | Boa |
| **Webhook** | Confiável | Às vezes falha |
| **Checkout** | QR/Link | Checkout Pro |
| **Ideal para** | Pix-first | Multi-método |

## Por que Woovi?

1. **Simplicidade**: API focada em Pix, menos código
2. **Confiabilidade**: Webhooks funcionam bem
3. **Custo**: Mesma taxa que MP
4. **Velocidade**: Confirmação instantânea
5. **Suporte**: Atendimento rápido

## Estrutura de Dados

### Cobrança criada
```json
{
  "charge": {
    "correlationID": "hub-user123-1706000000000",
    "value": 4990,
    "status": "ACTIVE",
    "brCode": "00020126...",
    "qrCodeImage": "data:image/png;base64,...",
    "paymentLinkUrl": "https://openpix.com.br/pay/...",
    "expiresAt": "2024-01-23T15:00:00.000Z"
  }
}
```

### Webhook de pagamento
```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "correlationID": "hub-user123-1706000000000",
    "value": 4990,
    "status": "COMPLETED"
  },
  "pix": {
    "value": 4990,
    "time": "2024-01-23T14:30:00.000Z"
  }
}
```

## Próximos Passos

1. Implementar no Hub quando construir o portal
2. Testar em sandbox primeiro
3. Migrar para produção após validação
