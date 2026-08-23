/**
 * Pawday's feedback vocabulary.
 *
 * One named cue per *meaning* rather than per sound file, so a screen says
 * `cue('reward')` and never picks a waveform. The table below is the whole
 * policy: which sound, which haptic, and how loud relative to the rest.
 *
 * Three rules hold it together:
 * - Anything the user does dozens of times a day is haptic-first and quiet.
 *   Ticking a task is a knock, not a fanfare.
 * - Sound is always optional garnish. Every cue that carries meaning also
 *   carries a haptic, and nothing in the app is only announced by audio.
 * - Nothing fires on passive events. Cues answer a touch, never a render.
 *
 * This module is deliberately free of native imports so the policy can be
 * unit-tested; `feedback.ts` is the part that actually talks to the device.
 */

export type SoundName = 'tick' | 'untick' | 'perfect' | 'coin' | 'levelup' | 'unlock' | 'nope';

/** The subset of iOS/Android feedback patterns the app uses, named by intent. */
export type HapticName = 'light' | 'medium' | 'heavy' | 'soft' | 'selection' | 'success' | 'warning';

export type Cue =
  /* --- everyday touch: haptic only, so the app never chatters --- */
  | 'tap'
  | 'select'
  | 'save'
  | 'destroy'
  /* --- care, the loop the whole app exists for --- */
  | 'toggleOn'
  | 'toggleOff'
  | 'perfectDay'
  /* --- the game layer, where noise is the point --- */
  | 'reward'
  | 'levelUp'
  | 'unlock'
  /* --- refusal --- */
  | 'blocked';

export type CueSpec = {
  sound?: SoundName;
  haptic?: HapticName;
  /** Playback gain on top of the file's own mix, 0-1. */
  volume?: number;
};

export const CUES: Record<Cue, CueSpec> = {
  tap: { haptic: 'light' },
  select: { haptic: 'selection' },
  save: { haptic: 'medium' },
  destroy: { haptic: 'heavy' },

  toggleOn: { haptic: 'medium', sound: 'tick', volume: 0.9 },
  toggleOff: { haptic: 'soft', sound: 'untick', volume: 0.7 },
  perfectDay: { haptic: 'success', sound: 'perfect', volume: 1 },

  reward: { haptic: 'medium', sound: 'coin', volume: 0.9 },
  levelUp: { haptic: 'success', sound: 'levelup', volume: 1 },
  unlock: { haptic: 'success', sound: 'unlock', volume: 0.95 },

  blocked: { haptic: 'warning', sound: 'nope', volume: 0.8 },
};

export type FeedbackPrefs = {
  sound: boolean;
  haptics: boolean;
};

export const DEFAULT_FEEDBACK_PREFS: FeedbackPrefs = { sound: true, haptics: true };

/**
 * Resolve a cue against the user's preferences.
 *
 * The two switches are independent on purpose: someone in a quiet room turns
 * sound off and keeps the taps, and someone whose phone lives in a bag does the
 * reverse. Neither can silence the visual half of a cue.
 */
export function plan(cue: Cue, prefs: FeedbackPrefs): CueSpec {
  const spec = CUES[cue];
  return {
    sound: prefs.sound ? spec.sound : undefined,
    haptic: prefs.haptics ? spec.haptic : undefined,
    volume: spec.volume,
  };
}

/** Every sound the app can play — the preload list. */
export const SOUND_NAMES: SoundName[] = ['tick', 'untick', 'perfect', 'coin', 'levelup', 'unlock', 'nope'];
