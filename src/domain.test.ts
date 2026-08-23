import { describe, expect, it } from 'vitest';
import {
  CareReminder,
  PawdayState,
  calculateStreak,
  categoryBreakdown,
  dateKey,
  describeAge,
  daysUntilBirthday,
  emptyState,
  formatWeight,
  fromDisplayWeight,
  nextUpTask,
  progressForDate,
  reminderOccursOn,
  shiftDate,
  toggleCompletion,
  upcomingVaccinations,
  weakestHabit,
  weightTrend,
} from './domain';
import { canAdd, usage } from './pro';
import { careScore, derivedXp, levelFromXp, questsForDate, questStatuses, streakMultiplier, totalXp, weeklyChallenge } from './game';
import { hydrate, importState } from './storage';
import { starterPack, tipsFor } from './suggestions';

const today = '2026-08-19';

const base = {
  id: 'test',
  petId: 'pet',
  title: 'Task',
  category: 'Food' as const,
  time: '08:00',
  startDate: '2026-08-18',
  completionDates: [] as string[],
};

/** A state with one pet and the given reminders, for the gameplay assertions. */
function stateWith(reminders: CareReminder[], patch: Partial<PawdayState> = {}): PawdayState {
  const blank = emptyState(new Date(`${today}T12:00:00`));
  return {
    ...blank,
    pets: [{ id: 'pet', name: 'Mochi', species: 'Dog', breed: 'Shiba', emoji: '🐕', color: '#F5A66D', createdAt: today }],
    selectedPetId: 'pet',
    reminders,
    ...patch,
    settings: { ...blank.settings, onboarded: true, ...(patch.settings ?? {}) },
  };
}

describe('care reminder recurrence', () => {
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

  it('skips paused reminders entirely', () => {
    expect(reminderOccursOn({ ...base, recurrence: 'daily', paused: true }, today)).toBe(false);
  });
});

describe('care completion and progress', () => {
  it('toggles a completion idempotently', () => {
    const reminder = { ...base, recurrence: 'daily' as const, startDate: today };
    const completed = toggleCompletion(reminder, today);
    expect(completed.completionDates).toEqual([today]);
    expect(toggleCompletion(completed, today).completionDates).toEqual([]);
  });

  it('counts only occurrences for the selected pet and date', () => {
    const reminders: CareReminder[] = [
      { ...base, id: 'a', recurrence: 'daily', completionDates: [today] },
      { ...base, id: 'b', recurrence: 'daily', completionDates: [] },
      { ...base, id: 'c', petId: 'other', recurrence: 'daily', completionDates: [] },
    ];
    const progress = progressForDate(reminders, 'pet', today);
    expect(progress).toEqual({ completed: 1, total: 2, percent: 0.5 });
  });

  it('picks the next unfinished task by clock time', () => {
    const reminders: CareReminder[] = [
      { ...base, id: 'morning', time: '08:00', recurrence: 'daily', completionDates: [today] },
      { ...base, id: 'evening', time: '18:00', recurrence: 'daily' },
    ];
    const next = nextUpTask(reminders, 'pet', today, new Date(`${today}T12:00:00`));
    expect(next?.id).toBe('evening');
  });
});

describe('streaks', () => {
  const daily: CareReminder = { ...base, recurrence: 'daily', startDate: shiftDate(today, -30) };

  it('counts consecutive fully completed days and stops at a miss', () => {
    const history = Array.from({ length: 5 }, (_, index) => shiftDate(today, -index));
    expect(calculateStreak([{ ...daily, completionDates: history }], 'pet', today)).toBe(5);
    const withGap = history.filter(key => key !== shiftDate(today, -2));
    expect(calculateStreak([{ ...daily, completionDates: withGap }], 'pet', today)).toBe(2);
  });

  it('lets a streak freeze rescue a missed day', () => {
    const history = Array.from({ length: 5 }, (_, index) => shiftDate(today, -index)).filter(key => key !== shiftDate(today, -2));
    expect(calculateStreak([{ ...daily, completionDates: history }], 'pet', today, [shiftDate(today, -2)])).toBe(5);
  });

  it('formats local dates without UTC rollover', () => {
    expect(dateKey(new Date(2026, 7, 19, 23, 59))).toBe(today);
  });
});

