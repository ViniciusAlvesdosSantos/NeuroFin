# 🗺️ Roadmap de Evolução UX/UI e Fluxos: NeuroFin 

Este documento detalha o plano de ação estratégico para transformar o NeuroFin em um **Planejador Financeiro de Vida (Hoje + Futuro)** de classe mundial, com foco na retenção do usuário neurodivergente e em uma experiência de altíssima qualidade (Premium UX/UI).

---

## 🟢 ÉPICO 1: O Dashboard Semântico (Foco no "Hoje")
**Objetivo:** Eliminar a ansiedade de olhar saldos globais e focar na métrica acionável: *"Quanto posso gastar hoje sem comprometer minhas contas e metas?"*

### 🛠️ Tasks de Backend (NestJS)
- [ ] **Criar endpoint de "Safe to Spend":** `GET /analytics/safe-to-spend`
  - *Regra de Negócio:* Calcular `(Saldo Atual + Receitas Previstas do Mês) - (Despesas Fixas Pendentes do Mês + Valores Alocados em Metas)`.
  - *Cálculo Diário:* Dividir o valor resultante pelos dias restantes do mês.
- [ ] **Otimização de Query:** Criar view ou cache no Prisma/Redis para não recalcular todas as contas recorrentes a cada refresh do Dashboard.

### 🎨 Tasks de Frontend (Vite/React)
- [ ] **Redesign do Hero do Dashboard:** Substituir o card tradicional de "Saldo Total" por um Card Principal focado no "Safe to Spend" (Valor Seguro Diário).
- [ ] **Componente `SafeToSpendGauge.tsx`:** Criar um gráfico semi-circular (ou barra de progresso) verde/amarela/vermelha mostrando o consumo do valor diário.
- [ ] **Widget de "Despesas Intocáveis":** Uma lista sutil embaixo mostrando o valor bloqueado para as contas que ainda vão vencer neste mês.
- [ ] **Refatorar Componente de Saldo:** Esconder o "Saldo Total" por padrão (ícone de olho fechado) para evitar que o usuário veja muito dinheiro e ache que pode gastá-lo.

---

## 🔵 ÉPICO 2: Potes de Sonhos (Foco no "Futuro")
**Objetivo:** Mudar o paradigma de "Investir" (frio) para "Construir Sonhos" (emocional e gamificado).

### 🛠️ Tasks de Backend (NestJS)
- [ ] **Criar modelo `DreamGoal` no Prisma:**
  - Campos: `id`, `userId`, `title` (ex: "Viagem Japão"), `targetAmount`, `currentAmount`, `deadline`, `icon`, `color`.
- [ ] **Endpoints CRUD para `DreamGoal`:** `POST`, `GET`, `PATCH`, `DELETE` em `/goals`.
- [ ] **Endpoint de Alocação:** `POST /goals/:id/allocate` (Transferir do Saldo Livre para o Pote).

### 🎨 Tasks de Frontend (Vite/React)
- [ ] **Criar nova Página `Dreams.tsx` (ou renomear Investments):** Foco em visualização de cartões grandes.
- [ ] **Componente `DreamPotCard.tsx`:**
  - UI: Usar visualização de "copo enchendo" (Fill Container).
  - Animação: Água/Cor subindo conforme a porcentagem avança.
- [ ] **Fluxo de Alocação de Dinheiro:**
  - Modal interativo com slider (ex: arrastar para definir quanto quer guardar este mês).
  - *Micro-interação:* Chuva de confetes (`canvas-confetti`) ao bater 25%, 50%, 75% e 100% da meta.
- [ ] **Cálculo de Projeção:** Exibir dinamicamente "No seu ritmo atual, você alcançará essa meta em X meses".

---

## 🟡 ÉPICO 3: Modo Perdão & Retenção (UX Psicológica)
**Objetivo:** Evitar o churn (abandono) quando o usuário passa semanas sem registrar gastos, removendo a culpa.

### 🛠️ Tasks de Backend (NestJS)
- [ ] **Tracker de Atividade:** Registrar `lastLoginAt` no modelo `User`.
- [ ] **Lógica de "Reset Fresco":** Endpoint `POST /users/fresh-start`.
  - *Regra:* Não apaga transações antigas, mas cria uma "Transação de Ajuste de Saldo" automática que iguala o saldo do sistema ao saldo real atual do banco informado pelo usuário.
  - Opcional: Arquivar metas passadas não cumpridas sem exibir mensagens de falha.

### 🎨 Tasks de Frontend (Vite/React)
- [ ] **Detector de Ausência:** Criar um Hook `useAbsenceDetector()` que verifica se o último login foi há > 14 dias.
- [ ] **Modal "Welcome Back" (`ForgivenessModal.tsx`):**
  - Se ausente > 14 dias, interceptar o Dashboard com um modal de tela cheia.
  - *Copy:* "Que bom te ver! A vida acontece. Quer atualizar seu saldo atual e recomeçar de hoje sem se preocupar com as últimas semanas?"
