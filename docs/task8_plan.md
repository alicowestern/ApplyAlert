# Task 8: Reliable Deadline Reminder System Implementation Plan

## 1. Domain Modeling
- **@applyalert/contracts**: Update `Reminder` domain model with robust types (`ReminderType`, `ReminderStatus`, `ReminderChannel`).
- **Prisma Schema**: Add `Reminder` model linking `User` and `Opportunity`, along with appropriate indexes. Run migrations.

## 2. Reminder Generator (Pure TS)
- Create `ReminderGenerator` that takes a `Deadline` and `Preferences` and returns an array of `Reminder` plans.
- Handle offsets (30, 14, 7, 3, 1, 0 days).
- **DATE_ONLY Policy**: Calculate delivery times based on the user's local "default reminder time" (e.g. 09:00).
- **EXACT_INSTANT Policy**: Calculate offsets against the actual UTC instant.
- **Safety**: Do not generate reminders for the past. Only schedule for confirmed actionable deadlines (skip `ROLLING`, `AMBIGUOUS`).

## 3. Backend Persistence & API
- **RemindersService**: Save generated plans into DB. Reconcile differences when regenerated (cancel old ones).
- **Opportunity Lifecycle Events**: Trigger generation on create/update of deadline. Cancel all future reminders on `APPLIED`, `ARCHIVED`, or `SKIPPED`.
- **Endpoints**: `GET /reminders`, `PUT /preferences`, etc.

## 4. Mobile Notification Abstraction
- Create `NotificationScheduler` interface.
- Implement it using `@notifee/react-native` (industry standard for local notification reliability, permissions, timezone handling, and reboot recovery).
- Android local notifications will be the physical mechanism, while the backend maintains the logical truth.

## 5. UI and Settings
- **Opportunity Details**: Show scheduled reminders.
- **Settings**: Add toggles for Smart Reminders and default delivery time (e.g. 09:00).
- Request POST_NOTIFICATIONS politely, deferring until the first actionable opportunity is saved or toggled in Settings.

## 6. Deep Linking & Reconciliation
- Configure deep link for notification tap -> opens `OpportunityDetailScreen`.
- App cold/warm start reconciles the local DB/backend with pending notifications to clear stale ones.

## 7. Testing
- Write extensive Jest tests for the `ReminderGenerator` handling various days, timezones, and states.
- Run `pnpm typecheck` and `pnpm lint`.
- Compile via `gradlew`.

**Note on Notifee**: I highly recommend `@notifee/react-native` for the Android implementation as it solves reboot recovery, channels, permissions, and exact vs inexact alarm policies robustly without massive custom Kotlin maintenance.

Please approve this plan so I can begin execution.
