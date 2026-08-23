/**
 * Suggestions replace demo data.
 *
 * A new owner used to land in someone else's pretend life. Instead they now get
 * a species-shaped starter routine they can accept or edit, plus tips that are
 * derived from their real data as it fills in.
 */

import {
  CareReminder,
  Category,
  PawdayState,
  Recurrence,
  Species,
  dateKey,
  daysUntilBirthday,
  remindersForDate,
  upcomingVaccinations,
  weakestHabit,
} from './domain';
import { isPro } from './pro';

export type StarterTask = {
  id: string;
  title: string;
  category: Category;
  time: string;
  recurrence: Recurrence;
  durationMinutes?: number;
  /** Pre-ticked in onboarding — the tasks nearly every owner of this species needs. */
  recommended: boolean;
};

const COMMON: StarterTask[] = [
  { id: 'breakfast', title: 'Breakfast', category: 'Food', time: '08:00', recurrence: 'daily', recommended: true },
  { id: 'dinner', title: 'Dinner', category: 'Food', time: '18:00', recurrence: 'daily', recommended: true },
  { id: 'fresh-water', title: 'Fresh water', category: 'Other', time: '09:00', recurrence: 'daily', recommended: true },
];

const PACKS: Record<Species, StarterTask[]> = {
  Dog: [
    ...COMMON,
    { id: 'morning-walk', title: 'Morning walk', category: 'Walk', time: '07:30', recurrence: 'daily', durationMinutes: 20, recommended: true },
    { id: 'evening-walk', title: 'Evening walk', category: 'Walk', time: '17:30', recurrence: 'daily', durationMinutes: 30, recommended: true },
    { id: 'play', title: 'Play time', category: 'Play', time: '19:30', recurrence: 'daily', durationMinutes: 15, recommended: false },
    { id: 'training', title: 'Training practice', category: 'Training', time: '11:00', recurrence: 'weekdays', durationMinutes: 10, recommended: false },
    { id: 'brush', title: 'Brush coat', category: 'Grooming', time: '20:00', recurrence: 'weekly', recommended: false },
    { id: 'flea', title: 'Flea & tick treatment', category: 'Medication', time: '09:00', recurrence: 'monthly', recommended: false },
  ],
  Cat: [
    ...COMMON,
    { id: 'litter', title: 'Scoop litter tray', category: 'Potty', time: '08:30', recurrence: 'daily', recommended: true },
    { id: 'play', title: 'Wand play session', category: 'Play', time: '20:00', recurrence: 'daily', durationMinutes: 15, recommended: true },
    { id: 'brush', title: 'Brush coat', category: 'Grooming', time: '19:00', recurrence: 'weekly', recommended: false },
    { id: 'litter-deep', title: 'Deep clean litter tray', category: 'Grooming', time: '10:00', recurrence: 'weekly', recommended: false },
    { id: 'worm', title: 'Worming treatment', category: 'Medication', time: '09:00', recurrence: 'monthly', recommended: false },
  ],
  Rabbit: [
    { id: 'hay', title: 'Top up hay', category: 'Food', time: '08:00', recurrence: 'daily', recommended: true },
    { id: 'greens', title: 'Fresh greens', category: 'Food', time: '17:00', recurrence: 'daily', recommended: true },
    { id: 'fresh-water', title: 'Fresh water', category: 'Other', time: '08:10', recurrence: 'daily', recommended: true },
    { id: 'run', title: 'Run-around time', category: 'Play', time: '18:30', recurrence: 'daily', durationMinutes: 30, recommended: true },
    { id: 'litter', title: 'Clean litter corner', category: 'Potty', time: '09:00', recurrence: 'daily', recommended: false },
    { id: 'nails', title: 'Check nails & teeth', category: 'Grooming', time: '11:00', recurrence: 'monthly', recommended: false },
  ],
  Bird: [
    { id: 'seed', title: 'Fresh food', category: 'Food', time: '08:00', recurrence: 'daily', recommended: true },
    { id: 'fresh-water', title: 'Fresh water', category: 'Other', time: '08:05', recurrence: 'daily', recommended: true },
    { id: 'out-time', title: 'Out-of-cage time', category: 'Play', time: '17:00', recurrence: 'daily', durationMinutes: 30, recommended: true },
    { id: 'cage', title: 'Clean cage liner', category: 'Grooming', time: '10:00', recurrence: 'daily', recommended: false },
    { id: 'deep-clean', title: 'Deep clean cage', category: 'Grooming', time: '10:00', recurrence: 'weekly', recommended: false },
  ],
  'Small pet': [
    { id: 'food', title: 'Fresh food', category: 'Food', time: '08:00', recurrence: 'daily', recommended: true },
    { id: 'fresh-water', title: 'Fresh water', category: 'Other', time: '08:05', recurrence: 'daily', recommended: true },
    { id: 'spot-clean', title: 'Spot clean bedding', category: 'Grooming', time: '18:00', recurrence: 'daily', recommended: true },
    { id: 'handle', title: 'Handling & play', category: 'Play', time: '19:00', recurrence: 'daily', durationMinutes: 15, recommended: false },
    { id: 'full-clean', title: 'Full cage clean', category: 'Grooming', time: '11:00', recurrence: 'weekly', recommended: false },
  ],
  Reptile: [
    { id: 'feed', title: 'Feeding', category: 'Food', time: '17:00', recurrence: 'weekly', recommended: true },
    { id: 'mist', title: 'Mist enclosure', category: 'Other', time: '09:00', recurrence: 'daily', recommended: true },
    { id: 'temps', title: 'Check heat & humidity', category: 'Other', time: '08:30', recurrence: 'daily', recommended: true },
    { id: 'spot-clean', title: 'Spot clean substrate', category: 'Grooming', time: '18:00', recurrence: 'daily', recommended: false },
    { id: 'uvb', title: 'Replace UVB bulb', category: 'Other', time: '12:00', recurrence: 'monthly', recommended: false },
  ],
  Fish: [
    { id: 'feed', title: 'Feed fish', category: 'Food', time: '09:00', recurrence: 'daily', recommended: true },
    { id: 'check', title: 'Check temperature', category: 'Other', time: '09:05', recurrence: 'daily', recommended: true },
    { id: 'water-test', title: 'Test water quality', category: 'Other', time: '11:00', recurrence: 'weekly', recommended: true },
    { id: 'water-change', title: 'Partial water change', category: 'Grooming', time: '11:30', recurrence: 'weekly', recommended: false },
    { id: 'filter', title: 'Clean filter', category: 'Grooming', time: '12:00', recurrence: 'monthly', recommended: false },
  ],
  Other: [
    ...COMMON,
    { id: 'clean', title: 'Clean living space', category: 'Grooming', time: '18:00', recurrence: 'daily', recommended: false },
    { id: 'checkup', title: 'Wellness check', category: 'Other', time: '11:00', recurrence: 'weekly', recommended: false },
  ],
};

