# ApplyAlert

AI-powered opportunity deadline and reminder assistant.

ApplyAlert bridges the gap between "I found this opportunity" and "I successfully applied before the deadline."

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Mobile app**: React Native 0.87 + TypeScript (strict mode, offline-first with MMKV)
- **Backend API**: NestJS 10 + PostgreSQL + Prisma ORM in `apps/api/`
- **Shared packages**: Domain types (`@applyalert/contracts`), validation (`@applyalert/validation`), shared configs (`@applyalert/config`)

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Prerequisites

- **Node.js** >= 18.0.0 (v20 recommended)
- **pnpm** >= 9.0.0 (`npm install -g pnpm@9`)
- **PostgreSQL 16** (via Docker or local installation)
- **Java** JDK 17 (Temurin recommended, for mobile)
- **Android Studio** with Android SDK (for mobile)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the root:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` points to your PostgreSQL instance:
```
DATABASE_URL="postgresql://applyalert:applyalert@localhost:5432/applyalert_dev?schema=public"
```

### 3. Database Setup

If you have Docker installed:
```bash
pnpm db:up
```

If running PostgreSQL locally without Docker:
Ensure PostgreSQL is running on port `5432` with a database named `applyalert_dev`.

Generate Prisma client and run migrations:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Start the Backend API

```bash
pnpm api:dev
```
- API Base URL: `http://localhost:3000/api/v1`
- OpenAPI Swagger Documentation: `http://localhost:3000/api/docs`

### 5. Start Mobile App

```bash
# Metro bundler
pnpm mobile:start

# Run on Android
pnpm mobile:android
```

## Available Commands

| Command | Description |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm api:dev` | Start NestJS backend API in dev mode |
| `pnpm api:test` | Run backend API unit tests |
| `pnpm db:up` | Start PostgreSQL container via Docker Compose |
| `pnpm db:migrate` | Apply Prisma database migrations |
| `pnpm db:seed` | Seed database with development user and test opportunities |
| `pnpm mobile:start` | Start Metro bundler |
| `pnpm mobile:android` | Build and run mobile app on Android |
| `pnpm test` | Run test suites across the monorepo |
| `pnpm typecheck` | Run TypeScript checks on all workspaces |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm format` | Format code with Prettier |

## Documentation

- [Architecture](docs/architecture.md)
- [Product Specification](docs/product.md)
- [Architectural Decisions](docs/decisions/)
  - [ADR-001: React Native + TypeScript](docs/decisions/001-react-native-typescript.md)
  - [ADR-002: Modular Monolith Backend with NestJS](docs/decisions/002-backend-monolith-nestjs.md)
  - [ADR-003: PostgreSQL, Prisma, and Deadline Preservation](docs/decisions/003-postgresql-prisma-deadline-preservation.md)
  - [ADR-004: Offline-First Mobile and API Sync Architecture](docs/decisions/004-offline-first-sync-architecture.md)

## License

Private — not yet licensed for distribution.
