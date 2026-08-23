/**
 * Pawday domain model.
 *
 * Everything is local-first and date-keyed as `YYYY-MM-DD` in the device's own
 * timezone, so a "day" always means the day the owner actually lived.
 */

import { DEFAULT_THEME_ID, ThemeId } from './theme';

export type Category = 'Food' | 'Medication' | 'Walk' | 'Play' | 'Grooming' | 'Training' | 'Potty' | 'Other';
export type Recurrence = 'once' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type Species = 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Small pet' | 'Reptile' | 'Fish' | 'Other';
export type WeightUnit = 'kg' | 'lb';
export type Mood = 'happy' | 'sleepy' | 'playful' | 'cuddly' | 'grumpy' | 'poorly';

export type Pet = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  emoji: string;
  color: string;
  photoUri?: string;
  birthday?: string;
  gender?: 'boy' | 'girl' | 'unspecified';
  microchipId?: string;
  vetName?: string;
  vetPhone?: string;
  notes?: string;
  createdAt: string;
};

export type CareReminder = {
  id: string;
  petId: string;
  title: string;
  category: Category;
  time: string;
  durationMinutes?: number;
  recurrence: Recurrence;
  startDate: string;
  completionDates: string[];
  paused?: boolean;
  notes?: string;
  notificationId?: string;
};

export type JournalMoment = {
  id: string;
  petId: string;
  title: string;
  note: string;
  date: string;
  mood?: Mood;
  photoUri?: string;
  createdAt: string;
};

/** Weight is always stored in kg; the unit preference is display-only. */
export type WeightEntry = { id: string; petId: string; date: string; kg: number; note?: string };

export type Vaccination = {
  id: string;
  petId: string;
  name: string;
  givenDate: string;
  dueDate?: string;
  vetName?: string;
  notes?: string;
};

export type VetVisit = {
  id: string;
  petId: string;
  date: string;
  reason: string;
  diagnosis?: string;
  cost?: number;
  notes?: string;
};

export type SymptomLog = {
  id: string;
  petId: string;
  date: string;
  symptom: string;
  severity: 1 | 2 | 3;
  notes?: string;
};

export type ExpenseCategory = 'Food' | 'Vet' | 'Medication' | 'Grooming' | 'Toys' | 'Insurance' | 'Other';

export type Expense = {
  id: string;
  petId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
};

export type Settings = {
  themeId: ThemeId;
  weightUnit: WeightUnit;
  currency: string;
  onboarded: boolean;
  tipsDismissed: string[];
  coachMarksSeen: string[];
  installedAt: string;
};

export type ProPlan = 'monthly' | 'yearly' | 'lifetime';

export type Entitlement = {
  isPro: boolean;
  plan?: ProPlan;
  since?: string;
  /** Set when the user is inside a free trial rather than a paid period. */
  trialEndsOn?: string;
};

/**
 * Everything the game layer needs that cannot be re-derived from care history:
 * spendable currency, quest claim receipts, and the collectibles album.
 */
export type GameState = {
  xp: number;
  coins: number;
  streakFreezes: number;
  /** Last day the owner opened the app, for the daily check-in bonus. */
  lastCheckIn: string;
  checkInStreak: number;
  /** Quest set is regenerated when this no longer matches today. */
  questDate: string;
  claimedQuests: string[];
  claimedWeeks: string[];
  unlockedStickers: string[];
  seenAwards: string[];
  /** Days rescued with a streak freeze, treated as complete by the streak rule. */
  frozenDates: string[];
};

export type PawdayState = {
  pets: Pet[];
  reminders: CareReminder[];
  moments: JournalMoment[];
  weights: WeightEntry[];
  vaccinations: Vaccination[];
  visits: VetVisit[];
  symptoms: SymptomLog[];
  expenses: Expense[];
  settings: Settings;
  entitlement: Entitlement;
  game: GameState;
  selectedPetId: string;
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: 'restaurant-outline',
  Medication: 'medical-outline',
  Walk: 'paw-outline',
  Play: 'tennisball-outline',
  Grooming: 'water-outline',
  Training: 'school-outline',
  Potty: 'leaf-outline',
  Other: 'sparkles-outline',
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '\u{1F372}',
  Medication: '\u{1F48A}',
  Walk: '\u{1F9AE}',
  Play: '\u{1F3BE}',
  Grooming: '\u{1F6C1}',
  Training: '\u{1F393}',
  Potty: '\u{1F331}',
  Other: '\u{2728}',
};