export function starterPack(species: Species): StarterTask[] {
  return PACKS[species] ?? PACKS.Other;
}

/** Extra ideas offered on the Schedule tab once the starter pack is in place. */
export function moreIdeas(species: Species, existing: CareReminder[]): StarterTask[] {
  const titles = new Set(existing.map(reminder => reminder.title.toLowerCase()));
  return starterPack(species).filter(task => !titles.has(task.title.toLowerCase()));
}

/* ------------------------------------------------------------------ tips */

export type Tip = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  action?: { label: string; target: 'schedule' | 'journal' | 'health' | 'profile' | 'paywall' };
  tone: 'info' | 'warn' | 'cheer';
};

/**
 * Contextual nudges built from the owner's real data. Ordered by usefulness and
 * filtered against anything they have dismissed.
 */
export function tipsFor(state: PawdayState, today = dateKey()): Tip[] {
  const pet = state.pets.find(item => item.id === state.selectedPetId);
  if (!pet) return [];
  const tips: Tip[] = [];
  const petReminders = state.reminders.filter(reminder => reminder.petId === pet.id);

  const dueShots = upcomingVaccinations(state.vaccinations, pet.id, 30, today);
  const overdue = dueShots.filter(entry => entry.inDays < 0);
  if (overdue.length) {
    tips.push({
      id: 'vax-overdue',
      emoji: '\u{1F6A8}',
      title: `${overdue[0].shot.name} is overdue`,
      body: `It was due ${Math.abs(overdue[0].inDays)} day${Math.abs(overdue[0].inDays) === 1 ? '' : 's'} ago. Worth a call to the vet.`,
      action: { label: 'Open health', target: 'health' },
      tone: 'warn',
    });
  } else if (dueShots.length) {
    tips.push({
      id: `vax-soon-${dueShots[0].shot.id}`,
      emoji: '\u{1F489}',
      title: `${dueShots[0].shot.name} due in ${dueShots[0].inDays} days`,
      body: 'Book it in now so it does not sneak up on you.',
      action: { label: 'Open health', target: 'health' },
      tone: 'info',
    });
  }

  const birthdayIn = daysUntilBirthday(pet.birthday, today);
  if (birthdayIn !== undefined && birthdayIn <= 14) {
    tips.push({
      id: 'birthday',
      emoji: '\u{1F382}',
      title: birthdayIn === 0 ? `Happy birthday ${pet.name}!` : `${pet.name}'s birthday is in ${birthdayIn} days`,
      body: birthdayIn === 0 ? 'Save a photo of the big day in the scrapbook.' : 'Time to plan something small and silly.',
      action: { label: 'Add a moment', target: 'journal' },
      tone: 'cheer',
    });
  }

  if (!petReminders.length) {
    tips.push({
      id: 'no-reminders',
      emoji: '\u{2728}',
      title: 'Build the daily routine',
      body: `Pick a few suggested tasks for ${pet.name} and Pawday will keep the rhythm.`,
      action: { label: 'Add tasks', target: 'schedule' },
      tone: 'info',
    });
  }

  const slipping = weakestHabit(state.reminders, pet.id, 14, today);
  if (slipping) {
    tips.push({
      id: `slipping-${slipping.reminder.id}`,
      emoji: '\u{1F440}',
      title: `${slipping.reminder.title} keeps slipping`,
      body: `Only ${Math.round(slipping.rate * 100)}% done this fortnight. Try moving it to a time that suits you better.`,
      action: { label: 'Adjust it', target: 'schedule' },
      tone: 'warn',
    });
  }

  if (!state.weights.some(entry => entry.petId === pet.id)) {
    tips.push({
      id: 'first-weight',
      emoji: '\u{2696}',
      title: 'Record a starting weight',
      body: 'One number today makes every future change obvious.',
      action: { label: 'Log weight', target: 'health' },
      tone: 'info',
    });
  }

  if (!pet.birthday) {
    tips.push({
      id: 'add-birthday',
      emoji: '\u{1F381}',
      title: `When is ${pet.name}'s birthday?`,
      body: 'Add it and Pawday will remind you before it comes around.',
      action: { label: 'Edit profile', target: 'profile' },
      tone: 'info',
    });
  }

  if (!state.moments.some(moment => moment.petId === pet.id)) {
    tips.push({
      id: 'first-moment',
      emoji: '\u{1F4F8}',
      title: 'Start the scrapbook',
      body: 'One photo today is a memory you will reread for years.',
      action: { label: 'Add a moment', target: 'journal' },
      tone: 'cheer',
    });
  }

  if (!pet.vetName) {
    tips.push({
      id: 'add-vet',
      emoji: '\u{1F3E5}',
      title: 'Save your vet details',
      body: 'Handy when you need them fast, and it fills the sitter care card.',
      action: { label: 'Edit profile', target: 'profile' },
      tone: 'info',
    });
  }

  if (!isPro(state.entitlement) && petReminders.length >= 4) {
    tips.push({
      id: 'pro-nudge',
      emoji: '\u{1F31F}',
      title: 'You are the routine type',
      body: 'Pro adds the health vault, insights and every theme pack.',
      action: { label: 'See Pro', target: 'paywall' },
      tone: 'cheer',
    });
  }

  const todays = remindersForDate(state.reminders, pet.id, today);
  if (todays.length && todays.every(task => task.completionDates.includes(today))) {
    tips.unshift({
      id: `perfect-${today}`,
      emoji: '\u{1F389}',
      title: 'Perfect day complete',
      body: `${pet.name} had everything they needed today. Well done.`,
      tone: 'cheer',
    });
  }

  return tips.filter(tip => !state.settings.tipsDismissed.includes(tip.id));
}

