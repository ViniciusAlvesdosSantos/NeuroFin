# 🧪 Guia de Teste: Entrada Rápida de Transações

## 🚀 Como Iniciar o App

```bash
cd /home/vini/Desktop/estudos/NeuroFin/NeuroFin-frontend
pnpm install  # Se ainda não instalou
pnpm run dev  # Inicia o frontend
```

Em outro terminal:
```bash
cd /home/vini/Desktop/estudos/NeuroFin/api-rest
npm run start:dev  # Inicia o backend
```

---

## ✅ Checklist de Testes

### 1. Verificar se o FAB aparece
- [ ] Acessar `/dashboard`
- [ ] Verificar botão redondo roxo no canto inferior direito
- [ ] Deve ter ícone de "+"
- [ ] Hover: deve fazer scale (ficar maior)

### 2. Abrir o Quick Add Modal
- [ ] Clicar no FAB
- [ ] Modal deve abrir com título "⚡ Adicionar Rápido"
- [ ] Deve ter 2 botões: "Despesa" e "Receita"
- [ ] "Despesa" deve estar selecionada por padrão (vermelho)

### 3. Testar Templates
- [ ] Ver 6 templates: Delivery, Uber, Café, Mercado, Salário, Freelance
- [ ] Clicar em "🍕 Delivery"
- [ ] Valor deve preencher: R$ 50
- [ ] Categoria deve mudar (se existir "Alimentação")

### 4. Adicionar Transação Manual
- [ ] Digitar valor: 35
- [ ] Selecionar categoria do dropdown
- [ ] Clicar em "✅ Adicionar"
- [ ] Toast deve aparecer: "💸 Transação adicionada! -R$ 35.00"

### 5. Testar Auto-Sugestão
**Setup**:
1. Adicione 3 transações da mesma categoria (ex: "Transporte")

**Teste**:
- [ ] Abrir Quick Add novamente
- [ ] No dropdown de categoria, verificar: "⭐ 🚕 Transporte (Sugerida)"
- [ ] A sugestão deve estar no topo da lista

### 6. Testar Troca de Tipo
- [ ] Clicar em "Receita" (botão verde)
- [ ] Templates devem mudar: Salário e Freelance aparecem
- [ ] Categorias no dropdown devem mudar (apenas receitas)

### 7. Descrição Opcional
- [ ] Expandir "+ Adicionar descrição (opcional)"
- [ ] Campo de texto deve aparecer
- [ ] Adicionar transação sem preencher descrição
- [ ] ✅ Deve funcionar (descrição não é obrigatória)

### 8. Validação de Erros
- [ ] Tentar adicionar sem preencher valor
- [ ] Erro: "Valor deve ser maior que zero"
- [ ] Tentar adicionar sem selecionar categoria
- [ ] Erro: "Selecione uma categoria"

### 9. Integração - Verificar FAB em todas páginas
- [ ] `/dashboard` - FAB presente
- [ ] `/transactions` - FAB presente
- [ ] `/accounts` - FAB presente
- [ ] `/categories` - FAB presente
- [ ] `/login` - FAB NÃO deve aparecer

### 10. Responsividade Mobile
**Simular mobile** (F12 > Toggle Device Toolbar):
- [ ] FAB deve continuar visível
- [ ] Modal deve ocupar 90% da largura
- [ ] Templates devem estar em grid 3x2
- [ ] Botões devem ser tocáveis (mínimo 44x44px)

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module '@/components/QuickAddButton'"
**Solução**: 
```bash
# Reiniciar o dev server
# Ctrl+C para parar
pnpm run dev
```

### FAB não aparece
**Causas possíveis**:
1. Página não tem o import do QuickAddButton
2. z-index sendo sobrescrito por outro elemento
3. CSS não carregado

**Debug**:
```bash
# Abrir DevTools (F12)
# Verificar se há erros no console
# Verificar na aba Elements se <QuickAddButton> está renderizado
```

### Auto-sugestão não funciona
**Causa**: Usuário novo sem histórico
**Esperado**: Comportamento normal - simplesmente não mostra sugestão

### Templates não correspondem categorias
**Solução temporária**: 
Editar `/client/src/components/QuickTransactionModal.tsx`:
```typescript
const QUICK_TEMPLATES: QuickTemplate[] = [
  // Editar os nomes das categorias aqui
  { icon: '🍕', label: 'Delivery', amount: 50, categoryName: 'SUA_CATEGORIA', type: TransactionType.EXPENSE },
  // ...
];
```

