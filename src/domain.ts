export type Category = 'Food' | 'Medication' | 'Walk' | 'Play' | 'Grooming' | 'Training' | 'Other';
export type Recurrence = 'once' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type Pet = {
  id: string;
  name: string;
  kind: string;
  emoji: string;
  color: string;
  photoUri?: string;
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
  notificationId?: string;
};

export type JournalMoment = {
  id: string;
  petId: string;
  title: string;
  note: string;
  date: string;
  photoUri?: string;
  createdAt: string;
};

export type PawdayState = {
  pets: Pet[];
  reminders: CareReminder[];
  moments: JournalMoment[];
  selectedPetId: string;
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: 'restaurant-outline',
  Medication: 'medical-outline',
  Walk: 'paw-outline',
  Play: 'tennisball-outline',
  Grooming: 'water-outline',
  Training: 'school-outline',
  Other: 'sparkles-outline',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#F7B879',
  Medication: '#92C4A0',
  Walk: '#8CB7D8',
  Play: '#D7A6C5',
  Grooming: '#A9B9DC',
  Training: '#D4A879',
  Other: '#A9B6A1',
};

export const CATEGORIES: Category[] = ['Food', 'Medication', 'Walk', 'Play', 'Grooming', 'Training', 'Other'];
export const RECURRENCES: Recurrence[] = ['once', 'daily', 'weekdays', 'weekly', 'monthly'];

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

export function formatDate(key: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return dateFromKey(key).toLocaleDateString(undefined, options);
}

export function formatRecurrence(value: Recurrence): string {
  return { once: 'Does not repeat', daily: 'Every day', weekdays: 'Weekdays', weekly: 'Every week', monthly: 'Every month' }[value];
}

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
  return reminders.filter(reminder => reminder.petId === petId && reminderOccursOn(reminder, key)).sort((a, b) => a.time.localeCompare(b.time));
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

export function calculateStreak(reminders: CareReminder[], petId: string, from = dateKey()): number {
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
    if (tasks.every(task => isCompleted(task, key))) {
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

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function seedState(now = new Date()): PawdayState {
  const today = dateKey(now);
  const mochi = 'pet-mochi';
  const bean = 'pet-bean';
  const history = Array.from({ length: 7 }, (_, index) => shiftDate(today, -index));
  const reminders: CareReminder[] = [
    { id: 'meal', petId: mochi, title: 'Breakfast', category: 'Food', time: '08:00', recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: history },
    { id: 'vitamin', petId: mochi, title: 'Daily vitamin', category: 'Medication', time: '09:30', recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: history.slice(0, 6) },
    { id: 'walk', petId: mochi, title: 'Park walk', category: 'Walk', time: '17:30', durationMinutes: 30, recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: history },
    { id: 'play', petId: mochi, title: 'Play time', category: 'Play', time: '19:00', durationMinutes: 15, recurrence: 'daily', startDate: shiftDate(today, -30), completionDates: history },
    { id: 'bean-meal', petId: bean, title: 'Dinner', category: 'Food', time: '18:00', recurrence: 'daily', startDate: shiftDate(today, -10), completionDates: [today] },
  ];
  return {
    pets: [
      { id: mochi, name: 'Mochi', kind: 'Shiba · 3 yrs', emoji: '🐕', color: '#F5A66D', createdAt: now.toISOString() },
      { id: bean, name: 'Bean', kind: 'Tabby · 1 yr', emoji: '🐈', color: '#91B89B', createdAt: now.toISOString() },
    ],
    reminders,
    moments: [
      { id: 'beach', petId: mochi, title: 'Best beach day!', date: shiftDate(today, -7), note: 'Mochi finally chased the waves.', createdAt: now.toISOString() },
      { id: 'snooze', petId: mochi, title: 'Sunday snooze', date: shiftDate(today, -11), note: 'Found the sunniest spot in the house.', createdAt: now.toISOString() },
      { id: 'toy', petId: mochi, title: 'New favorite toy', date: shiftDate(today, -21), note: 'The squeaky avocado is a winner!', createdAt: now.toISOString() },
    ],
    selectedPetId: mochi,
  };
}

export function newPet(input: Pick<Pet, 'name' | 'kind' | 'emoji' | 'color' | 'photoUri'>): Pet {
  return { ...input, id: id('pet'), createdAt: new Date().toISOString() };
}

export function newReminder(input: Omit<CareReminder, 'id' | 'completionDates'>): CareReminder {
  return { ...input, id: id('reminder'), completionDates: [] };
}

export function newMoment(input: Omit<JournalMoment, 'id' | 'createdAt'>): JournalMoment {
  return { ...input, id: id('moment'), createdAt: new Date().toISOString() };
}
