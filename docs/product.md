# ApplyAlert â€” Product Specification

## Problem

People discover valuable opportunities â€” scholarships, internships, fellowships, jobs, grants, conferences, hackathons, competitions, exchange programs â€” but:

1. They think "I'll apply later"
2. They save it somewhere and forget
3. They remember after the deadline

ApplyAlert bridges the gap between **discovering an opportunity** and **applying before the deadline**.

## Core Flow

```
Opportunity discovered
â†’ Share/paste/upload into ApplyAlert
â†’ AI analyzes the source
â†’ Important details extracted
â†’ Deadline detected
â†’ User reviews and validates
â†’ Opportunity saved
â†’ Smart reminders scheduled
â†’ User progresses: Saved â†’ Preparing â†’ Applied
â†’ Remaining reminders cancelled on Applied
```

## Product Principles

1. **Not a discovery platform** â€” users bring their own opportunities
2. **Deadline reliability is paramount** â€” the most important product requirement
3. **AI must never silently invent a deadline** â€” ambiguous dates require user confirmation
4. **Evidence preservation** â€” always retain the original text from which deadlines were extracted
5. **Mobile-first** â€” Android first, future iOS support

## Opportunity Types

- Scholarship
- Internship
- Fellowship
- Job
- Grant
- Conference
- Hackathon
- Competition
- Exchange Program
- Other

## Application Status Tracking

| Status | Meaning |
|---|---|
| Saved | Opportunity captured, not started |
| Preparing | Actively working on application |
| Applied | Application submitted |
| Skipped | Decided not to apply |
| Archived | Deadline passed or no longer relevant |

## Import Methods (Future)

- Paste URL
- Paste text
- Android Sharesheet (URL, text, image, PDF)
- Manual image selection
- Manual PDF selection

## Reminder Strategy

| Time to Deadline | Reminders |
|---|---|
| > 45 days | 30d, 14d, 7d, 3d, 1d, deadline day |
| 15â€“45 days | 14d, 7d, 3d, 1d, deadline day |
| 8â€“14 days | 7d, 3d, 1d, deadline day |
| 4â€“7 days | 3d, 1d, deadline day |
| 2â€“3 days | 1d, deadline day |

Hour-level reminders only when an actual deadline time is known.

Marking an opportunity **Applied** cancels all future reminders.

## Design Direction

The product should feel:
- âœ… Calm
- âœ… Trustworthy
- âœ… Modern
- âœ… Minimal
- âœ… Action-oriented

The product should NOT look like:
- âŒ A social network
- âŒ A news feed
- âŒ A crypto dashboard
- âŒ An overly colorful AI demo

Deadlines should have **strong visual hierarchy** â€” the most important information is always visible.