describe('a fresh install', () => {
  it('ships with no pets and no demo data', () => {
    const state = emptyState();
    expect(state.pets).toEqual([]);
    expect(state.reminders).toEqual([]);
    expect(state.moments).toEqual([]);
    expect(state.settings.onboarded).toBe(false);
  });

  it('suggests a species-appropriate starter routine instead', () => {
    const dog = starterPack('Dog');
    const fish = starterPack('Fish');
    expect(dog.some(task => task.category === 'Walk')).toBe(true);
    expect(fish.some(task => task.title.toLowerCase().includes('water'))).toBe(true);
    expect(dog.filter(task => task.recommended).length).toBeGreaterThan(2);
  });
});

describe('free vs pro gating', () => {
  it('caps pets, reminders and health records on free', () => {
    const state = stateWith(Array.from({ length: 6 }, (_, index) => ({ ...base, id: `r${index}`, recurrence: 'daily' as const })));
    expect(canAdd(state, 'reminder').allowed).toBe(false);
    expect(canAdd(state, 'pet').allowed).toBe(false);
    expect(canAdd(state, 'expense').allowed).toBe(false);
    expect(canAdd(state, 'visit').feature).toBe('health-vault');
    expect(usage(state, 'reminder').atLimit).toBe(true);
  });

  it('removes every cap for pro', () => {
    const state = stateWith(Array.from({ length: 30 }, (_, index) => ({ ...base, id: `r${index}`, recurrence: 'daily' as const })), {
      entitlement: { isPro: true, plan: 'yearly' },
    });
    expect(canAdd(state, 'reminder').allowed).toBe(true);
    expect(canAdd(state, 'pet').allowed).toBe(true);
    expect(canAdd(state, 'expense').allowed).toBe(true);
  });

  it('treats an expired trial as free again', () => {
    const expired = stateWith([], { entitlement: { isPro: true, plan: 'yearly', trialEndsOn: '2000-01-01' } });
    expect(canAdd(expired, 'expense').allowed).toBe(false);
  });
});

describe('gamification', () => {
  it('derives XP from care that still exists, so it cannot be farmed', () => {
    const done = stateWith([{ ...base, recurrence: 'daily', completionDates: [today] }]);
    const undone = stateWith([{ ...base, recurrence: 'daily', completionDates: [] }]);
    expect(derivedXp(done, today)).toBeGreaterThan(derivedXp(undone, today));
    // Toggling back to incomplete returns exactly the original amount.
    expect(derivedXp(undone, today)).toBe(0);
  });

  it('adds the bonus ledger on top of derived XP', () => {
    const state = stateWith([], { game: { ...emptyState().game, xp: 250 } });
    expect(totalXp(state, today)).toBe(250);
  });

  it('grows levels monotonically and never divides by zero', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(0).percent).toBeGreaterThanOrEqual(0);
    expect(levelFromXp(100000).maxed).toBe(true);
    expect(levelFromXp(500).level).toBeGreaterThan(levelFromXp(100).level);
  });

  it('caps the streak multiplier at 2x', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(7)).toBe(1.5);
    expect(streakMultiplier(400)).toBe(2);
  });

  it('gives the same three quests for a given day', () => {
    expect(questsForDate(today).map(quest => quest.id)).toEqual(questsForDate(today).map(quest => quest.id));
    expect(questsForDate(today)).toHaveLength(3);
  });

  it('marks a quest done once the underlying care happened', () => {
    const state = stateWith([
      { ...base, id: 'a', recurrence: 'daily', completionDates: [today] },
      { ...base, id: 'b', recurrence: 'daily', completionDates: [today] },
      { ...base, id: 'c', recurrence: 'daily', completionDates: [today] },
    ]);
    const quests = questStatuses(state, today);
    const perfect = quests.find(quest => quest.id === 'perfect-day');
    if (perfect) expect(perfect.done).toBe(true);
    expect(quests.every(quest => quest.value <= quest.target)).toBe(true);
  });

  it('scores an empty day at zero and a perfect day highly', () => {
    expect(careScore(stateWith([]), today)).toBe(0);
    const perfect = stateWith([{ ...base, recurrence: 'daily', completionDates: [today] }]);
    expect(careScore(perfect, today)).toBeGreaterThanOrEqual(80);
  });

  it('counts perfect days for the weekly challenge', () => {
    const history = Array.from({ length: 7 }, (_, index) => shiftDate(today, -index));
    const state = stateWith([{ ...base, recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: history }]);
    expect(weeklyChallenge(state, today).done).toBe(true);
  });
});

