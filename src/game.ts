/**
 * Pawday's game layer.
 *
 * The rule the whole system follows: XP is only ever earned for care that
 * actually happened. Nothing here can be farmed without the pet benefiting, so
 * the numbers stay honest and the streak stays meaningful.
 */

import {
  CareReminder,
  Expense,
  GameState,
  JournalMoment,
  PawdayState,
  SymptomLog,
  Vaccination,
  VetVisit,
  WeightEntry,
  calculateStreak,
  dateFromKey,
  dateKey,
  isCompleted,
  progressForDate,
  remindersForDate,
  shiftDate,
} from './domain';

/* -------------------------------------------------------------------- xp */

export const XP = {
  task: 10,
  perfectDay: 40,
  moment: 15,
  weight: 12,
  health: 20,
  expense: 5,
  checkIn: 5,
  quest: 25,
  weekly: 120,
} as const;

export const LEVELS: { title: string; emoji: string }[] = [
  { title: 'New Friend', emoji: '\u{1F423}' },
  { title: 'Snack Provider', emoji: '\u{1F36A}' },
  { title: 'Belly Rub Rookie', emoji: '\u{1F91A}' },
  { title: 'Walk Buddy', emoji: '\u{1F9AE}' },
  { title: 'Treat Wizard', emoji: '\u{1FA84}' },
  { title: 'Cuddle Champion', emoji: '\u{1F970}' },
  { title: 'Routine Keeper', emoji: '\u{23F0}' },
  { title: 'Zoomie Handler', emoji: '\u{1F4A8}' },
  { title: 'Health Guardian', emoji: '\u{1F6E1}' },
  { title: 'Memory Maker', emoji: '\u{1F4F8}' },
  { title: 'Paw Whisperer', emoji: '\u{1F43E}' },
  { title: 'Comfort Expert', emoji: '\u{1F6CB}' },
  { title: 'Adventure Guide', emoji: '\u{1F5FA}' },
  { title: 'Grooming Guru', emoji: '\u{2728}' },
  { title: 'Vet Visit Veteran', emoji: '\u{1FA7A}' },
  { title: 'Season Keeper', emoji: '\u{1F343}' },
  { title: 'Legendary Human', emoji: '\u{1F31F}' },
  { title: 'Soulmate Status', emoji: '\u{1F49E}' },
  { title: 'Pawday Elder', emoji: '\u{1F451}' },
  { title: 'Best Friend Forever', emoji: '\u{1F308}' },
];

/** Total XP required to reach a level. Gentle early, meaningful later. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(60 * Math.pow(level - 1, 1.6));
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (level < LEVELS.length && xp >= xpForLevel(level + 1)) level += 1;
  const floor = xpForLevel(level);
  const ceiling = level < LEVELS.length ? xpForLevel(level + 1) : floor;
  const span = Math.max(1, ceiling - floor);
  return {
    level,
    title: LEVELS[level - 1].title,
    emoji: LEVELS[level - 1].emoji,
    into: xp - floor,
    span,
    toNext: Math.max(0, ceiling - xp),
    percent: level >= LEVELS.length ? 1 : Math.min(1, (xp - floor) / span),
    maxed: level >= LEVELS.length,
  };
}

/**
 * Streak multiplier on earned XP. Caps at 2x so a long streak feels great
 * without making a fresh start feel pointless.
 */
export function streakMultiplier(streak: number): number {
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1;
}

/**
 * XP earned from care that is still in the data. Deriving it rather than
 * incrementing a counter means XP can never be farmed by toggling a task on and
 * off, and a deleted record takes its XP with it.
 */
export function derivedXp(state: PawdayState, today = dateKey()): number {
  const petIds = new Set(state.pets.map(pet => pet.id));
  const tasks = state.reminders
    .filter(reminder => petIds.has(reminder.petId))
    .reduce((sum, reminder) => sum + reminder.completionDates.length, 0);
  let perfectDays = 0;
  state.pets.forEach(pet => {
    for (let index = 0; index < 180; index += 1) {
      const key = shiftDate(today, -index);
      const progress = progressForDate(state.reminders, pet.id, key);
      if (progress.total > 0 && progress.completed === progress.total) perfectDays += 1;
    }
  });
  return (
    tasks * XP.task +
    perfectDays * XP.perfectDay +
    state.moments.length * XP.moment +
    state.weights.length * XP.weight +
    (state.vaccinations.length + state.visits.length + state.symptoms.length) * XP.health +
    state.expenses.length * XP.expense
  );
}