/* -------------------------------------------------------------- tutorial */

export type CoachMark = { id: string; emoji: string; title: string; body: string };

/** Shown once, in order, the first time the owner reaches the main app. */
export const COACH_MARKS: CoachMark[] = [
  {
    id: 'home',
    emoji: '\u{1F3E1}',
    title: 'This is your day',
    body: 'Home shows what your pet needs right now. Tap a task to tick it off — that is the whole loop.',
  },
  {
    id: 'quests',
    emoji: '\u{1F3AF}',
    title: 'Daily quests & XP',
    body: 'Care earns XP, coins and levels. Three fresh quests appear every morning, and a streak multiplies everything you earn.',
  },
  {
    id: 'schedule',
    emoji: '\u{1F4C5}',
    title: 'Shape the routine',
    body: 'Schedule holds every reminder. We suggested a starter set — edit, pause or add to it any time.',
  },
  {
    id: 'health',
    emoji: '\u{1FA7A}',
    title: 'Keep health in one place',
    body: 'Weight, vaccinations, vet visits and symptoms live here, so you are never digging through messages at the vet.',
  },
  {
    id: 'journal',
    emoji: '\u{1F4F8}',
    title: 'Save the good bits',
    body: 'The scrapbook is for the small stuff — a nap in a sunbeam, a first swim. Future you will be grateful.',
  },
];
