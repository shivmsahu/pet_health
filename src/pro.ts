/**
 * Free vs Pawday Pro.
 *
 * The split follows one principle: the free app must be genuinely good forever
 * for one pet's daily routine. Pro sells depth (health records, insights,
 * money, multi-pet) and delight (themes, stickers, export) — never the ability
 * to look after your pet.
 */

import { Entitlement, PawdayState } from './domain';

export type FeatureKey =
  | 'multi-pet'
  | 'unlimited-reminders'
  | 'health-vault'
  | 'expenses'
  | 'insights'
  | 'themes'
  | 'export'
  | 'care-card'
  | 'pro-stickers'
  | 'unlimited-journal';

export const FREE_LIMITS = {
  pets: 1,
  remindersPerPet: 6,
  moments: 20,
  weightEntries: 8,
  /** Vaccination reminders are safety-critical, so free gets a workable few. */
  vaccinations: 3,
  historyDays: 14,
} as const;

export type FeatureCopy = { title: string; blurb: string; emoji: string };

export const FEATURE_COPY: Record<FeatureKey, FeatureCopy> = {
  'multi-pet': {
    title: 'The whole household',
    blurb: 'Add every pet you love and switch between them in a tap.',
    emoji: '\u{1F43E}',
  },
  'unlimited-reminders': {
    title: 'Unlimited reminders',
    blurb: 'Build the full routine — meals, meds, walks, training, all of it.',
    emoji: '\u{23F0}',
  },
  'health-vault': {
    title: 'Health vault',
    blurb: 'Vet visits, vaccinations, symptoms and weight history in one place.',
    emoji: '\u{1FA7A}',
  },
  expenses: {
    title: 'Pet spending',
    blurb: 'See where the money actually goes each month, by category.',
    emoji: '\u{1F4B8}',
  },
  insights: {
    title: 'Care insights',
    blurb: 'Trends, weak spots and the habits that keep slipping.',
    emoji: '\u{1F4C8}',
  },
  themes: {
    title: 'Theme packs',
    blurb: 'Five extra palettes including Night Olive dark mode.',
    emoji: '\u{1F3A8}',
  },
  export: {
    title: 'Backup & export',
    blurb: 'Take a full copy of everything with you, any time.',
    emoji: '\u{1F4E6}',
  },
  'care-card': {
    title: 'Sitter care card',
    blurb: 'A shareable summary of the routine for whoever is watching them.',
    emoji: '\u{1F48C}',
  },
  'pro-stickers': {
    title: 'Full sticker album',
    blurb: 'Unlock the rare stickers and the gold award shelf.',
    emoji: '\u{1F31F}',
  },
  'unlimited-journal': {
    title: 'Endless scrapbook',
    blurb: 'Keep every photo and moment, with no cap.',
    emoji: '\u{1F4F8}',
  },
};

export function isPro(entitlement: Entitlement): boolean {
  if (!entitlement.isPro) return false;
  if (entitlement.trialEndsOn) return new Date().toISOString().slice(0, 10) <= entitlement.trialEndsOn;
  return true;
}

export type Gate = { allowed: boolean; feature?: FeatureKey; message?: string };

const OK: Gate = { allowed: true };

/**
 * The single place that answers "can they do this right now?". Every call site
 * shows the same upgrade sheet when it says no.
 */
export function canAdd(state: PawdayState, what: 'pet' | 'reminder' | 'moment' | 'weight' | 'vaccination' | 'visit' | 'symptom' | 'expense'): Gate {
  if (isPro(state.entitlement)) return OK;
  const petId = state.selectedPetId;
  switch (what) {
    case 'pet':
      return state.pets.length < FREE_LIMITS.pets
        ? OK
        : { allowed: false, feature: 'multi-pet', message: `Free Pawday looks after one pet. Go Pro to add the rest of the family.` };
    case 'reminder': {
      const count = state.reminders.filter(reminder => reminder.petId === petId).length;
      return count < FREE_LIMITS.remindersPerPet
        ? OK
        : { allowed: false, feature: 'unlimited-reminders', message: `Free includes ${FREE_LIMITS.remindersPerPet} reminders. Pro removes the cap.` };
    }
    case 'moment': {
      const count = state.moments.filter(moment => moment.petId === petId).length;
      return count < FREE_LIMITS.moments
        ? OK
        : { allowed: false, feature: 'unlimited-journal', message: `Your free scrapbook holds ${FREE_LIMITS.moments} moments. Pro keeps them all.` };
    }
    case 'weight': {
      const count = state.weights.filter(entry => entry.petId === petId).length;
      return count < FREE_LIMITS.weightEntries
        ? OK
        : { allowed: false, feature: 'health-vault', message: `Free keeps your last ${FREE_LIMITS.weightEntries} weigh-ins. Pro keeps the full chart.` };
    }
    case 'vaccination': {
      const count = state.vaccinations.filter(item => item.petId === petId).length;
      return count < FREE_LIMITS.vaccinations
        ? OK
        : { allowed: false, feature: 'health-vault', message: `Free tracks ${FREE_LIMITS.vaccinations} vaccinations. Pro tracks every one.` };
    }
    case 'visit':
      return { allowed: false, feature: 'health-vault', message: 'Vet visit records are part of the Pro health vault.' };
    case 'symptom':
      return { allowed: false, feature: 'health-vault', message: 'Symptom tracking is part of the Pro health vault.' };
    case 'expense':
      return { allowed: false, feature: 'expenses', message: 'Pet spending is a Pro feature.' };
    default:
      return OK;
  }
}

export function hasFeature(state: PawdayState, feature: FeatureKey): boolean {
  return isPro(state.entitlement);
}

/** How close a free user is to a limit, for the soft "3 of 6 used" hints. */
export function usage(state: PawdayState, what: 'reminder' | 'moment' | 'weight' | 'vaccination') {
  const petId = state.selectedPetId;
  const map = {
    reminder: [state.reminders.filter(item => item.petId === petId).length, FREE_LIMITS.remindersPerPet],
    moment: [state.moments.filter(item => item.petId === petId).length, FREE_LIMITS.moments],
    weight: [state.weights.filter(item => item.petId === petId).length, FREE_LIMITS.weightEntries],
    vaccination: [state.vaccinations.filter(item => item.petId === petId).length, FREE_LIMITS.vaccinations],
  } as const;
  const [used, limit] = map[what];
  return { used, limit, remaining: Math.max(0, limit - used), atLimit: used >= limit };
}

/* --------------------------------------------------------------- pricing */

export type Plan = {
  id: 'monthly' | 'yearly' | 'lifetime';
  label: string;
  price: string;
  sub: string;
  badge?: string;
  perMonth?: string;
  trialDays?: number;
};

/**
 * Displayed prices only. Real charging goes through the store SDK; this keeps
 * the paywall honest about what is being offered.
 */
export const PLANS: Plan[] = [
  { id: 'monthly', label: 'Monthly', price: '$4.99', sub: 'billed every month', perMonth: '$4.99/mo' },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$29.99',
    sub: '7 days free, then billed yearly',
    badge: 'Best value \u{2022} save 50%',
    perMonth: '$2.50/mo',
    trialDays: 7,
  },
  { id: 'lifetime', label: 'Lifetime', price: '$69.99', sub: 'one payment, yours forever', badge: 'Pay once' },
];

export const PRO_BULLETS: FeatureKey[] = [
  'multi-pet',
  'unlimited-reminders',
  'health-vault',
  'insights',
  'expenses',
  'themes',
  'care-card',
  'export',
];