/** Care XP plus the bonus ledger (quests, weekly challenges, check-ins). */
export function totalXp(state: PawdayState, today = dateKey()): number {
  return derivedXp(state, today) + state.game.xp;
}

/* ----------------------------------------------------------------- quests */

export type QuestContext = {
  reminders: CareReminder[];
  moments: JournalMoment[];
  weights: WeightEntry[];
  vaccinations: Vaccination[];
  visits: VetVisit[];
  symptoms: SymptomLog[];
  expenses: Expense[];
  petId: string;
  today: string;
};

export type Quest = {
  id: string;
  title: string;
  emoji: string;
  target: number;
  coins: number;
  xp: number;
  measure: (context: QuestContext) => number;
};

const QUEST_POOL: Quest[] = [
  {
    id: 'three-tasks',
    title: 'Tick off 3 care tasks',
    emoji: '\u{2705}',
    target: 3,
    coins: 12,
    xp: XP.quest,
    measure: ({ reminders, petId, today }) => remindersForDate(reminders, petId, today).filter(task => isCompleted(task, today)).length,
  },
  {
    id: 'perfect-day',
    title: 'Finish everything on the list',
    emoji: '\u{1F3AF}',
    target: 1,
    coins: 20,
    xp: XP.quest + 15,
    measure: ({ reminders, petId, today }) => {
      const progress = progressForDate(reminders, petId, today);
      return progress.total > 0 && progress.completed === progress.total ? 1 : 0;
    },
  },
  {
    id: 'snap-moment',
    title: 'Save one little moment',
    emoji: '\u{1F4F8}',
    target: 1,
    coins: 15,
    xp: XP.quest,
    measure: ({ moments, petId, today }) => moments.filter(moment => moment.petId === petId && moment.date === today).length,
  },
  {
    id: 'mood-check',
    title: 'Log how they are feeling',
    emoji: '\u{1F49B}',
    target: 1,
    coins: 12,
    xp: XP.quest,
    measure: ({ moments, petId, today }) => moments.filter(moment => moment.petId === petId && moment.date === today && moment.mood).length,
  },
  {
    id: 'weigh-in',
    title: 'Record a weigh-in',
    emoji: '\u{2696}',
    target: 1,
    coins: 15,
    xp: XP.quest,
    measure: ({ weights, petId, today }) => weights.filter(entry => entry.petId === petId && entry.date === today).length,
  },
  {
    id: 'move-together',
    title: 'Complete a walk or play session',
    emoji: '\u{1F3BE}',
    target: 1,
    coins: 14,
    xp: XP.quest,
    measure: ({ reminders, petId, today }) =>
      remindersForDate(reminders, petId, today).filter(task => (task.category === 'Walk' || task.category === 'Play') && isCompleted(task, today)).length,
  },
  {
    id: 'morning-start',
    title: 'Finish a task before noon',
    emoji: '\u{1F305}',
    target: 1,
    coins: 10,
    xp: XP.quest,
    measure: ({ reminders, petId, today }) =>
      remindersForDate(reminders, petId, today).filter(task => task.time < '12:00' && isCompleted(task, today)).length,
  },
  {
    id: 'health-note',
    title: 'Add anything to the health vault',
    emoji: '\u{1FA7A}',
    target: 1,
    coins: 18,
    xp: XP.quest,
    measure: ({ vaccinations, visits, symptoms, petId, today }) =>
      vaccinations.filter(item => item.petId === petId && item.givenDate === today).length +
      visits.filter(item => item.petId === petId && item.date === today).length +
      symptoms.filter(item => item.petId === petId && item.date === today).length,
  },
];

/** Stable per-day shuffle so the quest set never changes under the owner. */
function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
}

export function questsForDate(key: string, count = 3): Quest[] {
  const seed = hash(key);
  const pool = [...QUEST_POOL];
  const picked: Quest[] = [];
  for (let index = 0; index < count && pool.length; index += 1) {
    picked.push(...pool.splice((seed >> (index * 3)) % pool.length, 1));
  }
  return picked;
}

export type QuestStatus = Quest & { value: number; done: boolean; claimed: boolean };

export function questStatuses(state: PawdayState, today = dateKey()): QuestStatus[] {
  const context: QuestContext = {
    reminders: state.reminders,
    moments: state.moments,
    weights: state.weights,
    vaccinations: state.vaccinations,
    visits: state.visits,
    symptoms: state.symptoms,
    expenses: state.expenses,
    petId: state.selectedPetId,
    today,
  };
  return questsForDate(today).map(quest => {
    const value = Math.min(quest.target, quest.measure(context));
    return { ...quest, value, done: value >= quest.target, claimed: state.game.claimedQuests.includes(`${today}:${quest.id}`) };
  });
}

