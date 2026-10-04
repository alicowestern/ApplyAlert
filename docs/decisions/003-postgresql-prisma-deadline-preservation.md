# 3. PostgreSQL, Prisma, and Strict Deadline Preservation

Date: 2026-10-04

## Status

Accepted

## Context

ApplyAlert tracks opportunity deadlines across multiple time zones, calendar date formats, and ambiguous submission dates. 

A common pitfall in deadline tracking systems is collapsing every deadline into a UTC `TIMESTAMP` / `DateTime`. When a scholarship closes on "November 15, 2026" without specifying a time or timezone, converting it into `2026-11-15T00:00:00Z` or `2026-11-15T23:59:00Z` corrupts the calendar date when viewed in other time zones (e.g. UTC-8 or UTC+5:30 might display November 14 or November 16).

## Decision

We chose **PostgreSQL** managed with **Prisma ORM**, with a dedicated relational table `OpportunityDeadline` using structured, non-destructive deadline modeling:

1. **`DATE_ONLY` Preserves Local Calendar Dates as Strings:**
   - Stored in a `localDate String?` column in PostgreSQL (e.g., `"2026-11-15"`).
   - We NEVER manufacture an artificial time like `"23:59:59"` or convert to a UTC timestamp.
2. **`EXACT_INSTANT` Uses True UTC Timestamps:**
   - When date, time, and timezone are all explicitly verified, stored in `utcInstant DateTime?`.
3. **Auditability and Evidence:**
   - `originalText String?` stores the exact raw string extracted from the source.
   - `confidence Float` and `userConfirmed Boolean` flag deadlines requiring user verification.
   - `alternativeCandidates String[]` retains alternative dates found during extraction.

## Consequences

- Timezone shifting bugs are completely eliminated for date-only deadlines.
- Database records reflect the exact fidelity of the original opportunity source.
- Prisma schema enforces relational cascades (`onDelete: Cascade`) between `Opportunity`, `OpportunitySource`, and `OpportunityDeadline`.
