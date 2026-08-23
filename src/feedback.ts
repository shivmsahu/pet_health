/**
 * The device half of Pawday's feedback layer: haptics and UI sound.
 *
 * `cue('toggleOn')` is callable from anywhere — screens, the context, a form —
 * without threading a hook through the tree, because feedback is fire-and-
 * forget by nature and has no return value worth awaiting. Preferences live in
 * a module-level cache that `AppProvider` keeps in sync with settings.
 *
 * Everything here fails soft. A device with no haptic motor, a browser that has
 * not been touched yet and so refuses to start audio, a platform where the
 * modules are missing entirely — all of it degrades to silence rather than to
 * an error, because none of it is load-bearing.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Cue, FeedbackPrefs, DEFAULT_FEEDBACK_PREFS, HapticName, SOUND_NAMES, SoundName, plan } from './cues';

/**
 * Static requires, so Metro bundles the .wav files. The generator in
 * `tools/make-sounds.mjs` writes these; see README for the licence position.
 */
const SOURCES: Record<SoundName, number> = {
  tick: require('../assets/sounds/tick.wav'),
  untick: require('../assets/sounds/untick.wav'),
  perfect: require('../assets/sounds/perfect.wav'),
  coin: require('../assets/sounds/coin.wav'),
  levelup: require('../assets/sounds/levelup.wav'),
  unlock: require('../assets/sounds/unlock.wav'),
  nope: require('../assets/sounds/nope.wav'),
};

let prefs: FeedbackPrefs = DEFAULT_FEEDBACK_PREFS;
const players = new Map<SoundName, AudioPlayer>();
let audioConfigured = false;

/** `AppProvider` pushes settings here whenever they change. */
export function setFeedbackPrefs(next: FeedbackPrefs) {
  prefs = next;
}

/**
 * Put the session in the mode a *UI sound* wants: mixes with whatever the user
 * is listening to, and obeys the ring/silent switch. A meal reminder chirping
 * over someone's podcast — or in a lecture — is exactly the behaviour that gets
 * an app muted for good.
 */
async function configureAudio() {
  if (audioConfigured) return;
  audioConfigured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
    });
  } catch {
    // Older platforms may not expose every field; the defaults are close enough.
  }
}

function playerFor(name: SoundName): AudioPlayer | undefined {
  const existing = players.get(name);
  if (existing) return existing;
  try {
    const player = createAudioPlayer(SOURCES[name]);
    players.set(name, player);
    return player;
  } catch {
    return undefined;
  }
}

/**
 * Warm the audio session and decode every clip up front.
 *
 * Cues are answers to a touch, so a first-play decode delay reads as lag rather
 * than as loading. Seven clips at a few kilobytes each is a cheap thing to hold.
 */
export async function preloadSounds() {
  await configureAudio();
  SOUND_NAMES.forEach(playerFor);
}

/** Release the players. Called when the app tears down. */
export function releaseSounds() {
  players.forEach(player => {
    try {
      player.remove();
    } catch {
      /* already gone */
    }
  });
  players.clear();
}

function playSound(name: SoundName, volume = 1) {
  const player = playerFor(name);
  if (!player) return;
  try {
    player.volume = volume;
    // Restart rather than overlap: ticking three tasks quickly should sound
    // like three taps, not like a chord.
    void player.seekTo(0);
    player.play();
  } catch {
    /* the browser has not granted audio yet, or the clip is still decoding */
  }
}

function fireHaptic(name: HapticName) {
  // expo-haptics is a no-op shim on web, but calling it there still costs a
  // module round-trip for something that can never be felt.
  if (Platform.OS === 'web') return;
  try {
    switch (name) {
      case 'selection':
        void Haptics.selectionAsync();
        return;
      case 'success':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case 'warning':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case 'soft':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        return;
      case 'heavy':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      case 'medium':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      default:
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* no motor, or the OS is refusing haptics right now */
  }
}

/**
 * Fire a cue. Never throws, never awaits, never returns anything —
 * call it inline from a press handler.
 */
export function cue(name: Cue) {
  const resolved = plan(name, prefs);
  if (resolved.haptic) fireHaptic(resolved.haptic);
  if (resolved.sound) playSound(resolved.sound, resolved.volume);
}
