# ApplyAlert â€” Architecture

## Overview

ApplyAlert is structured as a TypeScript monorepo containing a React Native mobile application and shared packages. The backend will be added as a separate workspace package when ready.

## Monorepo Layout

```
applyalert/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ mobile/        @applyalert/mobile     React Native app
â”‚   â””â”€â”€ api/           @applyalert/api        Future backend
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ contracts/     @applyalert/contracts  Shared domain types
â”‚   â”œâ”€â”€ validation/    @applyalert/validation Shared Zod schemas
â”‚   â””â”€â”€ config/        @applyalert/config     Shared tooling config
â””â”€â”€ docs/
```

### Package Manager

pnpm with workspaces. Uses `node-linker=hoisted` for React Native compatibility (Metro/Gradle expect flat `node_modules`).

## Mobile Application Architecture

### Feature-Oriented Organization

```
apps/mobile/src/
â”œâ”€â”€ app/               Application shell (providers, navigation, error boundary)
â”œâ”€â”€ features/          Feature modules (home, import, opportunity, settings)
â”œâ”€â”€ components/        Shared UI components
â”œâ”€â”€ services/          Platform-abstracted service interfaces
â”œâ”€â”€ hooks/             Shared React hooks
â”œâ”€â”€ theme/             Design system (tokens, theme)
â”œâ”€â”€ types/             Shared TypeScript types (Result, etc.)
â””â”€â”€ utils/             Utility functions
```

### Key Principles

1. **Business logic outside components**: Screens compose UI and invoke hooks/services
2. **Platform abstraction**: Native features (notifications, sharing, storage) hidden behind TypeScript interfaces
3. **Centralized design system**: All visual constants from theme tokens
4. **Consistent error handling**: `Result<T, E>` type for service operations
5. **Type-safe navigation**: Centralized param list types

### Service Abstraction Layer

Platform-specific functionality is abstracted behind interfaces:

```
NotificationScheduler    â†’ Android AlarmManager / iOS UNUserNotification
ShareReceiver            â†’ Android Sharesheet / iOS Share Extension
StorageService           â†’ AsyncStorage / MMKV
SecureStorageService     â†’ Android Keystore / iOS Keychain
ApiClient                â†’ fetch wrapper with Result returns
```

The rest of the application codes against these interfaces, not implementations. This enables:
- Platform-specific implementations without polluting business logic
- Mock implementations for testing
- Future iOS support without rewriting service consumers

### Navigation

Bottom tab navigator with 4 primary areas:
- **Home** â€” Urgent and upcoming deadlines
- **Add Opportunity** â€” Import via paste/image/PDF
- **Applications** â€” Status tracking (Saved/Preparing/Applied)
- **Settings** â€” Preferences and configuration

### State Management

- **TanStack Query** for server state (API data, caching, mutations)
- **Zustand** only for lightweight client-global state where truly needed
- **React state** for local component state

## Domain Model

### Core Types

The domain model lives in `@applyalert/contracts` and is shared between mobile and backend.

#### Deadline â€” The Critical Type

The `Deadline` type is the most important design decision. It is **never** a single `Date`. It preserves:

- `kind`: Classification (EXACT_INSTANT, DATE_ONLY, ROLLING, etc.)
- `originalText`: Preserved source text
- `localDate`: Calendar date only (when known)
- `localTime`: Time only when **explicitly stated** (never fabricated)
- `timezone`: IANA timezone when **explicitly stated**
- `utcInstant`: Only when all components are deterministically known
- `confidence`: 0.0â€“1.0 score
- `userConfirmed`: Whether user explicitly validated
- `evidence`: Source context
- `alternativeCandidates`: Other potential dates found

Key invariants:
- We **never** manufacture "23:59" for date-only deadlines
- `utcInstant` requires `localDate + localTime + timezone`
- Low confidence + not confirmed â†’ UI must prompt

#### Opportunity

Central entity with all opportunity metadata, linked to a `Deadline` and `OpportunitySource`.

### Validation

Runtime validation via Zod schemas in `@applyalert/validation`. Used to validate data from the API/AI pipeline before it enters the UI layer.

## Future Pipeline (Not Yet Implemented)

```
User Input
  â†’ Source Acquisition (URL fetch, text parse)
  â†’ Text/OCR/Document Extraction
  â†’ LLM Structured Extraction
  â†’ Deterministic Validation (Zod schemas)
  â†’ Confidence Calculation
  â†’ User Review (if confidence < threshold)
  â†’ Save
  â†’ Reminder Generation
```

The mobile app **never** contains AI provider keys. All AI processing happens on the backend.

## Design System

Centralized design tokens in `theme/tokens.ts`:

- **Colors**: Teal primary (trust), amber accent (urgency), cool gray neutrals
- **Typography**: System fonts with a defined scale
- **Spacing**: 4px base unit
- **Radius**: Consistent border radius tokens
- **Shadows**: Three elevation levels

Light mode first. Dark mode can be added by creating an alternative token set.

## Testing Strategy

- **Unit tests**: Domain types, utilities, business logic (Jest)
- **Component tests**: React Native components (Testing Library)
- **Integration tests**: Navigation flows (future)
- **E2E tests**: Detox or Maestro (future)
