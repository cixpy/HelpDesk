# 🖥️ TI Helpdesk — Sistema de Chamados | devcix.com

Sistema de gerenciamento de chamados de suporte de TI construído com **Next.js 14**, **TypeScript**, **Tailwind CSS** e **Prisma**.

---

## 🚀 Deploy no Vercel (passo a passo)

### 1. Suba o projeto para o GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/it-tickets.git
git push -u origin main
```

### 2. Importe no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New → Project**
2. Importe o repositório do GitHub
3. O Vercel detecta automaticamente Next.js — não altere nada em Framework

### 3. Configure as variáveis de ambiente no Vercel

Em **Settings → Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `mysql://avnadmin:psswrd@host:port/defaultdb?ssl-mode=REQUIRED` |
| `JWT_SECRET` | resultado de `openssl rand -base64 32` |

### 4. Deploy

Clique em **Deploy**. O Vercel vai:
- Instalar dependências com `yarn install`
- Rodar `prisma generate` automaticamente (via `postinstall`)
- Fazer o build com `next build`

### 5. Criar as tabelas no banco (primeira vez)

Após o deploy, rode localmente com as variáveis configuradas:

```bash
yarn db:push    # cria as tabelas
yarn db:seed    # popula com dados de exemplo
```

---

## 💻 Rodar localmente

```bash
# 1. Instalar dependências
yarn install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 3. Criar tabelas e popular o banco
yarn db:push
yarn db:seed

# 4. Rodar em desenvolvimento
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 👤 Usuários de teste (após seed)

| Perfil       | E-mail                    | Senha    | Troca de senha |
|--------------|---------------------------|----------|---------------|
| Admin        | admin@devcix.com          | admin123 | Não           |
| Técnico      | tecnico@devcix.com        | tech123  | Sim (1º login)|
| Usuário      | usuario@devcix.com        | user123  | Sim (1º login)|

---

## 📋 Funcionalidades

### Usuários
- Abrir chamados com título, descrição, categoria e prioridade
- Acompanhar status e histórico dos chamados
- Comentar para fornecer mais informações

### Técnicos e Admins
- Ver e filtrar todos os chamados do sistema
- Atribuir chamados a técnicos
- Alterar status e prioridade com histórico
- Notas internas (não visíveis ao solicitante)

### Administradores
- Cadastrar usuários com senha temporária
- Todos os novos usuários são obrigados a trocar a senha no primeiro login
- Excluir usuários
- Visualizar status de troca de senha pendente

---

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # login, logout, change-password
│   │   ├── admin/users/   # CRUD de usuários (admin only)
│   │   ├── tickets/       # CRUD de chamados + comentários
│   │   └── dashboard/     # métricas
│   ├── admin/users/       # página de gerenciamento de usuários
│   ├── change-password/   # troca de senha obrigatória
│   ├── dashboard/         # página principal
│   └── tickets/           # lista, novo chamado, detalhe
├── components/
│   ├── Sidebar.tsx
│   ├── LoginForm.tsx
│   ├── Badge.tsx
│   ├── ChangePasswordForm.tsx
│   ├── TicketActions.tsx
│   ├── CommentSection.tsx
│   └── UsersClient.tsx
├── lib/
│   ├── prisma.ts          # singleton do Prisma
│   └── auth.ts            # JWT e bcrypt
└── types/
    └── index.ts
```

---

## 🗄️ Scripts

```bash
yarn dev           # desenvolvimento
yarn build         # build de produção
yarn db:push       # sincronizar schema com o banco
yarn db:seed       # popular com dados de exemplo
yarn db:studio     # interface visual do banco (localhost:5555)
```
