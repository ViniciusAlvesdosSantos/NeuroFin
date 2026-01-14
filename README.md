# 💰 NeuroFin App

API RESTful robusta para gestão financeira pessoal, construída com NestJS, Prisma ORM e PostgreSQL. Sistema completo de controle de transações financeiras com categorização inteligente e autenticação JWT.

## ✨ Funcionalidades

### 🔐 Autenticação & Autorização
- Registro e login de usuários com JWT
- Proteção de rotas com Guards
- Hash de senhas com bcrypt
- Tokens com expiração de 7 dias

### 📊 Gestão de Categorias
- 16 categorias padrão pré-configuradas (Salário, Alimentação, Transporte, etc.)
- Criação de categorias customizadas
- Ícones Material Icons
- Tipos: INCOME (Receita), EXPENSE (Despesa), INVESTMENT (Investimento)
- Filtros e paginação

### 💸 Controle de Transações
- CRUD completo de transações
- Validação automática: tipo da transação deve corresponder ao tipo da categoria
- Filtragem por categoria
- Ordenação por data (mais recente primeiro)
- Relacionamento com categorias (include automático)

## 🛠️ Tecnologias

- **Framework:** NestJS 10.x
- **Database:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT (jsonwebtoken)
- **Validação:** class-validator + class-transformer
- **Documentação:** Swagger/OpenAPI
- **Segurança:** bcrypt, Guards, JWT Strategy

## 📁 Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/                    # Autenticação JWT
│   │   ├── guards/             # JWT Auth Guard
│   │   ├── dto/                # DTOs de login/registro
│   │   └── auth.service.ts
│   ├── categories-services/     # Gestão de categorias
│   │   ├── dto/
│   │   └── categories.service.ts
│   └── transactions/            # Gestão de transações
│       ├── dto/
│       └── transactions.service.ts
├── database/
│   ├── prisma.service.ts       # Cliente Prisma
│   └── prisma.module.ts
├── common/
│   ├── enums/                  # CategoryIcon, TransactionType
│   └── interfaces/
└── prisma/
    └── schema/                 # Schemas modulares
        ├── users.prisma
        ├── categories.prisma
        └── transactions.prisma
```

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/modular-finance-api.git
cd modular-finance-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais PostgreSQL

# Execute as migrations
npx prisma migrate dev

# Inicie o servidor
npm run start:dev
```

## ⚙️ Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
JWT_SECRET="seu_segredo_super_secreto"
PORT=3000
```

## 📚 Documentação da API

Acesse a documentação interativa do Swagger em:
```
http://localhost:3000/api
```

### Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login e obter token JWT

#### Categorias
- `GET /categories` - Listar categorias (com filtros)
- `POST /categories` - Criar categoria customizada
- `GET /categories/:id` - Buscar categoria por ID
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

#### Transações
- `GET /transactions` - Listar todas as transações
- `POST /transactions` - Criar nova transação
- `GET /transactions/:id` - Buscar transação por ID
- `GET /transactions/category/:categoryId` - Listar por categoria
- `PATCH /transactions/:id` - Atualizar transação
- `DELETE /transactions/:id` - Deletar transação

## 🔒 Regras de Negócio

1. **Validação de Tipo:** Uma transação do tipo `INCOME` não pode ser criada em uma categoria do tipo `EXPENSE`
2. **Isolamento de Dados:** Usuários só acessam seus próprios dados
3. **Categorias Padrão:** Criadas automaticamente no registro
4. **Foreign Keys:** Validação automática de relacionamentos

## 📝 Exemplo de Uso

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'

# 3. Criar transação (use o token do login)
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Salário de Dezembro",
    "amount": 5000.00,
    "date": "2024-12-29T10:00:00.000Z",
    "type": "INCOME",
    "categoryId": "uuid-da-categoria-salario"
  }'
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Scripts Disponíveis

```bash
npm run start          # Inicia em modo produção
npm run start:dev      # Inicia em modo desenvolvimento
npm run build          # Build da aplicação
npm run prisma:studio  # Interface visual do banco
npm run prisma:migrate # Cria nova migration
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@ViniciusAlvesdosSantos](https://github.com/ViniciusAlvesdosSantos)
- LinkedIn: [Vinicius dos Santos](https://www.linkedin.com/in/vinicius-dos-santos-064844203/)

---

⭐ Se este projeto foi útil, considere dar uma estrela!
