import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  CareReminder,
  Expense,
  JournalMoment,
  PawdayState,
  Pet,
  Settings,
  SymptomLog,
  Vaccination,
  VetVisit,
  WeightEntry,
  calculateStreak,
  dateKey,
  emptyState,
  isCompleted,
  newExpense,
  newMoment,
  newPet,
  newReminder,
  newSymptom,
  newVaccination,
  newVisit,
  newWeight,
  remindersForDate,
  toggleCompletion,
} from './domain';
import {
  AWARDS,
  COIN_COSTS,
  STICKERS,
  XP,
  applyCheckIn,
  levelFromXp,
  questStatuses,
  stickerUnlocked,
  streakMultiplier,
  totalXp,
  totalsFor,
  weekKey,
  weeklyChallenge,
} from './game';
import { FREE_LIMITS, FeatureKey, canAdd, isPro } from './pro';
import { DEFAULT_THEME_ID, Palette, ThemeId, paletteFor } from './theme';
import { loadState, saveState } from './storage';
import { cue, preloadSounds, setFeedbackPrefs } from './feedback';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export type Toast = { id: number; emoji: string; title: string; body?: string };

/**
 * A full-screen animation the app plays over everything. Kept as a plain string
 * union rather than importing `motion`'s type, because `motion` reads this
 * context and the two must not import each other.
 */
export type Celebration = 'confetti' | 'coin-flip';

/** One celebration in flight. The id restarts the animation on a repeat. */
export type CelebrationRun = { id: number; name: Celebration };

type Ctx = {
  state: PawdayState;
  ready: boolean;
  palette: Palette;
  pet?: Pet;
  pro: boolean;
  today: string;
  streak: number;
  multiplier: number;
  toasts: Toast[];
  celebration: CelebrationRun | null;
  paywallFor: FeatureKey | null;

  update: (updater: (current: PawdayState) => PawdayState) => void;
  replaceState: (next: PawdayState) => void;
  notify: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  /** Plays a full-screen flourish. Silently does nothing when motion is off. */
  celebrate: (name: Celebration) => void;
  endCelebration: () => void;
  openPaywall: (feature?: FeatureKey) => void;
  closePaywall: () => void;
  /** Runs `action` when the tier allows it, otherwise opens the upgrade sheet. */
  guard: (what: Parameters<typeof canAdd>[1], action: () => void) => void;

  selectPet: (id: string) => void;
  savePet: (draft: Partial<Pet> & { name: string }, editingId?: string) => void;
  removePet: (id: string) => void;

  saveReminder: (draft: Omit<CareReminder, 'id' | 'completionDates' | 'petId'>, editingId?: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  togglePause: (id: string) => void;
  toggleTask: (id: string, date: string) => void;
  addStarterTasks: (tasks: Omit<CareReminder, 'id' | 'completionDates' | 'petId'>[]) => void;

  saveMoment: (draft: Omit<JournalMoment, 'id' | 'createdAt' | 'petId'>, editingId?: string) => void;
  removeMoment: (id: string) => void;

  addWeight: (draft: Omit<WeightEntry, 'id' | 'petId'>) => void;
  addVaccination: (draft: Omit<Vaccination, 'id' | 'petId'>) => void;
  addVisit: (draft: Omit<VetVisit, 'id' | 'petId'>) => void;
  addSymptom: (draft: Omit<SymptomLog, 'id' | 'petId'>) => void;
  addExpense: (draft: Omit<Expense, 'id' | 'petId'>) => void;
  removeRecord: (kind: 'weights' | 'vaccinations' | 'visits' | 'symptoms' | 'expenses', id: string) => void;

  patchSettings: (patch: Partial<Settings>) => void;
  setTheme: (id: ThemeId) => void;
  dismissTip: (id: string) => void;
  markCoachMarksSeen: () => void;
  finishOnboarding: () => void;

  claimQuest: (questId: string) => void;
  claimWeekly: () => void;
  buyStreakFreeze: () => void;
  useStreakFreeze: (date: string) => void;

  startPro: (plan: 'monthly' | 'yearly' | 'lifetime', trialDays?: number) => void;
  cancelPro: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function useTheme(): Palette {
  return useApp().palette;
}

async function scheduleReminderNotification(reminder: CareReminder, petName: string): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return undefined;
    }
    const [hour, minute] = reminder.time.split(':').map(Number);
    let trigger: Notifications.NotificationTriggerInput;
    if (reminder.recurrence === 'once') {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(`${reminder.startDate}T${reminder.time}:00`) };
    } else if (reminder.recurrence === 'weekly') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: new Date(`${reminder.startDate}T12:00:00`).getDay() + 1,
        hour,
        minute,
      };
    } else if (reminder.recurrence === 'monthly') {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: Number(reminder.startDate.slice(-2)), hour, minute };
    } else {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
    }
    return await Notifications.scheduleNotificationAsync({
      content: { title: `${petName} \u{1F43E}`, body: reminder.title, sound: undefined },
      trigger,
    });
  } catch {
    // Notifications are an enhancement; the in-app schedule still works if the OS refuses.
  }
  return undefined;
}