export const CATEGORIES: Category[] = ['Food', 'Medication', 'Walk', 'Play', 'Grooming', 'Training', 'Potty', 'Other'];
export const RECURRENCES: Recurrence[] = ['once', 'daily', 'weekdays', 'weekly', 'monthly'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Food', 'Vet', 'Medication', 'Grooming', 'Toys', 'Insurance', 'Other'];

export const SPECIES: { species: Species; emoji: string; color: string }[] = [
  { species: 'Dog', emoji: '\u{1F415}', color: '#F5A66D' },
  { species: 'Cat', emoji: '\u{1F408}', color: '#91B89B' },
  { species: 'Rabbit', emoji: '\u{1F430}', color: '#E7A9BD' },
  { species: 'Bird', emoji: '\u{1F99C}', color: '#8FBBEF' },
  { species: 'Small pet', emoji: '\u{1F439}', color: '#E3C077' },
  { species: 'Reptile', emoji: '\u{1F98E}', color: '#9CC98A' },
  { species: 'Fish', emoji: '\u{1F420}', color: '#7FC7D9' },
  { species: 'Other', emoji: '\u{1F43E}', color: '#BCA9E4' },
];

export const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'happy', emoji: '\u{1F60A}', label: 'Happy' },
  { mood: 'playful', emoji: '\u{1F938}', label: 'Playful' },
  { mood: 'cuddly', emoji: '\u{1F970}', label: 'Cuddly' },
  { mood: 'sleepy', emoji: '\u{1F634}', label: 'Sleepy' },
  { mood: 'grumpy', emoji: '\u{1F63E}', label: 'Grumpy' },
  { mood: 'poorly', emoji: '\u{1F912}', label: 'Not well' },
];

/* ------------------------------------------------------------------ dates */

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDate(key: string, days: number): string {
  const value = dateFromKey(key);
  value.setDate(value.getDate() + days);
  return dateKey(value);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dateFromKey(to).getTime() - dateFromKey(from).getTime()) / 86400000);
}

export function formatDate(key: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return dateFromKey(key).toLocaleDateString(undefined, options);
}

export function formatRecurrence(value: Recurrence): string {
  return { once: 'Does not repeat', daily: 'Every day', weekdays: 'Weekdays', weekly: 'Every week', monthly: 'Every month' }[value];
}

