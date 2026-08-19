import { describe, expect, it } from 'vitest';
import { calculateStreak, dateKey, progressForDate, reminderOccursOn, seedState, shiftDate, toggleCompletion } from './domain';

const today = '2026-08-19';

describe('care reminder recurrence', () => {
  const base = { id: 'test', petId: 'pet', title: 'Task', category: 'Food' as const, time: '08:00', startDate: '2026-08-18', completionDates: [] as string[] };

  it('supports daily and weekday schedules', () => {
    expect(reminderOccursOn({ ...base, recurrence: 'daily' }, '2026-08-19')).toBe(true);
    expect(reminderOccursOn({ ...base, recurrence: 'weekdays' }, '2026-08-19')).toBe(true);
    expect(reminderOccursOn({ ...base, recurrence: 'weekdays' }, '2026-08-22')).toBe(false);
  });

  it('does not produce an occurrence before its start date', () => {
    expect(reminderOccursOn({ ...base, recurrence: 'daily' }, '2026-08-17')).toBe(false);
  });

  it('supports one-time and weekly schedules', () => {
    expect(reminderOccursOn({ ...base, recurrence: 'once' }, '2026-08-18')).toBe(true);
    expect(reminderOccursOn({ ...base, recurrence: 'once' }, '2026-08-19')).toBe(false);
    expect(reminderOccursOn({ ...base, recurrence: 'weekly' }, '2026-08-25')).toBe(true);
  });
});

describe('care completion and progress', () => {
  it('toggles a completion idempotently', () => {
    const reminder = { id: 'test', petId: 'pet', title: 'Task', category: 'Food' as const, time: '08:00', recurrence: 'daily' as const, startDate: today, completionDates: [] };
    const completed = toggleCompletion(reminder, today);
    expect(completed.completionDates).toEqual([today]);
    expect(toggleCompletion(completed, today).completionDates).toEqual([]);
  });

  it('calculates progress only from occurrences for the selected pet and date', () => {
    const reminders = seedState(new Date(`${today}T12:00:00`)).reminders;
    const progress = progressForDate(reminders, 'pet-mochi', today);
    expect(progress.total).toBe(4);
    expect(progress.completed).toBe(4);
    expect(progress.percent).toBe(1);
  });
});

describe('streaks', () => {
  it('counts consecutive fully completed days and stops at an incomplete day', () => {
    const seeded = seedState(new Date(`${today}T12:00:00`));
    expect(calculateStreak(seeded.reminders, 'pet-mochi', today)).toBe(6);
    const withGap = seeded.reminders.map(reminder => ({ ...reminder, completionDates: reminder.completionDates.filter(value => value !== shiftDate(today, -2)) }));
    expect(calculateStreak(withGap, 'pet-mochi', today)).toBe(2);
  });

  it('formats local dates without UTC rollover', () => {
    expect(dateKey(new Date(2026, 7, 19, 23, 59))).toBe(today);
  });
});