/* --------------------------------------------------------------- weekly */

/** Monday-anchored week key, e.g. `2026-W34`. */
export function weekKey(key = dateKey()): string {
  const date = dateFromKey(key);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return `${date.getFullYear()}-W${String(Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}

export type WeeklyChallenge = { title: string; emoji: string; target: number; value: number; done: boolean; claimed: boolean; coins: number; xp: number };

export function weeklyChallenge(state: PawdayState, today = dateKey()): WeeklyChallenge {
  const target = 5;
  let value = 0;
  for (let index = 0; index < 7; index += 1) {
    const key = shiftDate(today, -index);
    const progress = progressForDate(state.reminders, state.selectedPetId, key);
    if (progress.total > 0 && progress.completed === progress.total) value += 1;
  }
  return {
    title: 'Five perfect days this week',
    emoji: '\u{1F3C6}',
    target,
    value: Math.min(target, value),
    done: value >= target,
    claimed: state.game.claimedWeeks.includes(weekKey(today)),
    coins: 80,
    xp: XP.weekly,
  };
}

/* -------------------------------------------------------------- stickers */

export type Sticker = { id: string; emoji: string; name: string; hint: string; pro: boolean };

export const STICKERS: Sticker[] = [
  { id: 'first-paw', emoji: '\u{1F43E}', name: 'First Paw', hint: 'Complete your first care task', pro: false },
  { id: 'sunny', emoji: '\u{1F31E}', name: 'Sunny Day', hint: 'Finish a perfect day', pro: false },
  { id: 'bone', emoji: '\u{1F9B4}', name: 'Good Bone', hint: 'Reach level 3', pro: false },
  { id: 'heart', emoji: '\u{1F495}', name: 'Two Hearts', hint: 'Save 3 little moments', pro: false },
  { id: 'flame', emoji: '\u{1F525}', name: 'Streak Spark', hint: 'Keep a 7 day streak', pro: false },
  { id: 'clover', emoji: '\u{1F340}', name: 'Lucky Clover', hint: 'Complete 25 care tasks', pro: false },
  { id: 'crown', emoji: '\u{1F451}', name: 'Royal Paws', hint: 'Reach level 8', pro: true },
  { id: 'rainbow', emoji: '\u{1F308}', name: 'Rainbow Tail', hint: 'Keep a 30 day streak', pro: true },
  { id: 'star', emoji: '\u{1F31F}', name: 'Star Pupil', hint: 'Complete 100 care tasks', pro: true },
  { id: 'cake', emoji: '\u{1F382}', name: 'Birthday Cake', hint: 'Celebrate a pet birthday', pro: true },
  { id: 'shield', emoji: '\u{1F6E1}', name: 'Health Shield', hint: 'Log 5 health records', pro: true },
  { id: 'moon', emoji: '\u{1F319}', name: 'Night Owl', hint: 'Reach level 15', pro: true },
];

export type Totals = {
  tasks: number;
  perfectDays: number;
  moments: number;
  health: number;
  streak: number;
  level: number;
  birthdays: number;
};

export function totalsFor(state: PawdayState, today = dateKey()): Totals {
  const petId = state.selectedPetId;
  const tasks = state.reminders
    .filter(reminder => reminder.petId === petId)
    .reduce((sum, reminder) => sum + reminder.completionDates.length, 0);
  let perfectDays = 0;
  for (let index = 0; index < 120; index += 1) {
    const key = shiftDate(today, -index);
    const progress = progressForDate(state.reminders, petId, key);
    if (progress.total > 0 && progress.completed === progress.total) perfectDays += 1;
  }
  const health =
    state.weights.filter(item => item.petId === petId).length +
    state.vaccinations.filter(item => item.petId === petId).length +
    state.visits.filter(item => item.petId === petId).length +
    state.symptoms.filter(item => item.petId === petId).length;
  const pet = state.pets.find(item => item.id === petId);
  const birthdays = pet?.birthday && state.moments.some(moment => moment.petId === petId && moment.date.slice(5) === pet.birthday?.slice(5)) ? 1 : 0;
  return {
    tasks,
    perfectDays,
    moments: state.moments.filter(moment => moment.petId === petId).length,
    health,
    streak: calculateStreak(state.reminders, petId, today, state.game.frozenDates),
    level: levelFromXp(totalXp(state, today)).level,
    birthdays,
  };
}

export function stickerUnlocked(sticker: Sticker, totals: Totals): boolean {
  switch (sticker.id) {
    case 'first-paw':
      return totals.tasks >= 1;
    case 'sunny':
      return totals.perfectDays >= 1;
    case 'bone':
      return totals.level >= 3;
    case 'heart':
      return totals.moments >= 3;
    case 'flame':
      return totals.streak >= 7;
    case 'clover':
      return totals.tasks >= 25;
    case 'crown':
      return totals.level >= 8;
    case 'rainbow':
      return totals.streak >= 30;
    case 'star':
      return totals.tasks >= 100;
    case 'cake':
      return totals.birthdays >= 1;
    case 'shield':
      return totals.health >= 5;
    case 'moon':
      return totals.level >= 15;
    default:
      return false;
  }
}

/* ---------------------------------------------------------------- awards */

export type Award = { id: string; icon: string; name: string; desc: string; tier: 'bronze' | 'silver' | 'gold'; pro: boolean; unlocked: (totals: Totals) => boolean };

export const AWARDS: Award[] = [
  { id: 'fresh-start', icon: '\u{1F331}', name: 'Fresh Start', desc: 'Complete your first care task', tier: 'bronze', pro: false, unlocked: t => t.tasks >= 1 },
  { id: 'three-day', icon: '\u{1F63A}', name: 'Warming Up', desc: 'Keep a 3 day streak', tier: 'bronze', pro: false, unlocked: t => t.streak >= 3 },
  { id: 'on-a-roll', icon: '\u{1F525}', name: 'On A Roll', desc: 'Keep a 7 day streak', tier: 'silver', pro: false, unlocked: t => t.streak >= 7 },
  { id: 'scrapbooker', icon: '\u{1F4D6}', name: 'Scrapbooker', desc: 'Save 5 little moments', tier: 'bronze', pro: false, unlocked: t => t.moments >= 5 },
  { id: 'fifty-tasks', icon: '\u{1F3C5}', name: 'Fifty Paws', desc: 'Complete 50 care tasks', tier: 'silver', pro: false, unlocked: t => t.tasks >= 50 },
  { id: 'perfect-ten', icon: '\u{2B50}', name: 'Perfect Ten', desc: 'Finish 10 perfect days', tier: 'silver', pro: false, unlocked: t => t.perfectDays >= 10 },
  { id: 'health-guard', icon: '\u{1F6E1}', name: 'Health Guardian', desc: 'Log 10 health records', tier: 'gold', pro: true, unlocked: t => t.health >= 10 },
  { id: 'month-streak', icon: '\u{1F308}', name: 'Unbreakable', desc: 'Keep a 30 day streak', tier: 'gold', pro: true, unlocked: t => t.streak >= 30 },
  { id: 'century', icon: '\u{1F451}', name: 'Century Club', desc: 'Complete 100 care tasks', tier: 'gold', pro: true, unlocked: t => t.tasks >= 100 },
  { id: 'legend', icon: '\u{1F31F}', name: 'Legendary Human', desc: 'Reach level 17', tier: 'gold', pro: true, unlocked: t => t.level >= 17 },
];

/* ----------------------------------------------------------- check-in */

/** Daily open bonus. Returns the same state when today is already claimed. */
export function applyCheckIn(game: GameState, today = dateKey()): { game: GameState; earned: number } {
  if (game.lastCheckIn === today) return { game, earned: 0 };
  const consecutive = game.lastCheckIn === shiftDate(today, -1) ? game.checkInStreak + 1 : 1;
  const earned = XP.checkIn + Math.min(15, consecutive);
  return {
    game: { ...game, lastCheckIn: today, checkInStreak: consecutive, xp: game.xp + earned, coins: game.coins + 3 },
    earned,
  };
}

/** Care score for the day: 0-100, blending today's list with the streak. */
export function careScore(state: PawdayState, today = dateKey()): number {
  const progress = progressForDate(state.reminders, state.selectedPetId, today);
  const streak = calculateStreak(state.reminders, state.selectedPetId, today, state.game.frozenDates);
  const base = progress.total ? progress.percent * 80 : 0;
  return Math.round(Math.min(100, base + Math.min(20, streak * 2)));
}

export const COIN_COSTS = { streakFreeze: 120, themeTrial: 200 } as const;
