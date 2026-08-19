import AsyncStorage from '@react-native-async-storage/async-storage';
import { PawdayState, seedState } from './domain';

const STORAGE_KEY = '@pawday/state-v1';

export async function loadState(): Promise<PawdayState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return seedState();
    const parsed = JSON.parse(stored) as PawdayState;
    if (!parsed.pets?.length || !parsed.reminders || !parsed.moments) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export async function saveState(state: PawdayState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