describe('insights', () => {
  it('flags the habit that keeps slipping', () => {
    const good: CareReminder = {
      ...base,
      id: 'good',
      recurrence: 'daily',
      startDate: shiftDate(today, -30),
      completionDates: Array.from({ length: 14 }, (_, index) => shiftDate(today, -index)),
    };
    const bad: CareReminder = { ...base, id: 'bad', title: 'Evening walk', recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: [] };
    expect(weakestHabit([good, bad], 'pet', 14, today)?.reminder.id).toBe('bad');
  });

  it('breaks completions down by category', () => {
    const reminders: CareReminder[] = [
      { ...base, id: 'a', category: 'Food', recurrence: 'daily', completionDates: [today, shiftDate(today, -1)] },
      { ...base, id: 'b', category: 'Walk', recurrence: 'daily', completionDates: [today] },
    ];
    expect(categoryBreakdown(reminders, 'pet', 30, today)).toEqual([
      { category: 'Food', count: 2 },
      { category: 'Walk', count: 1 },
    ]);
  });

  it('tracks weight direction and converts units', () => {
    const trend = weightTrend(
      [
        { id: '1', petId: 'pet', date: shiftDate(today, -30), kg: 8 },
        { id: '2', petId: 'pet', date: today, kg: 9 },
      ],
      'pet',
    );
    expect(trend.direction).toBe('up');
    expect(trend.changeKg).toBe(1);
    expect(formatWeight(1, 'lb')).toBe('2.2 lb');
    expect(fromDisplayWeight(2.2046226218, 'lb')).toBeCloseTo(1);
  });

  it('surfaces overdue and upcoming vaccinations', () => {
    const shots = [
      { id: '1', petId: 'pet', name: 'Rabies', givenDate: shiftDate(today, -365), dueDate: shiftDate(today, -5) },
      { id: '2', petId: 'pet', name: 'Lepto', givenDate: today, dueDate: shiftDate(today, 20) },
    ];
    const due = upcomingVaccinations(shots, 'pet', 60, today);
    expect(due.map(entry => entry.shot.name)).toEqual(['Rabies', 'Lepto']);
    expect(due[0].inDays).toBe(-5);
  });

  it('describes age and counts down to a birthday', () => {
    expect(describeAge(undefined)).toBeUndefined();
    expect(daysUntilBirthday(shiftDate(today, -364), today)).toBe(1);
  });
});

describe('suggestions', () => {
  it('nudges a new owner toward the first weigh-in and moment', () => {
    const tips = tipsFor(stateWith([]), today);
    expect(tips.some(tip => tip.id === 'first-weight')).toBe(true);
    expect(tips.some(tip => tip.id === 'first-moment')).toBe(true);
  });

  it('respects dismissals', () => {
    const state = stateWith([], { settings: { ...emptyState().settings, onboarded: true, tipsDismissed: ['first-weight'] } });
    expect(tipsFor(state, today).some(tip => tip.id === 'first-weight')).toBe(false);
  });

  it('celebrates a completed day first', () => {
    const state = stateWith([{ ...base, recurrence: 'daily', completionDates: [today] }]);
    expect(tipsFor(state, today)[0].id).toBe(`perfect-${today}`);
  });
});

describe('storage migration', () => {
  it('fills in everything a v1 payload never had', () => {
    const legacy = {
      pets: [{ id: 'pet', name: 'Mochi', kind: 'Shiba', emoji: '🐕', color: '#F5A66D', createdAt: today }],
      reminders: [{ ...base, recurrence: 'daily' as const }],
      moments: [],
      selectedPetId: 'pet',
    };
    const state = hydrate(legacy as never);
    expect(state.pets[0].species).toBe('Other');
    expect(state.weights).toEqual([]);
    expect(state.game.streakFreezes).toBe(1);
    // An existing v1 user has already set up their pet, so they skip onboarding.
    expect(state.settings.onboarded).toBe(true);
  });

  it('drops a selected pet id that no longer exists', () => {
    expect(hydrate({ pets: [], selectedPetId: 'ghost' }).selectedPetId).toBe('');
  });

  it('round-trips an export', () => {
    const state = stateWith([{ ...base, recurrence: 'daily' }]);
    const restored = importState(JSON.stringify({ app: 'Pawday', version: 2, state }));
    expect(restored?.reminders).toHaveLength(1);
    expect(importState('not json')).toBeNull();
  });
});
