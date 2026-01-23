# Armazenamento de Imagens - Festa Mágica

## Estratégia Atual

Para o MVP, implementamos uma **estratégia híbrida** que minimiza custos:

### 1. Geração (Temporária)
- Imagens são geradas como **Base64** e mantidas apenas na memória do cliente
- Usuário pode baixar imediatamente após geração
- **Custo: R$ 0**

### 2. Persistência (Opcional - Firebase Storage)
- Se o usuário quiser salvar o kit para acesso futuro, as imagens são enviadas ao Firebase Storage
- Implementado mas **desativado por padrão** para economizar
- **Custo: ~R$ 0,026/GB/mês**

---

## Estimativa de Custos

### Tamanho médio por kit:
- 10 imagens × ~500KB = **~5MB por kit**

### Firebase Storage (Tier Gratuito):
- **5GB de armazenamento** grátis
- **1GB/dia de download** grátis
- Isso permite ~1.000 kits armazenados gratuitamente

### Após tier gratuito:
- Armazenamento: $0.026/GB/mês
- Download: $0.12/GB
- 1.000 kits extras = ~5GB = **~R$ 0,65/mês**

---

## Alternativas Consideradas

### Opção A: Apenas Download (Implementado)
```
Usuário gera → Baixa imagens → Não armazenamos
```
- **Prós**: Custo zero, privacidade máxima
- **Contras**: Usuário perde acesso se não baixar

### Opção B: Firebase Storage (Disponível)
```
Usuário gera → Salva no Storage → Acessa depois
```
- **Prós**: Acesso permanente, histórico
- **Contras**: Custo de armazenamento

### Opção C: Cloudinary (Futuro)
- Tier gratuito: 25GB
- Otimização automática de imagens
- CDN global

---

## Implementação

### Para ativar persistência:

1. No arquivo `src/hooks/use-kit-generation.ts`, descomente a seção de upload:

```typescript
// Após gerar todas as imagens com sucesso:
const imagesToUpload = kitItems
  .filter(item => item.status === 'completed' && item.imageUrl)
  .map(item => ({
    itemId: item.id,
    base64Data: item.imageUrl
  }));

const uploadedUrls = await uploadKitImages(user.uid, kitId, imagesToUpload);
```

2. Configure as regras do Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /kits/{userId}/{kitId}/{itemId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Recomendação

Para o MVP:
1. **Manter apenas download** (custo zero)
2. Adicionar botão "Baixar Todos" como ZIP
3. Implementar persistência quando tiver usuários pagantes

Para escala:
1. Migrar para Cloudinary (tier gratuito maior)
2. Implementar limpeza automática de kits antigos (>30 dias)
3. Oferecer "plano premium" com armazenamento ilimitado
