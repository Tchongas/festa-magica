# Guia de Configuração - Festa Mágica

## 1. Firebase Setup

### 1.1 Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome: `festa-magica` (ou outro de sua preferência)
4. Desative Google Analytics (opcional para MVP)
5. Clique em "Criar projeto"

### 1.2 Configurar Authentication
1. No menu lateral, vá em **Build > Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", habilite:
   - **Email/Senha** (obrigatório)
   - **Google** (opcional, recomendado para UX)
4. Em "Configurações", configure o domínio autorizado (adicione seu domínio de produção depois)

### 1.3 Configurar Firestore Database
1. No menu lateral, vá em **Build > Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha **Modo de produção** (configuraremos regras depois)
4. Selecione a região mais próxima (ex: `southamerica-east1` para Brasil)

### 1.4 Regras do Firestore
Vá em **Firestore > Regras** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Kits pertencem ao usuário
    match /kits/{kitId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Transações são read-only para o usuário
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 1.5 Obter Credenciais
1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Role até "Seus apps" e clique no ícone **Web** (</>)
3. Registre o app com nome "festa-magica-web"
4. Copie as credenciais para o `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=festa-magica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=festa-magica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=festa-magica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 2. Google Gemini API

### 2.1 Obter API Key
1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Clique em "Get API Key"
3. Crie uma nova chave ou use uma existente
4. Copie para o `.env.local`:

```env
GEMINI_API_KEY=AIzaSy...
```

### 2.2 Modelos Utilizados
- **gemini-2.0-flash**: Análise de imagens (descrição da criança/tema)
- **gemini-2.0-flash-exp-image-generation**: Geração de imagens do kit

> **Custo estimado**: ~$0.01-0.05 por kit completo (10 imagens)

---

## 3. Mercado Pago Setup

### 3.1 Criar Conta de Desenvolvedor
1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login com sua conta Mercado Pago
3. Vá em **Suas integrações > Criar aplicação**
4. Nome: "Festa Mágica"
5. Modelo de integração: **Checkout Pro**

### 3.2 Obter Credenciais
1. Na sua aplicação, vá em **Credenciais de produção**
2. Copie para o `.env.local`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

### 3.3 Configurar Webhook (Produção)
1. Em **Webhooks**, adicione a URL:
   ```
   https://seu-dominio.com/api/webhooks/mercadopago
   ```
2. Eventos: `payment`

### 3.4 Modo Sandbox (Desenvolvimento)
Para testes, use as **Credenciais de teste** em vez das de produção.
Cartões de teste disponíveis na [documentação](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards).

---

## 4. Armazenamento de Imagens

### Opção A: Base64 no Firestore (Grátis, mas limitado)
- **Prós**: Sem custo adicional, simples
- **Contras**: Limite de 1MB por documento, lento para carregar
- **Recomendado para**: MVP, poucos usuários

### Opção B: Firebase Storage (Recomendado)
- **Prós**: Rápido, CDN global, sem limite de tamanho
- **Contras**: Custo por GB armazenado (~$0.026/GB/mês)
- **Tier gratuito**: 5GB de armazenamento, 1GB/dia de download

### Opção C: Cloudinary (Alternativa)
- **Prós**: Tier gratuito generoso (25GB), otimização automática
- **Contras**: Mais uma dependência externa

**Implementação atual**: Usaremos **Base64 temporário** no cliente + opção de download. Para persistência, implementaremos Firebase Storage quando necessário.

---

## 5. Variáveis de Ambiente Completas

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Gemini
GEMINI_API_KEY=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Executar o Projeto

```bash
cd festa-magica
npm install
npm run dev
```

Acesse: http://localhost:3000
