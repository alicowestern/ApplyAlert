# ApplyAlert

AI-powered opportunity deadline and reminder assistant.

ApplyAlert bridges the gap between "I found this opportunity" and "I successfully applied before the deadline."

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Mobile app**: React Native 0.87 + TypeScript (strict mode)
- **Shared packages**: Domain types (`@applyalert/contracts`), validation (`@applyalert/validation`)
- **Future backend**: Will live in `apps/api/`

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm@9`)
- **Java** JDK 17 (Temurin recommended)
- **Android Studio** with Android SDK
- **Android SDK** environment variables:

```powershell
# Add to your system environment variables (Windows)
ANDROID_HOME = C:\Users\<your-user>\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start Metro bundler
pnpm mobile:start

# 3. Run on Android (in a separate terminal)
pnpm mobile:android
```

## Project Structure

```
apps/
  mobile/          React Native mobile application
  api/             Backend API (not yet implemented)

packages/
  contracts/       Shared TypeScript domain types
  validation/      Shared Zod validation schemas
  config/          Shared TypeScript/tooling configuration

docs/              Architecture and decision documentation
```

## Available Commands

| Command | Description |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm mobile:start` | Start Metro bundler |
| `pnpm mobile:android` | Build and run on Android |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting |

## Documentation

- [Architecture](docs/architecture.md)
- [Product Specification](docs/product.md)
- [Architectural Decisions](docs/decisions/)
  - [ADR-001: React Native + TypeScript](docs/decisions/001-react-native-typescript.md)

## License

Private â€” not yet licensed for distribution.