async function cancelNotification(id?: string) {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PawdayState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paywallFor, setPaywallFor] = useState<FeatureKey | null>(null);
  const [celebration, setCelebration] = useState<CelebrationRun | null>(null);
  const toastId = useRef(0);
  const celebrationId = useRef(0);
  const today = dateKey();

  useEffect(() => {
    let cancelled = false;
    loadState().then(loaded => {
      if (cancelled) return;
      const { game, earned } = applyCheckIn(loaded.game, today);
      setState({ ...loaded, game });
      setReady(true);
      if (earned && loaded.settings.onboarded) {
        toastId.current += 1;
        setToasts([{ id: toastId.current, emoji: '\u{1F44B}', title: `Welcome back! +${earned} XP`, body: 'Daily check-in bonus' }]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    if (ready) void saveState(state);
  }, [ready, state]);

  // Feedback preferences live in a module cache so `cue()` stays callable from
  // anywhere without a hook. Keep that cache honest whenever settings move.
  useEffect(() => {
    setFeedbackPrefs({ sound: state.settings.sound, haptics: state.settings.haptics });
  }, [state.settings.haptics, state.settings.sound]);

  // Decode the clips once the user is past the loading screen, so the first
  // tick of the day sounds as immediate as the hundredth.
  useEffect(() => {
    if (ready && state.settings.sound) void preloadSounds();
  }, [ready, state.settings.sound]);

  const update = useCallback((updater: (current: PawdayState) => PawdayState) => setState(current => updater(current)), []);

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts(current => [...current, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts(current => current.filter(toast => toast.id !== id)), []);

  const celebrate = useCallback((name: Celebration) => {
    celebrationId.current += 1;
    setCelebration({ id: celebrationId.current, name });
  }, []);

  const endCelebration = useCallback(() => setCelebration(null), []);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = setTimeout(() => setToasts(current => current.slice(1)), 3200);
    return () => clearTimeout(timer);
  }, [toasts]);

  /**
   * Levels and collectibles are *derived* from care history rather than stored
   * as counters, so the only way to catch one being crossed is to watch the
   * derived value move. The ref starts empty and is filled on the first pass,
   * which is what stops a cold start from replaying every award ever earned.
   */
  const milestones = useRef<{ level: number; collectibles: number } | null>(null);
  useEffect(() => {
    if (!ready || !state.settings.onboarded) return;
    const level = levelFromXp(totalXp(state, today));
    const totals = totalsFor(state, today);
    const collectibles =
      STICKERS.filter(sticker => stickerUnlocked(sticker, totals)).length + AWARDS.filter(award => award.unlocked(totals)).length;

    const previous = milestones.current;
    milestones.current = { level: level.level, collectibles };
    if (!previous) return;

    if (level.level > previous.level) {
      cue('levelUp');
      celebrate('confetti');
      notify({ emoji: level.emoji, title: `Level ${level.level} — ${level.title}`, body: 'That is what looking after someone looks like.' });
    } else if (collectibles > previous.collectibles) {
      // Deliberately not stacked on top of a level-up: two celebrations in the
      // same beat cancel each other out.
      cue('unlock');
      notify({ emoji: '\u{1F3C5}', title: 'Something new unlocked', body: 'Take a look in Rewards.' });
    }
  }, [celebrate, notify, ready, state, today]);

  const pet = state.pets.find(item => item.id === state.selectedPetId) ?? state.pets[0];
  const pro = isPro(state.entitlement);
  const palette = useMemo(() => paletteFor(pro ? state.settings.themeId : DEFAULT_THEME_ID), [pro, state.settings.themeId]);
  const streak = pet ? calculateStreak(state.reminders, pet.id, today, state.game.frozenDates) : 0;
  const multiplier = streakMultiplier(streak);

  const openPaywall = useCallback((feature?: FeatureKey) => setPaywallFor(feature ?? 'multi-pet'), []);
  const closePaywall = useCallback(() => setPaywallFor(null), []);

  const guard: Ctx['guard'] = useCallback(
    (what, action) => {
      const gate = canAdd(state, what);
      if (gate.allowed) {
        action();
        return;
      }
      cue('blocked');
      if (gate.message) notify({ emoji: '\u{1F512}', title: 'Pro feature', body: gate.message });
      setPaywallFor(gate.feature ?? 'multi-pet');
    },
    [notify, state],
  );

  /* ------------------------------------------------------------------ pets */

  const selectPet = useCallback((id: string) => update(current => ({ ...current, selectedPetId: id })), [update]);

  const savePet: Ctx['savePet'] = useCallback(
    (draft, editingId) => {
      cue('save');
      update(current => {
        if (editingId) {
          return { ...current, pets: current.pets.map(item => (item.id === editingId ? { ...item, ...draft } : item)) };
        }
        const created = newPet({ species: 'Other', ...draft });
        return { ...current, pets: [...current.pets, created], selectedPetId: created.id };
      });
    },
    [update],
  );

  const removePet = useCallback(
    (id: string) => {
      cue('destroy');
      update(current => {
        const remaining = current.pets.filter(item => item.id !== id);
        return {
          ...current,
          pets: remaining,
          reminders: current.reminders.filter(item => item.petId !== id),
          moments: current.moments.filter(item => item.petId !== id),
          weights: current.weights.filter(item => item.petId !== id),
          vaccinations: current.vaccinations.filter(item => item.petId !== id),
          visits: current.visits.filter(item => item.petId !== id),
          symptoms: current.symptoms.filter(item => item.petId !== id),
          expenses: current.expenses.filter(item => item.petId !== id),
          selectedPetId: remaining[0]?.id ?? '',
        };
      });
    },
    [update],
  );

  /* ------------------------------------------------------------- reminders */

  const saveReminder: Ctx['saveReminder'] = useCallback(
    async (draft, editingId) => {
      if (!pet) return;
      cue('save');
      const existing = editingId ? state.reminders.find(item => item.id === editingId) : undefined;
      await cancelNotification(existing?.notificationId);
      const next: CareReminder = existing
        ? { ...existing, ...draft, notificationId: undefined }
        : newReminder({ ...draft, petId: pet.id });
      update(current => ({
        ...current,
        reminders: existing ? current.reminders.map(item => (item.id === existing.id ? next : item)) : [...current.reminders, next],
      }));
      const notificationId = await scheduleReminderNotification(next, pet.name);
      if (notificationId) {
        update(current => ({
          ...current,
          reminders: current.reminders.map(item => (item.id === next.id ? { ...item, notificationId } : item)),
        }));
      }
    },
    [pet, state.reminders, update],
  );

  const removeReminder = useCallback(
    async (id: string) => {
      cue('destroy');
      await cancelNotification(state.reminders.find(item => item.id === id)?.notificationId);
      update(current => ({ ...current, reminders: current.reminders.filter(item => item.id !== id) }));
    },
    [state.reminders, update],
  );

  const togglePause = useCallback(
    (id: string) => (
      cue('tap'),
      update(current => ({
        ...current,
        reminders: current.reminders.map(item => (item.id === id ? { ...item, paused: !item.paused } : item)),
      }))
    ),
    [update],
  );

  /**
   * Tick or untick a care task.
   *
   * The cue and the toast live here rather than in the row that was tapped,
   * because "was that the last one today?" is a question about the whole day,
   * and every surface that toggles a task deserves the same answer.
   */
  const toggleTask = useCallback(
    (id: string, date: string) => {
      const target = state.reminders.find(item => item.id === id);
      update(current => ({
        ...current,
        reminders: current.reminders.map(item => (item.id === id ? toggleCompletion(item, date) : item)),
      }));
      if (!target) return;

      if (isCompleted(target, date)) {
        cue('toggleOff');
        return;
      }

      const remaining = remindersForDate(state.reminders, target.petId, date).filter(
        task => task.id !== id && !isCompleted(task, date),
      ).length;

      if (remaining === 0) {
        cue('perfectDay');
        celebrate('confetti');
        notify({ emoji: '\u{1F389}', title: 'Perfect day!', body: `+${XP.task} XP and a ${XP.perfectDay} XP bonus.` });
        return;
      }
      cue('toggleOn');
      notify({ emoji: '\u{2705}', title: `+${XP.task} XP`, body: `${remaining} left today` });
    },
    [celebrate, notify, state.reminders, update],
  );

  const addStarterTasks: Ctx['addStarterTasks'] = useCallback(
    tasks => {
      if (!pet) return;
      // Onboarding can offer more tasks than the free tier holds; keep the first
      // few rather than silently creating reminders the user cannot manage.
      const room = isPro(state.entitlement) ? tasks.length : Math.max(0, FREE_LIMITS.remindersPerPet - state.reminders.filter(item => item.petId === pet.id).length);
      const accepted = tasks.slice(0, room);
      if (accepted.length < tasks.length) {
        notify({
          emoji: '\u{1F43E}',
          title: `Added ${accepted.length} of ${tasks.length}`,
          body: `Free Pawday holds ${FREE_LIMITS.remindersPerPet} reminders per pet. Pro removes the cap.`,
        });
      }
      const created = accepted.map(task => newReminder({ ...task, petId: pet.id }));
      update(current => ({ ...current, reminders: [...current.reminders, ...created] }));
      created.forEach(reminder => {
        void scheduleReminderNotification(reminder, pet.name).then(notificationId => {
          if (!notificationId) return;
          update(current => ({
            ...current,
            reminders: current.reminders.map(item => (item.id === reminder.id ? { ...item, notificationId } : item)),
          }));
        });
      });
    },
    [notify, pet, state.entitlement, state.reminders, update],
  );

  /* ---------------------------------------------------------- journal etc */

  const saveMoment: Ctx['saveMoment'] = useCallback(
    (draft, editingId) => {
      if (!pet) return;
      cue('save');
      update(current => ({
        ...current,
        moments: editingId
          ? current.moments.map(item => (item.id === editingId ? { ...item, ...draft } : item))
          : [...current.moments, newMoment({ ...draft, petId: pet.id })],
      }));
    },
    [pet, update],
  );

  const removeMoment = useCallback(
    (id: string) => (cue('destroy'), update(current => ({ ...current, moments: current.moments.filter(item => item.id !== id) }))),
    [update],
  );

  const addWeight: Ctx['addWeight'] = useCallback(
    draft => {
      if (!pet) return;
      cue('save');
      update(current => ({ ...current, weights: [...current.weights, newWeight({ ...draft, petId: pet.id })] }));
    },
    [pet, update],
  );

  const addVaccination: Ctx['addVaccination'] = useCallback(
    draft => {
      if (!pet) return;
      cue('save');
      update(current => ({ ...current, vaccinations: [...current.vaccinations, newVaccination({ ...draft, petId: pet.id })] }));
    },
    [pet, update],
  );

  const addVisit: Ctx['addVisit'] = useCallback(
    draft => {
      if (!pet) return;
      cue('save');
      update(current => ({ ...current, visits: [...current.visits, newVisit({ ...draft, petId: pet.id })] }));
    },
    [pet, update],
  );

  const addSymptom: Ctx['addSymptom'] = useCallback(
    draft => {
      if (!pet) return;
      cue('save');
      update(current => ({ ...current, symptoms: [...current.symptoms, newSymptom({ ...draft, petId: pet.id })] }));
    },
    [pet, update],
  );

  const addExpense: Ctx['addExpense'] = useCallback(
    draft => {
      if (!pet) return;
      cue('save');
      update(current => ({ ...current, expenses: [...current.expenses, newExpense({ ...draft, petId: pet.id })] }));
    },
    [pet, update],
  );

  const removeRecord: Ctx['removeRecord'] = useCallback(
    (kind, id) => (cue('destroy'), update(current => ({ ...current, [kind]: (current[kind] as { id: string }[]).filter(item => item.id !== id) } as PawdayState))),
    [update],
  );

  /* ---------------------------------------------------------- preferences */

  const patchSettings = useCallback(
    (patch: Partial<Settings>) => update(current => ({ ...current, settings: { ...current.settings, ...patch } })),
    [update],
  );

  const setTheme = useCallback(
    (id: ThemeId) => {
      const locked = paletteFor(id).pro && !pro;
      if (locked) {
        setPaywallFor('themes');
        return;
      }
      patchSettings({ themeId: id });
    },
    [patchSettings, pro],
  );

  const dismissTip = useCallback(
    (id: string) =>
      update(current => ({ ...current, settings: { ...current.settings, tipsDismissed: [...current.settings.tipsDismissed, id] } })),
    [update],
  );

  const markCoachMarksSeen = useCallback(() => patchSettings({ coachMarksSeen: ['done'] }), [patchSettings]);
  const finishOnboarding = useCallback(() => patchSettings({ onboarded: true }), [patchSettings]);

  /* ---------------------------------------------------------------- game */

  const claimQuest = useCallback(
    (questId: string) => {
      const quest = questStatuses(state, today).find(item => item.id === questId);
      if (!quest || !quest.done || quest.claimed) return;
      const coins = Math.round(quest.coins * multiplier);
      update(current => ({
        ...current,
        game: {
          ...current.game,
          xp: current.game.xp + quest.xp,
          coins: current.game.coins + coins,
          claimedQuests: [...current.game.claimedQuests, `${today}:${questId}`],
        },
      }));
      cue('reward');
      celebrate('coin-flip');
      notify({ emoji: quest.emoji, title: `+${quest.xp} XP, +${coins} coins`, body: quest.title });
    },
    [celebrate, multiplier, notify, state, today, update],
  );

  const claimWeekly = useCallback(() => {
    const challenge = weeklyChallenge(state, today);
    if (!challenge.done || challenge.claimed) return;
    update(current => ({
      ...current,
      game: {
        ...current.game,
        xp: current.game.xp + challenge.xp,
        coins: current.game.coins + challenge.coins,
        claimedWeeks: [...current.game.claimedWeeks, weekKey(today)],
      },
    }));
    cue('reward');
    celebrate('confetti');
    notify({ emoji: '\u{1F3C6}', title: `+${challenge.xp} XP, +${challenge.coins} coins`, body: 'Weekly challenge complete!' });
  }, [celebrate, notify, state, today, update]);

  const buyStreakFreeze = useCallback(() => {
    if (state.game.coins < COIN_COSTS.streakFreeze) {
      cue('blocked');
      notify({ emoji: '\u{1FA99}', title: 'Not enough coins', body: `Streak freezes cost ${COIN_COSTS.streakFreeze} coins.` });
      return;
    }
    update(current => ({
      ...current,
      game: { ...current.game, coins: current.game.coins - COIN_COSTS.streakFreeze, streakFreezes: current.game.streakFreezes + 1 },
    }));
    cue('reward');
    notify({ emoji: '\u{2744}', title: 'Streak freeze added', body: 'Save it for a day that gets away from you.' });
  }, [notify, state.game.coins, update]);

  const useStreakFreeze = useCallback(
    (date: string) => {
      if (state.game.streakFreezes < 1) {
        cue('blocked');
        notify({ emoji: '\u{2744}', title: 'No freezes left', body: `Buy one for ${COIN_COSTS.streakFreeze} coins.` });
        return;
      }
      update(current => ({
        ...current,
        game: { ...current.game, streakFreezes: current.game.streakFreezes - 1, frozenDates: [...current.game.frozenDates, date] },
      }));
      cue('unlock');
      notify({ emoji: '\u{2744}', title: 'Streak saved', body: 'That day is protected.' });
    },
    [notify, state.game.streakFreezes, update],
  );

  /* -------------------------------------------------------------- billing */

  const startPro = useCallback(
    (plan: 'monthly' | 'yearly' | 'lifetime', trialDays?: number) => {
      const trialEndsOn = trialDays ? dateKey(new Date(Date.now() + trialDays * 86400000)) : undefined;
      update(current => ({
        ...current,
        entitlement: { isPro: true, plan, since: new Date().toISOString(), trialEndsOn },
        game: { ...current.game, streakFreezes: current.game.streakFreezes + 2 },
      }));
      setPaywallFor(null);
      cue('unlock');
      celebrate('confetti');
      notify({ emoji: '\u{1F31F}', title: 'Pawday Pro unlocked', body: 'Themes, health vault and insights are all yours.' });
    },
    [celebrate, notify, update],
  );

  const cancelPro = useCallback(() => {
    update(current => ({ ...current, entitlement: { isPro: false }, settings: { ...current.settings, themeId: DEFAULT_THEME_ID } }));
    cue('tap');
    notify({ emoji: '\u{1F43E}', title: 'Back on Free', body: 'Your data stays exactly where it is.' });
  }, [notify, update]);

  const value: Ctx = {
    state,
    ready,
    palette,
    pet,
    pro,
    today,
    streak,
    multiplier,
    toasts,
    celebration,
    paywallFor,
    update,
    replaceState: setState,
    notify,
    dismissToast,
    celebrate,
    endCelebration,
    openPaywall,
    closePaywall,
    guard,
    selectPet,
    savePet,
    removePet,
    saveReminder,
    removeReminder,
    togglePause,
    toggleTask,
    addStarterTasks,
    saveMoment,
    removeMoment,
    addWeight,
    addVaccination,
    addVisit,
    addSymptom,
    addExpense,
    removeRecord,
    patchSettings,
    setTheme,
    dismissTip,
    markCoachMarksSeen,
    finishOnboarding,
    claimQuest,
    claimWeekly,
    buyStreakFreeze,
    useStreakFreeze,
    startPro,
    cancelPro,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
