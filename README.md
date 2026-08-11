# Psi Geovana — Landing & questionários

Site institucional da psicóloga **Geovana Almeida** (React + Vite) com questionários online (Roda da Vida), API em Hono e banco **Neon Postgres**.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/questionarios` | Lista de questionários |
| `/questionarios/:slug` | Responder (CPF + senha do questionário) |
| `/painel` | Painel da psicóloga (senha admin) |
| `/painel/:submissionId` | Detalhe de uma resposta |

Os questionários **não** têm link na landing — o acesso é pela URL direta.

## Pré-requisitos

- Node.js 20+
- Conta [Neon](https://neon.tech) com connection string Postgres

## Configuração

```bash
cp .env.example .env
```

Preencha o `.env`:

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Connection string do Neon |
| `UNLOCK_SECRET` | Segredo longo para tokens de desbloqueio |
| `Q_RODA_PASSWORD` | Senha inicial da Roda da Vida (seed) |
| `ADMIN_PASSWORD` | Senha do painel `/painel` |
| `API_PORT` | Porta da API (padrão `8787`) |
| `API_HOST` | `0.0.0.0` para rede local / celular |
| `CORS_ORIGIN` | Origens do front (IPs `192.168.*` já são aceitos) |

Instale e faça o seed (cria tabelas + Roda da Vida):

```bash
npm install
npm run db:seed
```

## Desenvolvimento

Sobe **API + front** juntos (necessário para questionários funcionarem):

```bash
npm run dev
```

- Front: `http://localhost:5173`
- API: `http://localhost:8787` (o Vite faz proxy de `/api`)

Scripts separados:

```bash
npm run dev:web   # só Vite
npm run dev:api   # só API
```

### Celular na mesma Wi‑Fi

`localhost` no celular aponta para o próprio aparelho. Use o IP do PC:

1. Rode `npm run dev`
2. No terminal do Vite, abra a URL **Network** (ex.: `http://192.168.100.5:5173`)
3. PC e celular na mesma rede; firewall do Windows pode pedir permissão nas portas `5173` / `8787`

## Produção

```bash
npm run build
npm run preview   # só o front estático
```

- **Front:** Vercel (build estático do Vite)
- **API:** Render (serviço Node com `npm start`)

Como estão em hosts diferentes, o front precisa da URL do Render:

1. No **Vercel** → Project → Settings → Environment Variables  
   `VITE_API_URL` = `https://seu-servico.onrender.com` (sem barra no final)
2. No **Render** → Environment  
   `CORS_ORIGIN` = URL do Vercel (ex.: `https://seu-app.vercel.app`)
3. **Redeploy** o front no Vercel (variável `VITE_*` entra no build)

No local, deixe `VITE_API_URL` vazio — continua usando `/api` + proxy do Vite.

### API no Render

1. Web Service (Node), branch `main`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Em **Environment**, as variáveis do `.env` (`DATABASE_URL`, `UNLOCK_SECRET`, `ADMIN_PASSWORD`, `CORS_ORIGIN` com a URL do Vercel, `API_HOST=0.0.0.0`, etc.)

O Render define `PORT` automaticamente (o server já usa `PORT`).

## Estrutura

```
src/                 # React (landing, questionários, painel)
server/              # API Hono + Neon
  index.ts           # rotas /api/*
  seed.ts            # tabelas + Roda da Vida
  unlock.ts          # tokens de CPF + senha
  admin.ts           # autenticação do painel
```

## Fluxo do questionário

1. Pessoa abre `/questionarios/roda-da-vida`
2. Informa CPF e a senha do questionário
3. Preenche a Roda da Vida (notas 1–10) e confirma
4. Resposta fica no Neon; a psicóloga vê em `/painel`

## Stack

- React 19, Vite 8, TypeScript, React Router
- Hono + `@neondatabase/serverless`
- Framer Motion (landing)