export function formatTime(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** "2 yrs 3 mos" from a birthday, or undefined when the birthday is unknown. */
export function describeAge(birthday?: string): string | undefined {
  if (!birthday) return undefined;
  const born = dateFromKey(birthday);
  const now = new Date();
  let months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  if (months < 0) return undefined;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} mo${rest === 1 ? '' : 's'}`;
  if (!rest) return `${years} yr${years === 1 ? '' : 's'}`;
  return `${years} yr${years === 1 ? '' : 's'} ${rest} mo${rest === 1 ? '' : 's'}`;
}

/** Days until the pet's next birthday, or undefined when unknown. */
export function daysUntilBirthday(birthday?: string, from = dateKey()): number | undefined {
  if (!birthday) return undefined;
  const born = dateFromKey(birthday);
  const today = dateFromKey(from);
  const next = new Date(today.getFullYear(), born.getMonth(), born.getDate());
  if (dateKey(next) < from) next.setFullYear(next.getFullYear() + 1);
  return daysBetween(from, dateKey(next));
}

/* -------------------------------------------------------------- reminders */

export function reminderOccursOn(reminder: CareReminder, key: string): boolean {
  if (reminder.paused || key < reminder.startDate) return false;
  if (reminder.recurrence === 'once') return key === reminder.startDate;
  const date = dateFromKey(key);
  const start = dateFromKey(reminder.startDate);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  if (reminder.recurrence === 'daily') return true;
  if (reminder.recurrence === 'weekdays') return date.getDay() > 0 && date.getDay() < 6;
  if (reminder.recurrence === 'weekly') return days % 7 === 0;
  return date.getDate() === start.getDate();
}

export function remindersForDate(reminders: CareReminder[], petId: string, key: string): CareReminder[] {
  return reminders
    .filter(reminder => reminder.petId === petId && reminderOccursOn(reminder, key))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function isCompleted(reminder: CareReminder, key: string): boolean {
  return reminder.completionDates.includes(key);
}

export function toggleCompletion(reminder: CareReminder, key: string): CareReminder {
  const completionDates = isCompleted(reminder, key)
    ? reminder.completionDates.filter(value => value !== key)
    : [...reminder.completionDates, key];
  return { ...reminder, completionDates };
}

export function progressForDate(reminders: CareReminder[], petId: string, key: string) {
  const tasks = remindersForDate(reminders, petId, key);
  const completed = tasks.filter(task => isCompleted(task, key)).length;
  return { completed, total: tasks.length, percent: tasks.length ? completed / tasks.length : 0 };
}

/** The next not-yet-done task today, used for the "up next" nudge on Home. */
export function nextUpTask(reminders: CareReminder[], petId: string, key: string, now = new Date()): CareReminder | undefined {
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const open = remindersForDate(reminders, petId, key).filter(task => !isCompleted(task, key));
  return open.find(task => task.time >= clock) ?? open[0];
}

/**
 * Consecutive fully-completed days. Days with nothing scheduled are skipped
 * rather than breaking the chain, and days rescued by a streak freeze count as
 * complete.
 */
export function calculateStreak(reminders: CareReminder[], petId: string, from = dateKey(), frozenDates: string[] = []): number {
  let streak = 0;
  let key = from;
  let checkedDays = 0;
  while (checkedDays < 366) {
    const tasks = remindersForDate(reminders, petId, key);
    if (tasks.length === 0) {
      key = shiftDate(key, -1);
      checkedDays += 1;
      continue;
    }
    if (frozenDates.includes(key) || tasks.every(task => isCompleted(task, key))) {
      streak += 1;
      key = shiftDate(key, -1);
      checkedDays += 1;
      continue;
    }
    break;
  }
  return streak;
}

export function calculatePoints(reminders: CareReminder[], moments: JournalMoment[], petId: string): number {
  const completed = reminders
    .filter(reminder => reminder.petId === petId)
    .reduce((sum, reminder) => sum + reminder.completionDates.length, 0);
  const memories = moments.filter(moment => moment.petId === petId).length;
  return completed * 10 + memories * 5;
}

/* --------------------------------------------------------------- insights */

/** Completion percentage per day over the trailing `days` window, oldest first. */
export function completionTrend(reminders: CareReminder[], petId: string, days: number, from = dateKey()) {
  return Array.from({ length: days }, (_, index) => {
    const key = shiftDate(from, index - days + 1);
    const { percent, total } = progressForDate(reminders, petId, key);
    return { key, percent, total };
  });
}

export function categoryBreakdown(reminders: CareReminder[], petId: string, days: number, from = dateKey()) {
  const since = shiftDate(from, -days + 1);
  const totals = new Map<Category, number>();
  reminders
    .filter(reminder => reminder.petId === petId)
    .forEach(reminder => {
      const count = reminder.completionDates.filter(key => key >= since && key <= from).length;
      if (count) totals.set(reminder.category, (totals.get(reminder.category) ?? 0) + count);
    });
  return [...totals.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

/** Which reminder is slipping most often — the honest "needs attention" signal. */
export function weakestHabit(reminders: CareReminder[], petId: string, days = 14, from = dateKey()) {
  const scored = reminders
    .filter(reminder => reminder.petId === petId && !reminder.paused)
    .map(reminder => {
      let due = 0;
      let done = 0;
      for (let index = 0; index < days; index += 1) {
        const key = shiftDate(from, -index);
        if (!reminderOccursOn(reminder, key)) continue;
        due += 1;
        if (isCompleted(reminder, key)) done += 1;
      }
      return { reminder, due, rate: due ? done / due : 1 };
    })
    .filter(entry => entry.due >= 3 && entry.rate < 0.7);
  return scored.sort((a, b) => a.rate - b.rate)[0];
}

export function weightTrend(weights: WeightEntry[], petId: string) {
  const entries = weights.filter(entry => entry.petId === petId).sort((a, b) => a.date.localeCompare(b.date));
  if (entries.length < 2) return { entries, changeKg: 0, direction: 'flat' as const };
  const changeKg = entries[entries.length - 1].kg - entries[0].kg;
  const direction = Math.abs(changeKg) < 0.05 ? ('flat' as const) : changeKg > 0 ? ('up' as const) : ('down' as const);
  return { entries, changeKg, direction };
}

export function upcomingVaccinations(vaccinations: Vaccination[], petId: string, withinDays = 60, from = dateKey()) {
  return vaccinations
    .filter(shot => shot.petId === petId && shot.dueDate)
    .map(shot => ({ shot, inDays: daysBetween(from, shot.dueDate as string) }))
    .filter(entry => entry.inDays <= withinDays)
    .sort((a, b) => a.inDays - b.inDays);
}

export function expenseSummary(expenses: Expense[], petId: string, days = 30, from = dateKey()) {
  const since = shiftDate(from, -days + 1);
  const scoped = expenses.filter(item => item.petId === petId && item.date >= since && item.date <= from);
  const total = scoped.reduce((sum, item) => sum + item.amount, 0);
  const byCategory = new Map<ExpenseCategory, number>();
  scoped.forEach(item => byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + item.amount));
  return {
    total,
    count: scoped.length,
    byCategory: [...byCategory.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
  };
}

/* ---------------------------------------------------------------- factory */

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultSettings(now = new Date()): Settings {
  return {
    themeId: DEFAULT_THEME_ID,
    weightUnit: 'kg',
    currency: '$',
    onboarded: false,
    tipsDismissed: [],
    coachMarksSeen: [],
    installedAt: now.toISOString(),
  };
}

export function defaultGame(): GameState {
  return {
    xp: 0,
    coins: 0,
    streakFreezes: 1,
    lastCheckIn: '',
    checkInStreak: 0,
    questDate: '',
    claimedQuests: [],
    claimedWeeks: [],
    unlockedStickers: [],
    seenAwards: [],
    frozenDates: [],
  };
}

/**
 * A brand new install: no pets, no demo reminders, no fake memories. Onboarding
 * fills this in with the owner's own pet.
 */
export function emptyState(now = new Date()): PawdayState {
  return {
    pets: [],
    reminders: [],
    moments: [],
    weights: [],
    vaccinations: [],
    visits: [],
    symptoms: [],
    expenses: [],
    settings: defaultSettings(now),
    entitlement: { isPro: false },
    game: defaultGame(),
    selectedPetId: '',
  };
}

export function newPet(input: Partial<Pet> & Pick<Pet, 'name' | 'species'>): Pet {
  const preset = SPECIES.find(item => item.species === input.species) ?? SPECIES[SPECIES.length - 1];
  return {
    breed: '',
    emoji: preset.emoji,
    color: preset.color,
    gender: 'unspecified',
    ...input,
    id: id('pet'),
    createdAt: new Date().toISOString(),
  };
}

export function newReminder(input: Omit<CareReminder, 'id' | 'completionDates'>): CareReminder {
  return { ...input, id: id('reminder'), completionDates: [] };
}

export function newMoment(input: Omit<JournalMoment, 'id' | 'createdAt'>): JournalMoment {
  return { ...input, id: id('moment'), createdAt: new Date().toISOString() };
}

export function newWeight(input: Omit<WeightEntry, 'id'>): WeightEntry {
  return { ...input, id: id('weight') };
}

export function newVaccination(input: Omit<Vaccination, 'id'>): Vaccination {
  return { ...input, id: id('vax') };
}

export function newVisit(input: Omit<VetVisit, 'id'>): VetVisit {
  return { ...input, id: id('visit') };
}

export function newSymptom(input: Omit<SymptomLog, 'id'>): SymptomLog {
  return { ...input, id: id('symptom') };
}

export function newExpense(input: Omit<Expense, 'id'>): Expense {
  return { ...input, id: id('expense') };
}

/* ------------------------------------------------------------------ units */

export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg * 2.2046226218;
}

export function fromDisplayWeight(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value / 2.2046226218;
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${toDisplayWeight(kg, unit).toFixed(1)} ${unit}`;
}
