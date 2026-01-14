# 🎨 Guia Visual: Entrada Rápida de Transações

## 📱 Fluxo de Usuário (User Flow)

```
┌─────────────────────────────────────────────────────────────┐
│ ANTES (Modal Tradicional)                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard → Botão "+" → Modal                              │
│                                                              │
│  ┌──────────────────────────────────┐                       │
│  │ Nova Transação              [X] │                       │
│  ├──────────────────────────────────┤                       │
│  │ Descrição: [________________]   │ ← Campo 1            │
│  │ Valor:     [________________]   │ ← Campo 2            │
│  │ Data:      [________________]   │ ← Campo 3            │
│  │ Tipo:      [Dropdown ▼]         │ ← Campo 4            │
│  │ Conta:     [Dropdown ▼]         │ ← Campo 5            │
│  │ Categoria: [Dropdown ▼]         │ ← Campo 6            │
│  │ Notas:     [________________]   │ ← Campo 7            │
│  │                                  │                       │
│  │ [Cancelar]    [Salvar]          │                       │
│  └──────────────────────────────────┘                       │
│                                                              │
│  ⏱️  Tempo: 20-30 segundos                                   │
│  🖱️  Cliques: 8+ cliques                                    │
│  😰 Frustração: Alta (muitos campos)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DEPOIS (Quick Add)                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard → FAB (sempre visível)                           │
│                                                              │
│  ┌──────────────────────────────────┐                       │
│  │ ⚡ Adicionar Rápido         [X] │                       │
│  ├──────────────────────────────────┤                       │
│  │ [Despesa] [Receita]              │                       │
│  │                                  │                       │
│  │ Templates:                       │                       │
│  │ ┌────┐ ┌────┐ ┌────┐            │                       │
│  │ │ 🍕 │ │ 🚕 │ │ ☕ │            │ ← 1 clique            │
│  │ └────┘ └────┘ └────┘            │                       │
│  │                                  │                       │
│  │ Valor: [__50.00__] ← Pré-preenchido                     │
│  │                                  │                       │
│  │ Categoria: [Alimentação ▼]      │ ← Sugerida            │
│  │                                  │                       │
│  │ [Cancelar] [✅ Adicionar]        │                       │
│  └──────────────────────────────────┘                       │
│                                                              │
│  ⏱️  Tempo: 3-5 segundos (⬇️ 83%)                            │
│  🖱️  Cliques: 3 cliques (⬇️ 62%)                            │
│  😊 Satisfação: Alta (rápido e simples)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Anatomia do FAB (Floating Action Button)

```
                    Dashboard