- [ ] **Flow de Ajuste Rápido:** Uma tela única pedindo o saldo real das contas bancárias naquele momento para criar a transação de ajuste automático.

---

## 🟣 ÉPICO 4: Simulador de Futuro (Cura da Cegueira Temporal)
**Objetivo:** Tangibilizar o impacto de longo prazo de decisões pequenas do dia a dia.

### 🛠️ Tasks de Backend (NestJS)
- [ ] **Nenhuma API nova estritamente necessária:** Os cálculos podem ser matemáticos e processados 100% no cliente.

### 🎨 Tasks de Frontend (Vite/React)
- [ ] **Nova página/aba `Simulator.tsx`:**
  - Layout limpo, apenas sliders e um gráfico de área gigante projetando 1 a 10 anos.
- [ ] **Componente de Sliders Interativos (`@radix-ui/react-slider`):**
  - Slider 1: "E se eu poupar R$ X a mais por mês?"
  - Slider 2: "E se eu cortar R$ Y de gastos supérfluos?"
- [ ] **Gráfico de Projeção Dinâmica:** Usar `recharts` para atualizar em tempo real a curva de acumulação de patrimônio à medida que o usuário mexe no slider.
- [ ] **Alertas de Impacto (Insights):** Toast ou card aparecendo: *"Uau! Apenas R$ 50/mês a menos em IFood = +R$ 8.000 em 10 anos!"*

---

## 🟠 ÉPICO 5: Onboarding Emocional e Setup Zero Fricção
**Objetivo:** Garantir que os primeiros 3 minutos do usuário no app gerem alto engajamento.

### 🎨 Tasks de Frontend (Vite/React)
- [ ] **Redesign do `Onboarding.tsx`:** Substituir formulários longos por uma "Entrevista" passo a passo (Wizard).
- [ ] **Passo 1 (Motivação):** "Qual seu maior foco agora?" (Cards grandes com ícones: Sair das dívidas, Poupar para metas, Controle diário).
- [ ] **Passo 2 (Custos Fixos Rápido):** Input simplificado para "Qual seu custo de vida essencial estimado?"
- [ ] **Geração de Dados Defaults:** Em vez de fazer o usuário criar as categorias uma a uma, o sistema popula (semeia) categorias e potes de sonhos baseados na resposta do Passo 1.
- [ ] **Transições Suaves:** Usar `<AnimatePresence>` do `framer-motion` para deslizar suavemente de uma pergunta para a outra.

---

## ✨ ÉPICO 6: Refinamento Premium (Polimento UI/UX 10-years level)
**Objetivo:** Fazer o app parecer um produto de R$ 100/mês através de detalhes microscópicos de design.

### 🎨 Tasks de Frontend (UX/UI Detalhes)
- [ ] **Skeleton Loaders (`Skeleton.tsx`):**
  - Implementar em TUDO que houver fetch. Substituir o clássico "Loading..." por retângulos pulsantes cinza (Tailwind `animate-pulse`) que mimetizam a tabela de transações e os cards do dashboard.
- [ ] **Tipografia Monoespaçada:**
  - Adicionar fonte monoespaçada (ex: `JetBrains Mono` ou `Geist Mono`) no arquivo CSS.
  - Aplicar exclusivamente a todos os componentes que exibem **Valores R$**, garantindo que as tabelas de gastos fiquem perfeitamente alinhadas verticalmente.
- [ ] **Remoção de Ruído Visual em Gráficos:**
  - Configurar os gráficos do `recharts` para remover bordas, grid lines densas e usar cantos arredondados (`radius={[4, 4, 0, 0]}`).
- [ ] **Micro-interações de Sucesso:**
  - Adicionar pequenos saltos (`bounce`) em ícones ao salvar algo com sucesso.
  - Refinar o `toast` de notificação para incluir barras de progresso que mostram quanto tempo falta para o toast sumir.

---

## 📅 Sugestão de Execução (Sprints)

- **Sprint 1 (Fundação de UX):** Épico 1 (Dashboard "Safe to Spend") + Épico 6 (Tipografia Monoespaçada e Skeletons). Isso dá uma cara nova IMEDIATA ao app.
- **Sprint 2 (Engajamento e Retenção):** Épico 3 (Modo Perdão). Crucial para não perder os early adopters neurodivergentes.
- **Sprint 3 (O Futuro Visual):** Épico 2 (Potes de Sonhos).
- **Sprint 4 (Diferencial de Mercado):** Épico 4 (Simulador de Futuro) e Épico 5 (Onboarding Emocional).