---

## 📸 Screenshots Esperados

### 1. FAB no Dashboard
```
┌─────────────────────────────┐
│ Dashboard                    │
│                             │
│ [KPI Cards]                 │
│                             │
│ [Charts]              ╔═══╗ │
│                       ║ + ║ │ <- FAB aqui
│                       ╚═══╝ │
└─────────────────────────────┘
```

### 2. Modal Aberto - Despesa
```
┌──────────────────────────────────┐
│ ⚡ Adicionar Rápido         [X] │
├──────────────────────────────────┤
│ [Despesa] [Receita]              │
│                                  │
│ Templates Rápidos:               │
│ [🍕]  [🚕]  [☕]                 │
│ [🛒]  ...   ...                  │
│                                  │
│ 💵 Valor                         │
│ [_________] <- R$ 0.00           │
│                                  │
│ 📁 Categoria                     │
│ [Dropdown ▼]                     │
│                                  │
│ [Cancelar]  [✅ Adicionar]       │
└──────────────────────────────────┘
```

### 3. Toast de Sucesso
```
┌─────────────────────────────┐
│ 💸 Transação adicionada!    │
│ -R$ 50.00                   │
└─────────────────────────────┘
```

---

## 🎯 Testes de Performance

### Tempo de Abertura do Modal
**Meta**: < 200ms
```javascript
// No console do navegador:
performance.mark('fab-click-start');
// [Clicar no FAB]
performance.mark('modal-open-end');
performance.measure('modal-open-time', 'fab-click-start', 'modal-open-end');
console.table(performance.getEntriesByType('measure'));
```

### Tempo Total de Adição
**Meta**: < 5 segundos
1. Start timer
2. Clicar no FAB
3. Clicar em template
4. Clicar em "Adicionar"
5. Stop timer quando toast aparecer

**Resultado esperado**: 2-4 segundos

---

## 🔍 Inspeção de Código (Code Review)

### Verificar Imports
```bash
cd /home/vini/Desktop/estudos/NeuroFin/NeuroFin-frontend/client/src
grep -r "QuickAddButton" pages/
```

**Esperado**: 4 arquivos (Dashboard, Transactions, Accounts, Categories)

### Verificar Props do Modal
```typescript
// QuickTransactionModal deve aceitar:
interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Verificar Schema de Validação
```typescript
// Apenas 2 campos obrigatórios:
const quickTransactionSchema = z.object({
  amount: z.number().min(0.01),
  categoryId: z.string().min(1),
  // ... opcionais
});
```

---

## ✨ Testes de Acessibilidade

### Keyboard Navigation
- [ ] Tab: deve focar no FAB
- [ ] Enter: deve abrir modal
- [ ] Tab dentro do modal: deve navegar pelos campos
- [ ] Esc: deve fechar modal

### Screen Reader
- [ ] FAB deve ter aria-label="Adicionar transação rápida"
- [ ] Modal deve ter role="dialog"
- [ ] Campos devem ter labels associados

---

## 📊 Métricas de Sucesso (Após 1 Semana)

Adicione tracking de analytics:

```typescript
// Eventos a serem rastreados:
analytics.track('quick_add_opened');
analytics.track('template_used', { template: 'delivery' });
analytics.track('transaction_added', { method: 'quick_add', time_elapsed: 3.2 });
```

**KPIs**:
- Uso do Quick Add: > 70% das transações
- Tempo médio: < 5 segundos
- Taxa de conclusão: > 95%

---

## 🎓 Para Desenvolvedores

### Como Adicionar Novo Template
1. Editar `QUICK_TEMPLATES` em `QuickTransactionModal.tsx`
2. Adicionar objeto:
   ```typescript
   { 
     icon: '🎮', 
     label: 'Games', 
     amount: 100, 
     categoryName: 'Entretenimento', 
     type: TransactionType.EXPENSE 
   }
   ```

### Como Melhorar Auto-Sugestão
Editar função `suggestedCategory`:
```typescript
// Adicionar peso por recência:
const weightedScore = (count * 1) + (recency * 0.5);
```

### Como Customizar Emojis
Trocar emojis nos labels:
- Valor: 💵 → 💰
- Categoria: 📁 → 🏷️
- Toast: 💸 → ✨

---

**Versão**: 1.0  
**Última atualização**: 14/01/2026  
**Status**: ✅ Pronto para testes