┌──────────────────────────────────────────────────┐
│                                                  │
│  Saldo Total: R$ 5.430,00                       │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  Receitas   │  │  Despesas   │               │
│  │  R$ 3.000   │  │  R$ 1.500   │               │
│  └─────────────┘  └─────────────┘               │
│                                                  │
│  Transações Recentes:                           │
│  • Almoço - R$ 35,00                            │
│  • Uber - R$ 25,00                              │
│  • Café - R$ 8,00                               │
│                                                  │
│                                      ╔════════╗  │
│                                      ║        ║  │
│                                      ║   +    ║  │ ← FAB
│                                      ║        ║  │   64x64px
│                                      ╚════════╝  │   Roxo (#6366F1)
│                                         ↑        │   z-index: 50
└─────────────────────────────────────────────────┘
                                         │
                               Sempre visível em:
                               • Dashboard
                               • Transactions
                               • Accounts
                               • Categories
```

---

## 📋 Modal Breakdown (Estrutura Visual)

### Estado Inicial (Despesa Selecionada)

```
┌────────────────────────────────────────────────┐
│ ⚡ Adicionar Rápido                       [X] │ ← Título com emoji
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │    Despesa       │  │    Receita       │   │ ← Seletor de tipo
│  │  TrendingDown    │  │  TrendingUp      │   │
│  └──────────────────┘  └──────────────────┘   │
│     ↑ Selecionado (vermelho)                   │
│                                                │
│  ⚡ Templates Rápidos                          │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │  🍕  │  │  🚕  │  │  ☕  │                 │
│  │Dlvry │  │ Uber │  │ Café │                 │ ← Grid 3x2
│  │R$ 50 │  │R$ 25 │  │ R$ 8 │                 │
│  └──────┘  └──────┘  └──────┘                 │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │  🛒  │  │      │  │      │                 │
│  │Mercdo│  │      │  │      │                 │
│  │R$ 150│  │      │  │      │                 │
│  └──────┘  └──────┘  └──────┘                 │
│                                                │
│  💵 Valor                                      │
│  ┌──────────────────────────────────────────┐  │
│  │            50.00                        │  │ ← Input numérico
│  └──────────────────────────────────────────┘  │   (grande, centralizado)
│                                                │
│  📁 Categoria                                  │
│  (Sugerida: ⭐ 🍕 Alimentação)                 │ ← Hint de sugestão
│  ┌──────────────────────────────────────────┐  │
│  │ ⭐ 🍕 Alimentação (Sugerida)        ▼  │  │ ← Dropdown
│  │ 🚕 Transporte                            │  │   Sugestão no topo
│  │ ☕ Lazer                                  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ▶ + Adicionar descrição (opcional)           │ ← Details (colapsado)
│                                                │
│  ┌────────────┐           ┌────────────────┐  │
│  │ Cancelar   │           │ ✅ Adicionar   │  │ ← Footer
│  └────────────┘           └────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

### Após Clicar em Template

```
┌────────────────────────────────────────────────┐
│ ⚡ Adicionar Rápido                       [X] │
├────────────────────────────────────────────────┤
│                                                │
│  [Despesa] [Receita]                           │
│                                                │
│  ⚡ Templates Rápidos                          │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │  🍕  │  │  🚕  │  │  ☕  │                 │
│  │Dlvry │  │ Uber │  │ Café │                 │
│  │R$ 50 │  │R$ 25 │  │ R$ 8 │                 │
│  └──────┘  └──────┘  └──────┘                 │
│     ↑ Clicou aqui                              │
│                                                │
│  💵 Valor                                      │
│  ┌──────────────────────────────────────────┐  │
│  │            50.00        ← PREENCHIDO    │  │ ← Valor automatico
│  └──────────────────────────────────────────┘  │
│                                                │
│  📁 Categoria                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 🍕 Alimentação  ← PREENCHIDA         ▼ │  │ ← Categoria automática
│  └──────────────────────────────────────────┘  │
│                                                │
│  ▶ + Adicionar descrição (opcional)           │
│                                                │
│  [Cancelar]           [✅ Adicionar]           │
│                          ↑                     │
│                     Só clicar aqui!            │
│                                                │
└────────────────────────────────────────────────┘

                    ⏱️ Total: 3 cliques, 3 segundos!
```

---

## 🧠 Sistema de Auto-Sugestão (Diagrama de Fluxo)

```
┌──────────────────────────────────────────────────────────┐
│ 1. Usuário abre Quick Add Modal                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Buscar últimas 10 transações do tipo selecionado      │
│    (EXPENSE ou INCOME)                                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Contar frequência de cada categoria                   │
│                                                          │
│    Exemplo:                                              │
│    ┌──────────────────┬────────┐                         │
│    │ Categoria        │ Count  │                         │
│    ├──────────────────┼────────┤                         │
│    │ Alimentação      │   5    │ ← Mais frequente        │
│    │ Transporte       │   3    │                         │
│    │ Lazer            │   2    │                         │
│    └──────────────────┴────────┘                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Retornar categoria com maior count                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Exibir no dropdown:                                   │
│    "⭐ 🍕 Alimentação (Sugerida)"                        │
│                                                          │
│    Posição: Topo da lista                               │
│    Estilo: Fundo indigo-50, negrito                     │
└──────────────────────────────────────────────────────────┘

       Se não houver histórico → Não mostra sugestão
```

---

## 🎯 Template Matching (Como Funciona)

```
Usuário clica em:
    🍕 Delivery (R$ 50)
         │
         ▼
┌────────────────────────────────────┐
│ Template Object:                   │
│ {                                  │
│   icon: '🍕',                      │
│   label: 'Delivery',               │
│   amount: 50,                      │
│   categoryName: 'Alimentação', ←───┐
│   type: EXPENSE                    │
│ }                                  │
└─────────────────┬──────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│ Buscar categoria:                  │
│                                    │
│ categories.find(cat =>             │
│   cat.name                         │
│     .toLowerCase()                 │
│     .includes('alimentação')       │
│   && cat.type === 'EXPENSE'        │
│ )                                  │
└─────────────────┬──────────────────┘
                  │
                  ├─── ENCONTRADO ──────────┐
                  │                         │
                  │                         ▼
                  │              ┌─────────────────────┐
                  │              │ Preencher campos:   │
                  │              │ - amount = 50       │
                  │              │ - categoryId = '123'│
                  │              └─────────────────────┘
                  │
                  └─── NÃO ENCONTRADO ──────┐
                                            │
                                            ▼
                               ┌────────────────────────┐
                               │ Apenas preencher:      │
                               │ - amount = 50          │
                               │ (categoria fica vazia) │
                               └────────────────────────┘
```

---

## 📱 Responsividade (Mobile vs Desktop)

### Desktop (> 768px)

```
┌─────────────────────────────────────────────────┐
│                    Navbar                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │   Card 1    │  │   Card 2    │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  ┌───────────────────────────────┐              │
│  │      Chart / Table            │              │
│  └───────────────────────────────┘              │
│                                                 │
│                                    ┌─────────┐  │
│                                    │   FAB   │  │ ← 64x64px
│                                    └─────────┘  │   Fixo no canto
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────┐
│      Navbar        │
├─────────────────────┤
│                    │
│  ┌──────────────┐  │
│  │   Card 1     │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │   Card 2     │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │    Chart     │  │
│  └──────────────┘  │
│                    │
│             ┌────┐ │
│             │FAB │ │ ← 56x56px (menor)
│             └────┘ │   Mais espaço do canto
│                    │
└─────────────────────┘

Modal ocupa 95% da largura
Templates em grid 3x2
```

---

## 🎬 Animação de Sucesso (Toast)

```
Estado 1: Modal aberto, usuário clica "Adicionar"
┌────────────────────────────┐
│ ⚡ Adicionar Rápido    [X]│
│                           │
│  [Cancelar] [✅ Adicionar]│
│                    ↑      │
│                  Clicou!  │
└────────────────────────────┘

       ⏱️ 200ms depois...

Estado 2: Modal fecha, Toast entra (slide from top)
┌────────────────────────────┐
│ 💸 Transação adicionada!   │ ← Desliza de cima
│ -R$ 50.00                  │   Fundo verde
└────────────────────────────┘   Sombra suave
              ↓
     ⏱️ Fica 3 segundos

Estado 3: Toast some (fade out)
                        (desaparece)

     ⏱️ Total do feedback: 3.2s
```

---

## 🔄 Fluxo Completo (End-to-End)

```
┌───────────────────────────────────────────────────────────┐
│                      INÍCIO                               │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Usuário no    │
              │ Dashboard     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Vê o FAB      │ ← Sempre visível
              │ (botão roxo)  │
              └───────┬───────┘
                      │
                      │ [Clique 1]
                      ▼
              ┌───────────────┐
              │ Modal abre    │ ← < 200ms
              │ Quick Add     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Usuário vê    │
              │ templates     │
              └───────┬───────┘
                      │
                      │ [Clique 2]
                      ▼
              ┌───────────────┐
              │ Clica em      │
              │ 🍕 Delivery   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────────┐
              │ Campos            │
              │ preenchidos:      │
              │ - Valor: R$ 50    │
              │ - Cat: Aliment.   │
              └───────┬───────────┘
                      │
                      │ [Clique 3]
                      ▼
              ┌───────────────┐
              │ Clica em      │
              │ "✅ Adicionar"│
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ API Request   │ ← POST /transactions
              │ enviado       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Sucesso!      │ ← 200 OK
              └───────┬───────┘
                      │
                      ├────────────────┬────────────────┐
                      ▼                ▼                ▼
              ┌───────────┐   ┌───────────┐   ┌───────────┐
              │ Toast     │   │ Modal     │   │ Dashboard │
              │ aparece   │   │ fecha     │   │ atualiza  │
              └───────────┘   └───────────┘   └───────────┘
                      │
                      ▼
              ┌───────────────┐
              │     FIM       │
              │  (3-5 seg)    │
              └───────────────┘
```

---

## 🎨 Paleta de Cores (TDAH-Friendly)

```
FAB (Botão Principal):
██████ #6366F1 (Indigo 600) - Foco/Ação
██████ #4F46E5 (Indigo 700) - Hover

Tipo: Despesa
██████ #FEE2E2 (Red 100)    - Background
██████ #EF4444 (Red 500)    - Border/Text

Tipo: Receita
██████ #D1FAE5 (Green 100)  - Background
██████ #10B981 (Green 500)  - Border/Text

Templates:
██████ #FFFFFF (White)      - Background
██████ #E5E7EB (Gray 200)   - Border
██████ #EEF2FF (Indigo 50)  - Hover

Toast de Sucesso:
██████ #10B981 (Green 500)  - Background
██████ #FFFFFF (White)      - Text

Sugestão:
██████ #EEF2FF (Indigo 50)  - Background
██████ #6366F1 (Indigo 600) - Text/Border
```

---

## 📏 Dimensões (Specs Design)

```
FAB:
┌────────────┐
│            │  Width: 64px (desktop), 56px (mobile)
│     +      │  Height: 64px (desktop), 56px (mobile)
│            │  Border-radius: 100% (círculo)
└────────────┘  Shadow: 0 10px 25px rgba(0,0,0,0.3)
                Position: fixed, bottom: 24px, right: 24px
                z-index: 50

Modal:
┌──────────────────────────────┐
│                              │  Width: 90% max 600px
│                              │  Height: auto
│          Content             │  Padding: 24px
│                              │  Border-radius: 12px
└──────────────────────────────┘  Shadow: 0 20px 50px rgba(0,0,0,0.3)

Template Button:
┌──────────┐
│    🍕    │  Width: 100% (grid 1fr)
│  Dlvry   │  Height: 80px
│  R$ 50   │  Padding: 12px
└──────────┘  Border: 2px solid
              Border-radius: 8px
              Gap: 8px (entre botões)

Input (Valor):
┌──────────────────────────┐
│        50.00             │  Height: 64px
└──────────────────────────┘  Font-size: 32px (2xl)
                              Text-align: center
                              Font-weight: bold
```

---

## 🔢 Hierarquia de Informação

```
                  MODAL QUICK ADD
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   PRIMÁRIO        SECUNDÁRIO       TERCIÁRIO
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌─────────────┐ ┌────────────┐
│ • Valor       │ │ • Tipo      │ │ • Descriç. │
│ • Categoria   │ │ • Templates │ │   (opc.)   │
│ • Botão Add   │ └─────────────┘ └────────────┘
└───────────────┘
  ↑ Maior tamanho
  ↑ Mais destaque
  ↑ Obrigatórios
```

**Princípio**: O que é essencial fica grande e destacado.
O que é opcional fica escondido (collapse).

---

## ✨ Micro-Interações

```
1. Hover no FAB:
   [Normal] → [Scale 1.1] → [Shadow maior]
   
2. Click no FAB:
   [Scale 1.1] → [Scale 0.95] → [Volta] → [Modal abre]
   
3. Click em Template:
   [Border gray] → [Border indigo] → [Background indigo-50]
   + Preenche campos (fade in)
   
4. Seleção de Tipo:
   [Cinza] → [Click] → [Colorido + Border grosso]
   + Troca templates (fade)
   
5. Submit bem-sucedido:
   [Botão normal] → [Loading...] → [Modal fecha] → [Toast entra]
```

---

**Versão**: 1.0.0  
**Data**: 14 de janeiro de 2026  
**Status**: ✅ Completo e documentado
