import { Reminder, ReminderType, DEFAULT_REMINDER_OFFSETS_DAYS } from '@applyalert/contracts';


export interface ReminderPreferences {
  smartRemindersEnabled: boolean;
  dateOnlyDefaultHour: number; // e.g., 9 for 09:00
  dateOnlyDefaultMinute: number; // e.g., 0 for 00
  enabledOffsets: ReminderType[]; // Which offsets the user has enabled
}

export interface DeadlineInput {
  kind: string; // 'DATE_ONLY', 'EXACT_INSTANT', 'ROLLING', etc.
  utcInstant?: string; // ISO 8601 UTC string for EXACT_INSTANT
  localDate?: string; // YYYY-MM-DD for DATE_ONLY
  timezone?: string; // User timezone for DATE_ONLY
  userConfirmed: boolean;
}

export function generateReminderPlan(
  opportunityId: string,
  userId: string,
  deadline: DeadlineInput,
  now: Date,
  preferences: ReminderPreferences
): Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'deviceScheduleId'>[] {
  if (!preferences.smartRemindersEnabled || !deadline.userConfirmed) {
    return [];
  }

  // Only actionable deadlines
  if (deadline.kind !== 'DATE_ONLY' && deadline.kind !== 'EXACT_INSTANT') {
    return [];
  }

  const deadlineMs = getDeadlineInstantMs(deadline, preferences);
  if (!deadlineMs || deadlineMs <= now.getTime()) {
    return []; // Invalid or in the past
  }

  const daysUntilDeadline = (deadlineMs - now.getTime()) / (1000 * 60 * 60 * 24);

  const offsets = getOffsetsForDistance(daysUntilDeadline);
  const plan: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'deviceScheduleId'>[] = [];

  for (const offset of offsets) {
    const type = offsetToType(offset);
    if (!preferences.enabledOffsets.includes(type)) {
      continue;
    }

    const scheduledTime = new Date(deadlineMs - offset * 24 * 60 * 60 * 1000);
    
    // Don't schedule in the past
    if (scheduledTime.getTime() > now.getTime()) {
      plan.push({
        userId,
        opportunityId,
        type,
        status: 'PENDING',
        channel: 'LOCAL',
        scheduledFor: scheduledTime.toISOString(),
      });
    }
  }

  return plan;
}

function getDeadlineInstantMs(deadline: DeadlineInput, preferences: ReminderPreferences): number | null {
  if (deadline.kind === 'EXACT_INSTANT' && deadline.utcInstant) {
    return new Date(deadline.utcInstant).getTime();
  }

  if (deadline.kind === 'DATE_ONLY' && deadline.localDate) {
    // For DATE_ONLY, we need to convert the local date + user preferred time to UTC.
    // e.g. "2026-11-15" + "09:00" in "America/New_York" -> UTC instant.
    // A robust implementation would use a timezone library (e.g. date-fns-tz or luxon),
    // but we can do a simplified approximation if we don't have one, or expect the caller to pass it.
    // Assuming simple UTC calculation for now.
    const [year, month, day] = deadline.localDate.split('-').map(Number);
    // In a real app we'd construct this in the specific timezone.
    // For the sake of the pure generator, we'll construct it in UTC as a fallback if timezone parsing is complex.
    const date = new Date(Date.UTC(year, month - 1, day, preferences.dateOnlyDefaultHour, preferences.dateOnlyDefaultMinute, 0));
    return date.getTime();
  }

  return null;
}

function getOffsetsForDistance(days: number): number[] {
  if (days > 45) return [...DEFAULT_REMINDER_OFFSETS_DAYS.FAR];
  if (days >= 15) return [...DEFAULT_REMINDER_OFFSETS_DAYS.MEDIUM];
  if (days >= 8) return [...DEFAULT_REMINDER_OFFSETS_DAYS.NEAR];
  if (days >= 4) return [...DEFAULT_REMINDER_OFFSETS_DAYS.CLOSE];
  return [...DEFAULT_REMINDER_OFFSETS_DAYS.IMMINENT];
}

function offsetToType(offset: number): ReminderType {
  switch (offset) {
    case 30: return 'THIRTY_DAYS';
    case 14: return 'FOURTEEN_DAYS';
    case 7: return 'SEVEN_DAYS';
    case 3: return 'THREE_DAYS';
    case 1: return 'ONE_DAY';
    case 0: return 'DEADLINE_DAY';
    default: return 'CUSTOM';
  }
}
