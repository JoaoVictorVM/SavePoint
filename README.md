<div align="center">

# SavePoint

**Organize sua jornada gamer.**
Sua biblioteca, suas missões, seu progresso - tudo num só lugar.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f)](https://orm.drizzle.team/)
[![Tests](https://img.shields.io/badge/tests-105_passing-a3be8c)](#testes)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#licença)

</div>

> **Demo:** _https://save-points.vercel.app/_

---

## Sobre

**SavePoint** é uma aplicação web pessoal pra **gamers que querem organizar sua coleção de jogos**, acompanhar o progresso de cada um e descobrir o que jogar a seguir. Pense num **Letterboxd / Goodreads, mas pra games** — com gamificação extra: cada quest concluída te dá ouro, e seu dashboard mostra estatísticas detalhadas da sua jornada.

O sistema foi construído com foco em:

- **Server-first**: aproveita ao máximo Next.js App Router + Server Components + Server Actions, com mínimo de JS no cliente.
- **Performance**: índices estratégicos no banco, queries paralelizadas, cache de leitura por usuário, memoização em listas.
- **DX**: TypeScript puro, Drizzle com tipos inferidos, Zod nas validações, testes automatizados em todas as camadas críticas.

---

## Funcionalidades

### Library - Biblioteca de Jogos

- CRUD completo de jogos com **capa**, **plataforma**, **rating com meia-estrela** (0,5 a 5,0), **review** e **status** (Para Jogar, Jogando, Zerado, Abandonado, Quero Jogar).
- **Tags personalizadas** com cores customizadas (até 5 por jogo).
- **Plataformas personalizadas** com cores customizadas.
- **Favoritos** — toggle rápido com UI otimista.
- **Filtros**: busca por título, filtros por tag, somente favoritos.

### Quests - Sistema de Missões

- Missões personalizadas vinculadas a cada jogo.
- Cada quest concluída **gera +1 de ouro**; desfazer subtrai.
- Quests concluídas viram somente-leitura (não editáveis).
- Confirmação ao deletar — se a quest estava concluída, o ouro também é descontado.
- Quests agrupadas por jogo na listagem.

### Journey - Kanban Drag-and-Drop

- 5 colunas fixas: **Para Jogar**, **Jogando (Zerar)**, **Zerado**, **Jogando (Platinar)**, **Platinado**.
- Drag-and-drop entre colunas com `@dnd-kit`.
- Adicionar múltiplos jogos de uma vez (modal seletor).
- Cada jogo aparece em apenas uma coluna por vez.

### Run - Sorteador de Jogos

- Não sabe o que jogar? **Sorteie** entre seus jogos.
- Sistema de filtros encadeados (categoria + valor): plataforma, tags, status, nota, favoritos.
- Filtro 2 só libera após selecionar Filtro 1; trocar Filtro 1 reseta valores.
- Animação visual durante o sorteio.

### Dashboard - Métricas e Gráficos

- Filtro de período: **Semanal** (últimos 7 dias) / **Mensal** (mês atual) / **Anual** (ano atual).
- Cards de métricas: jogos adicionados, favoritos, taxa de conclusão, ouro ganho com indicador estilo bolsa de valores (% vs. período anterior + seta ↑↓).
- 3 donuts de breakdown: por **status**, por **plataforma**, por **tags**.
- Distribuição de notas com seletor interativo de estrelas (clica na estrela e vê quantos jogos com aquela nota).
- Card de reviews escritas com %.
- Timeline em area chart com gradiente.

### Autenticação

- Cadastro com **validação de força de senha** em tempo real.
- Login com sessão JWT armazenada em cookie `httpOnly`.
- Senhas com `bcrypt`.
- `proxy.ts` (Next 16) protege rotas autenticadas.

---

## Stack Tecnológica

### Frontend

| Tecnologia          | Versão | Uso                                                         |
| ------------------- | ------ | ----------------------------------------------------------- |
| **Next.js**         | 16.2   | App Router, Turbopack, Server Components, Server Actions    |
| **React**           | 19.2   | Concurrent features, `useTransition`, `memo`, `useCallback` |
| **TypeScript**      | 5.x    | Tipagem estrita em todo o projeto                           |
| **Tailwind CSS**    | 4      | Estilização via CSS variables (tema **Nord Light**)         |
| **Zustand**         | 5.0    | Estado global (user, modais, filtros)                       |
| **Recharts**        | 3.8    | Gráficos do Dashboard (donut, area chart)                   |
| **@dnd-kit**        | 6.3    | Drag-and-drop do Journey                                    |
| **react-hot-toast** | 2.6    | Notificações                                                |

### Backend / Dados

| Tecnologia      | Versão | Uso                                           |
| --------------- | ------ | --------------------------------------------- |
| **PostgreSQL**  | 16+    | Banco relacional                              |
| **Drizzle ORM** | 0.45   | ORM type-safe com migrations                  |
| **drizzle-kit** | 0.31   | Geração de migrations e push do schema        |
| **Zod**         | 4.3    | Validação de input em todas as Server Actions |
| **jose**        | 6.2    | JWT signing/verification                      |
| **bcryptjs**    | 3.0    | Hash de senhas                                |

### Testes

| Tecnologia                 | Versão | Uso                             |
| -------------------------- | ------ | ------------------------------- |
| **Jest**                   | 30     | Test runner com `next/jest`     |
| **React Testing Library**  | 16     | Testes de componentes           |
| **jest-environment-jsdom** | 30     | Simulação do DOM                |
| **dialog-polyfill**        | 0.5    | Polyfill do `<dialog>` no JSDOM |

### Infra / Deploy

- **Vercel** — hospedagem da aplicação (CI/CD via GitHub integration)
- **Neon** — PostgreSQL serverless (free tier)

---

## Arquitetura e Padrões

### Server-first

- **Páginas (`page.tsx`)** são Server Components que buscam dados via **Server Actions** e passam tudo já hidratado pra Client Components — zero requests do navegador na carga inicial.
- **Server Actions** (`src/actions/*.ts`) encapsulam toda lógica de negócio: validação Zod → query Drizzle → revalidação de cache.

### Performance

- **Índices estratégicos** em todas as colunas de filtro (userId, gameId, tagId, completedAt, etc).
- **Queries paralelas** (`Promise.all`) onde possível — Dashboard faz 5 queries em paralelo em vez de sequenciais.
- **N+1 eliminado** com LEFT JOIN único: `getGames` e `getJourneyData` retornam tudo numa query só.
- **Cache de leitura por usuário** com `unstable_cache` + `updateTag` (Next 16) — `getUserTags` e `getUserPlatforms` viram instantâneos após primeira carga.
- **`React.memo`** nos componentes de lista (`GameCard`, `QuestItem`, `JourneyCard`) com `useCallback` nos handlers do pai.
- **Streaming com `loading.tsx`** — Next.js automaticamente mostra skeleton enquanto Server Components fazem fetch.
- **`next/image`** otimizada com `remotePatterns` configurados.

### Estado e Reatividade

- **Zustand** mantém estado global mínimo: usuário, listas em cache, estado de modais, filtros da Library.
- **Hidratação no `useEffect`** das pages client a partir das props passadas pelo server.
- **UI otimista** em ações como toggle de favorito (atualiza UI antes da resposta do servidor, reverte em erro).

### Validação e Segurança

- **Zod** valida 100% dos inputs nas Server Actions (`src/validations/`).
- **JWT em cookie httpOnly** (`jose`), com `SESSION_SECRET` obrigatória em produção (fail-fast em `src/lib/secret.ts`).
- **Ownership checks** em todas as actions de mutação (sempre `WHERE userId = session.id`).
- **CSRF**: cookies `sameSite: lax`.
- **Senhas** com `bcryptjs` (10 rounds).

### Estrutura visual

- **Tema Nord Light** (Snow Storm + Polar Night + Frost + Aurora) aplicado via CSS variables no `globals.css`.
- **Componentes UI reutilizáveis** em `src/components/ui/` (Modal, Button, Input, Spinner, ProgressBar, StarRating).
- **Modais centralizados** com `<dialog>` nativo + polyfill nos testes.

---

## Getting Started

### Pré-requisitos

- **Node.js** 20+ (precisa do flag `--env-file` se quiser usar drizzle-kit fora do Next)
- **PostgreSQL** 16+ rodando localmente ou em um serviço hospedado (Neon, Supabase, Railway, etc.)
- **npm** ou outro gerenciador

### 1. Clone e instale

```bash
git clone https://github.com/JoaoVictorVM/SavePoint.git
cd SavePoint
npm install
```

### 2. Variáveis de ambiente

Edite `.env.local`:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/savepoint
SESSION_SECRET=<gere uma string aleatória de pelo menos 32 caracteres>
```

Pra gerar uma `SESSION_SECRET` segura:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 3. Aplicar schema no banco

Com o banco criado e vazio:

```bash
npx drizzle-kit push
```

Isso cria todas as tabelas com índices definidos no schema TypeScript.

> Caso a migração de índices de performance ainda não tenha sido aplicada (em bancos pré-existentes), rode também:
>
> ```bash
> psql $DATABASE_URL -f drizzle/0001_add_performance_indexes.sql
> ```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Scripts disponíveis

| Comando                 | Descrição                                 |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento com Turbopack |
| `npm run build`         | Build de produção                         |
| `npm start`             | Roda o build de produção                  |
| `npm run lint`          | ESLint                                    |
| `npm test`              | Roda todos os testes                      |
| `npm run test:watch`    | Modo watch — re-roda testes a cada save   |
| `npm run test:coverage` | Relatório de cobertura                    |

---

## Testes

Suite completa com **105 testes** distribuídos em **16 suítes**, cobrindo todas as features do sistema:

| Camada                                    | Cobertura                                                |
| ----------------------------------------- | -------------------------------------------------------- |
| **Server Actions** (`__tests__/actions/`) | 56 testes — games, quests, tags, platforms, journey      |
| **Componentes** (`__tests__/components/`) | 44 testes — todos os modais, cards, formulários, filtros |
| **UI Global**                             | 4 testes — Modal centralizado                            |
| **Layout**                                | 6 testes — GoldDisplay                                   |

Padrões adotados:

- **AAA** (Arrange / Act / Assert) em todos os testes.
- Banco mockado via helper `dbMock` que simula a chain do Drizzle.
- `next/cache` mockado em `__mocks__/next/cache.ts`.
- `recharts` mockado em `__mocks__/recharts.tsx` (evita problemas de ResizeObserver no JSDOM).
- `<dialog>` polifyilado no `jest.setup.ts`.

```bash
npm test                # roda tudo
npm run test:coverage   # relatório de cobertura
```

---

## Estrutura do Projeto

```
savepoint/
├── __mocks__/              # Mocks globais do Jest (next/cache, recharts, react-hot-toast)
├── __tests__/              # Testes (espelha src/)
│   ├── actions/            # Tests das server actions
│   ├── components/         # Tests dos componentes
│   ├── fixtures/           # Dados mock reutilizáveis
│   └── utils/              # Helpers (dbMock)
├── drizzle/                # SQL migrations geradas pelo drizzle-kit
├── src/
│   ├── actions/            # Server Actions (games, quests, journey, dashboard, etc.)
│   ├── app/                # App Router (pages, layouts, loading)
│   │   ├── (app)/          # Route group autenticado (Library, Quests, Journey, Run, Dashboard)
│   │   └── (auth)/         # Login e Register
│   ├── components/
│   │   ├── auth/           # Forms de login e registro
│   │   ├── dashboard/      # Cards, donuts, timeline, etc.
│   │   ├── games/          # GameCard, GameGrid, modais de CRUD
│   │   ├── journey/        # KanbanBoard, JourneyCard, KanbanColumn
│   │   ├── layout/         # AppShell, Sidebar, GoldDisplay
│   │   ├── library/        # LibraryClient, FilterBar, SearchBar
│   │   ├── platforms/      # PlatformManager
│   │   ├── quests/         # QuestItem, QuestGroup, modais
│   │   ├── run/            # RunPageClient, FilterPairRow, RollAnimation
│   │   ├── tags/           # TagManager, TagPicker, ColorPicker
│   │   └── ui/             # Componentes base (Modal, Button, Input, ...)
│   ├── lib/                # Helpers (db, session, secret, types, constants)
│   ├── schema/             # Schemas Drizzle (uma table por arquivo)
│   ├── stores/             # Zustand stores
│   ├── validations/        # Zod schemas pras actions
│   └── proxy.ts            # Auth proxy (Next 16) — substituiu middleware.ts
├── drizzle.config.ts
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Modelo de dados

```
users
├── id (uuid, pk)
├── username, email, passwordHash
├── goldBalance (decimal)
└── createdAt, updatedAt

games (referencia users)
├── id, userId, title
├── coverImageUrl, isFavorite
├── platformId (fk → platforms, set null)
├── rating (decimal 0.5..5.0), review, status
└── createdAt, updatedAt

tags / platforms (per-user)
├── id, userId, name, color (#hex)
└── createdAt, updatedAt

gameTags (m:n entre games e tags)
├── id, gameId, tagId
└── unique (gameId, tagId)

journeyItems
├── id, gameId, column (5 valores fixos), position
└── unique gameId — um jogo por journey

quests
├── id, gameId, title, description
├── completed, completedAt
└── createdAt, updatedAt
```

Indexes críticos aplicados em colunas frequentemente filtradas (userId composto, gameId, completedAt, etc.) — ver `drizzle/0001_add_performance_indexes.sql`.

---

## Deploy

A aplicação é deployada na **Vercel** com banco no **Neon**:

1. Repo no GitHub conectado à Vercel via integração nativa.
2. Variáveis configuradas no painel da Vercel.
3. Push em `main` dispara deploy automático.
4. Preview deploys automáticos em PRs.

---

## Como contribuir

1. **Fork** o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Instale as dependências: `npm install`
4. Configure o `.env.local` apontando pra um banco de dev
5. Rode os testes pra garantir que tudo passa: `npm test`
6. Faça suas alterações
7. **Adicione testes** pra cobrir o que mudou
8. **Confirme que `npm run build` e `npm test` passam**
9. Commit usando convenção `<tipo>: <descrição>` (ex: `feat(library): adicionar busca por gênero`)
10. Push e abra um Pull Request

Tipos de commit: `feat`, `fix`, `chore`, `refactor`, `style`, `test`, `perf`, `docs`.

---

## Licença

Distribuído sob a licença **MIT**. Veja o arquivo [`LICENSE`](LICENSE) pra mais detalhes.
