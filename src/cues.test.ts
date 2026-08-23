import { describe, expect, it } from 'vitest';
import { CUES, Cue, DEFAULT_FEEDBACK_PREFS, SOUND_NAMES, plan } from './cues';

const ALL = Object.keys(CUES) as Cue[];
const both = DEFAULT_FEEDBACK_PREFS;
const silent = { sound: false, haptics: true };
const still = { sound: true, haptics: false };
const off = { sound: false, haptics: false };

describe('feedback policy', () => {
  it('gives every cue a haptic, so nothing is announced by sound alone', () => {
    ALL.forEach(name => {
      expect(CUES[name].haptic, name).toBeDefined();
    });
  });

  it('only references sounds that are actually shipped', () => {
    ALL.forEach(name => {
      const sound = CUES[name].sound;
      if (sound) expect(SOUND_NAMES, name).toContain(sound);
    });
  });

  it('keeps the everyday touch cues silent', () => {
    // Tapping a button or a tab happens constantly; a chirp every time is how
    // an app earns its way onto the mute pile.
    (['tap', 'select', 'save', 'destroy'] as Cue[]).forEach(name => {
      expect(CUES[name].sound, name).toBeUndefined();
    });
  });

  it('mixes routine cues below celebrations', () => {
    const routine = CUES.toggleOn.volume ?? 1;
    const celebration = CUES.perfectDay.volume ?? 1;
    expect(routine).toBeLessThan(celebration);
    expect(CUES.toggleOff.volume ?? 1).toBeLessThan(routine);
  });

  it('drops sound when sound is off but keeps the haptic', () => {
    const resolved = plan('toggleOn', silent);
    expect(resolved.sound).toBeUndefined();
    expect(resolved.haptic).toBe(CUES.toggleOn.haptic);
  });

  it('drops the haptic when haptics are off but keeps the sound', () => {
    const resolved = plan('toggleOn', still);
    expect(resolved.sound).toBe(CUES.toggleOn.sound);
    expect(resolved.haptic).toBeUndefined();
  });

  it('resolves to nothing at all when both are off', () => {
    ALL.forEach(name => {
      const resolved = plan(name, off);
      expect(resolved.sound, name).toBeUndefined();
      expect(resolved.haptic, name).toBeUndefined();
    });
  });

  it('passes the full spec through when both are on', () => {
    ALL.forEach(name => {
      expect(plan(name, both), name).toEqual({
        sound: CUES[name].sound,
        haptic: CUES[name].haptic,
        volume: CUES[name].volume,
      });
    });
  });

  it('distinguishes ticking from unticking in both channels', () => {
    // Undoing should never feel or sound like an achievement.
    expect(CUES.toggleOn.sound).not.toBe(CUES.toggleOff.sound);
    expect(CUES.toggleOn.haptic).not.toBe(CUES.toggleOff.haptic);
  });

  it('warns rather than congratulates on a refusal', () => {
    expect(CUES.blocked.haptic).toBe('warning');
    expect(CUES.blocked.sound).toBe('nope');
  });
});
