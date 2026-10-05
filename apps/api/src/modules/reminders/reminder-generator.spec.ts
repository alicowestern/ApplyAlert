import { generateReminderPlan, ReminderPreferences, DeadlineInput } from './reminder-generator';

describe('Reminder Generator', () => {
  const defaultPrefs: ReminderPreferences = {
    smartRemindersEnabled: true,
    dateOnlyDefaultHour: 9,
    dateOnlyDefaultMinute: 0,
    enabledOffsets: ['THIRTY_DAYS', 'FOURTEEN_DAYS', 'SEVEN_DAYS', 'THREE_DAYS', 'ONE_DAY', 'DEADLINE_DAY'],
  };

  const MOCK_NOW = new Date('2026-10-01T12:00:00Z');

  it('generates FAR offsets when deadline is > 45 days away', () => {
    const deadline: DeadlineInput = {
      kind: 'EXACT_INSTANT',
      utcInstant: '2026-12-01T12:00:00Z', // 61 days away
      userConfirmed: true,
    };

    const plan = generateReminderPlan('opp-1', 'user-1', deadline, MOCK_NOW, defaultPrefs);
    expect(plan).toHaveLength(6);
    expect(plan.map(r => r.type)).toEqual([
      'THIRTY_DAYS',
      'FOURTEEN_DAYS',
      'SEVEN_DAYS',
      'THREE_DAYS',
      'ONE_DAY',
      'DEADLINE_DAY'
    ]);
  });

  it('does not generate reminders in the past', () => {
    // Deadline is 5 days away. 30, 14, 7 days offsets are in the past.
    const deadline: DeadlineInput = {
      kind: 'EXACT_INSTANT',
      utcInstant: '2026-10-06T12:00:00Z', // 5 days away
      userConfirmed: true,
    };

    const plan = generateReminderPlan('opp-1', 'user-1', deadline, MOCK_NOW, defaultPrefs);
    // distance is 5 days. Should pick [3, 1, 0] days offsets because it falls into CLOSE range
    expect(plan.map(r => r.type)).toEqual([
      'THREE_DAYS',
      'ONE_DAY',
      'DEADLINE_DAY'
    ]);
  });

  it('ignores ROLLING and AMBIGUOUS deadlines', () => {
    const plan1 = generateReminderPlan('opp-1', 'user-1', { kind: 'ROLLING', userConfirmed: true }, MOCK_NOW, defaultPrefs);
    expect(plan1).toHaveLength(0);

    const plan2 = generateReminderPlan('opp-1', 'user-1', { kind: 'AMBIGUOUS', userConfirmed: true }, MOCK_NOW, defaultPrefs);
    expect(plan2).toHaveLength(0);
  });

  it('ignores unconfirmed deadlines', () => {
    const deadline: DeadlineInput = {
      kind: 'EXACT_INSTANT',
      utcInstant: '2026-12-01T12:00:00Z',
      userConfirmed: false, // Not confirmed!
    };
    const plan = generateReminderPlan('opp-1', 'user-1', deadline, MOCK_NOW, defaultPrefs);
    expect(plan).toHaveLength(0);
  });

  it('respects user preferences for enabled offsets', () => {
    const deadline: DeadlineInput = {
      kind: 'EXACT_INSTANT',
      utcInstant: '2026-12-01T12:00:00Z',
      userConfirmed: true,
    };
    
    const limitedPrefs: ReminderPreferences = {
      ...defaultPrefs,
      enabledOffsets: ['THREE_DAYS', 'ONE_DAY'],
    };

    const plan = generateReminderPlan('opp-1', 'user-1', deadline, MOCK_NOW, limitedPrefs);
    expect(plan.map(r => r.type)).toEqual(['THREE_DAYS', 'ONE_DAY']);
  });
});
