# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Finansia** — A personal finance management app built for Mexico (Spanish-language UI, Mexican Pesos). Features AI-powered chat for managing transactions, bank statement PDF parsing, financial tips generation, expense tracking with categories, financial goals, and spending analysis charts.

## Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:push` — Push schema to database (no migration files)
- `npm run db:migrate` — Run migrations

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Database**: PostgreSQL via Neon (`@neondatabase/serverless`), ORM is Drizzle
- **AI**: Vercel AI SDK v5 (`ai` package) with OpenAI (GPT-5 for chat) and Anthropic (Claude Sonnet for statement parsing)
- **UI**: Tailwind CSS v4, Radix UI Themes, MUI (date pickers), Recharts, Vaul (drawers), Lucide icons
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Styling**: `clsx` + `tailwind-merge` via `lib/utils.ts`

## Architecture

### Routing (App Router)

- `/` — Landing/redirect page
- `/home` — Dashboard with accounts, goals, tips
- `/data` — Transaction list with DataDashboard
- `/data/review` — Review unverified transactions (from PDF imports)
- `/categories` — Category management
- `/categories/[id]` — Category detail
- `/analysis` — Spending analysis with charts

### API Routes (`app/api/`)

All API routes authenticate via `currentUser()` from Clerk. Key routes:
- `chat/` — AI chat with tool-calling (create/retrieve/delete transactions)
- `transactions/` — CRUD for transactions (GET, POST, PATCH, DELETE)
- `upload-statement/` — PDF bank statement upload and AI-powered parsing (background processing)
- `tips/` — Financial tips
- `cron/` — Scheduled tasks (tips generation)
- `accounts/`, `categories/`, `goals/`, `expenses/`, `pie-chart/`

### Server Actions (`app/actions/`)

Used for goals and accounts CRUD. Return `{ success, message, data? }` pattern. Error messages are in Spanish.

### Database (`lib/db/`)

- `lib/db/index.ts` — Drizzle client, uses `DATABASE_URL` env var
- `lib/db/schema/` — Table definitions (transactions, accounts, categories, financial_goals, financial_tips, users, statementUploads, resources, expenses)
- IDs use `nanoid()` from `lib/utils.ts`
- Account balances are computed dynamically via SQL (sum of incoming minus outgoing transactions)
- Goal progress is computed similarly from linked account transactions

### Services (`lib/services/`)

Business logic layer between API routes and database:
- `transactions.ts` — Create, query, delete transactions; resolves names to IDs for accounts/categories
- `statements.ts` — Statement upload management
- `goals.ts` — Goal operations

### Client State

- `TransactionsContext` — Provides `refreshTransactions()` trigger (counter-based) for re-fetching after mutations
- `ChatContext` — Wraps Vercel AI SDK's `useChat`, provides shared chat state across the app; auto-refreshes transactions on tool calls

### AI Chat System (`app/api/chat/route.ts`)

The chat endpoint uses Vercel AI SDK `streamText` with tool-calling. Tools:
- `createTransaction` — Creates transactions with zod validation (category-type cross-validation via `superRefine`)
- `retrieveTransactions` — Query transactions by any combination of filters
- `deleteTransactions` — Delete matching transactions

Tool input schemas dynamically build `z.enum()` arrays from the user's actual categories and accounts.

### Statement Processing (`app/api/upload-statement/route.ts`)

PDF upload flow: upload file → parse with pdf2json → send to Claude Sonnet via `generateObject` → create transactions. Runs as fire-and-forget background processing. Unverified transactions (where AI couldn't classify) are flagged with `isUnverified: true` for user review.

## Key Patterns

- Path alias: `@/*` maps to project root
- Transaction types: `"income"`, `"expense"`, `"transfer"` — each has different source/target account semantics
- Categories have a `type` field matching transaction types; transfers have no category
- All user-facing error messages and UI text are in **Spanish**
- `force-dynamic` is set on the root layout — all pages are server-rendered on every request
