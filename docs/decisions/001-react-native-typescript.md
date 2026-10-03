# ADR-001: React Native + TypeScript

**Status**: Accepted
**Date**: 2026-10-03

## Context

We need to choose a mobile development approach for ApplyAlert, an opportunity deadline tracking app targeting Android first with future iOS support planned.

The options considered were:

1. **Kotlin-only Android** (native Android)
2. **React Native + TypeScript** (cross-platform)
3. **Flutter + Dart** (cross-platform)

## Decision

We selected **React Native with TypeScript** (strict mode).

## Rationale

### Developer productivity

The developer/team is already productive with React Native and TypeScript. Choosing Kotlin-only would require significant ramp-up time on Android-specific patterns (Jetpack Compose, Coroutines, Hilt, etc.) that the team is less experienced with.

### Future iOS support matters

ApplyAlert's value proposition is not platform-specific. Users on iOS have the same deadline tracking needs. React Native allows a single codebase to target both platforms, reducing the cost of future iOS support from "build a new app" to "handle platform-specific integration points."

### Android-specific functionality via native integration

Android-first does not mean Android-only in the codebase. React Native supports native modules and bridging, allowing us to:

- Use Android `AlarmManager` for reliable notification scheduling
- Implement Android Sharesheet receiver as a native module
- Access Android Keystore for secure storage

These integrations will be built as native modules exposed through TypeScript interfaces.

### Platform isolation via interfaces

All platform-specific functionality is hidden behind TypeScript interfaces:

```
NotificationScheduler  â†’ Android: AlarmManager, iOS: UNUserNotification
ShareReceiver          â†’ Android: Sharesheet, iOS: Share Extension
SecureStorage          â†’ Android: Keystore, iOS: Keychain
```

The rest of the application â€” domain logic, UI, navigation, state management â€” is platform-agnostic. This means:

- Business logic tests run without a device
- Platform implementations can be swapped without changing consumers
- Mock implementations work cleanly in tests

### Reminder reliability does not depend on JavaScript timers

This is a critical point. Production notification scheduling will use native platform APIs (`AlarmManager` on Android), not JavaScript `setTimeout` or background task schedulers. The React Native layer is responsible for scheduling reminders through the native interface, not for timing them.

### Switching mobile implementations should not require rewriting backend/domain services

By placing domain types in a shared `@applyalert/contracts` package and validation in `@applyalert/validation`, the backend and domain model are completely independent of the mobile framework. If we ever needed to rewrite the mobile app in Kotlin or Swift, the backend, API contracts, and validation logic would remain unchanged.

## Consequences

### Positive

- Single codebase for Android and iOS
- Fast iteration with hot reload
- TypeScript strict mode catches errors at compile time
- Shared domain types between mobile and future backend
- Large ecosystem of libraries and community support

### Negative

- React Native bridge overhead (minimal with New Architecture / TurboModules)
- Native module development still requires Kotlin/Swift knowledge
- App binary size is larger than pure native
- Some advanced Android features may require custom native modules

### Risks

- React Native version upgrades can be non-trivial (mitigated by staying on LTS/stable)
- Performance-critical features may need native optimization (unlikely for a deadline tracker)
- Native module maintenance burden for platform-specific features

## Alternatives Rejected

### Kotlin-only Android

Rejected because:
- No path to iOS without a full rewrite
- Team would need significant Kotlin/Android ramp-up
- Domain types and validation would need separate implementations for backend

### Flutter + Dart

Rejected because:
- Team is not productive with Dart
- TypeScript ecosystem is richer for our backend needs
- React Native has better native module bridging for our use case
