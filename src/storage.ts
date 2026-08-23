import AsyncStorage from '@react-native-async-storage/async-storage';
import { PawdayState, defaultGame, defaultSettings, emptyState } from './domain';

const STORAGE_KEY = '@pawday/state-v2';
const LEGACY_KEY = '@pawday/state-v1';

/**
 * Fills in anything a older build never wrote, so a partially-shaped payload
 * from a previous version still loads instead of resetting the owner's data.
 */
export function hydrate(input: Partial<PawdayState> | null | undefined): PawdayState {
  const base = emptyState();
  if (!input) return base;
  const pets = (input.pets ?? []).map(pet => ({
    ...pet,
    species: pet.species ?? 'Other',
    breed: pet.breed ?? '',
    emoji: pet.emoji ?? '\u{1F43E}',
    color: pet.color ?? '#F5A66D',
  }));
  return {
    ...base,
    ...input,
    pets,
    reminders: input.reminders ?? [],
    moments: input.moments ?? [],
    weights: input.weights ?? [],
    vaccinations: input.vaccinations ?? [],
    visits: input.visits ?? [],
    symptoms: input.symptoms ?? [],
    expenses: input.expenses ?? [],
    settings: { ...defaultSettings(), ...(input.settings ?? {}), onboarded: input.settings?.onboarded ?? pets.length > 0 },
    entitlement: input.entitlement ?? { isPro: false },
    game: { ...defaultGame(), ...(input.game ?? {}) },
    selectedPetId: input.selectedPetId && pets.some(pet => pet.id === input.selectedPetId) ? input.selectedPetId : pets[0]?.id ?? '',
  };
}

export async function loadState(): Promise<PawdayState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return hydrate(JSON.parse(stored));
    // A v1 install keeps its pets, reminders and memories; the demo seed is gone.
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = hydrate(JSON.parse(legacy));
      await saveState(migrated);
      return migrated;
    }
    return emptyState();
  } catch {
    return emptyState();
  }
}

export async function saveState(state: PawdayState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_KEY]);
}

/** Pretty-printed full backup, used by the Pro export sheet. */
export function exportState(state: PawdayState): string {
  return JSON.stringify({ app: 'Pawday', version: 2, exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importState(raw: string): PawdayState | null {
  try {
    const parsed = JSON.parse(raw);
    const candidate = parsed?.state ?? parsed;
    if (!candidate || typeof candidate !== 'object') return null;
    return hydrate(candidate);
  } catch {
    return null;
  }
}
