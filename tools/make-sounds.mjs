/**
 * Generates Pawday's UI sound set.
 *
 * The sounds are synthesised here rather than downloaded so the app ships
 * audio it owns outright — no licence, no attribution, no network fetch, and
 * a few kilobytes each. Re-run with `node tools/make-sounds.mjs` after editing
 * a recipe; the .wav files are committed so a plain `npm install` is enough.
 *
 * Voice: small struck-metal and wooden-mallet tones (sine partials, fast
 * attack, exponential decay) in a C major pentatonic set, so no two cues ever
 * clash when they land back to back.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
const RATE = 22050;

/** Equal temperament, A4 = 440. `note('C6')` → 1046.5 Hz. */
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function note(name) {
  const [, letter, accidental, octave] = /^([A-G])(#|b)?(\d)$/.exec(name);
  const semitone = SEMITONES[letter] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);
  return 440 * 2 ** ((semitone - 9) / 12 + (Number(octave) - 4));
}

/**
 * One struck tone rendered into `buffer` at `start` seconds.
 *
 * `partials` are amplitude multipliers for harmonics 1..n — a couple of quiet
 * upper partials is what separates a warm mallet from a phone beep. `decay` is
 * the exponential time constant; `attack` stays a few milliseconds so the
 * transient reads as a strike without clicking.
 */
function strike(buffer, start, { freq, decay, gain = 1, partials = [1, 0.28, 0.1], attack = 0.004, detune = 0 }) {
  const first = Math.floor(start * RATE);
  const length = Math.ceil(decay * 6 * RATE);
  for (let i = 0; i < length; i += 1) {
    const index = first + i;
    if (index >= buffer.length) break;
    const t = i / RATE;
    const envelope = Math.min(1, t / attack) * Math.exp(-t / decay);
    let sample = 0;
    partials.forEach((amplitude, harmonic) => {
      // Slightly stretched partials, the way a real struck bar behaves.
      const f = freq * (harmonic + 1) * (1 + detune * harmonic);
      sample += amplitude * Math.sin(2 * Math.PI * f * t);
    });
    buffer[index] += sample * envelope * gain;
  }
}

/** Filtered noise burst — the breath under a shimmer or a soft whoosh. */
function shimmer(buffer, start, { duration, gain = 0.2, seed = 7 }) {
  const first = Math.floor(start * RATE);
  const length = Math.ceil(duration * RATE);
  let random = seed;
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    const index = first + i;
    if (index >= buffer.length) break;
    random = (random * 1103515245 + 12345) % 2147483648;
    const white = random / 1073741824 - 1;
    // One-pole high-pass, so the noise sits as air rather than rumble.
    const filtered = white - previous;
    previous = white;
    const t = i / length;
    buffer[index] += filtered * gain * Math.sin(Math.PI * t) ** 2;
  }
}

/**
 * Normalise to `target` peak, then fade the tail so the file cannot end on a
 * click. The target is per-recipe rather than uniform: a tick fires dozens of
 * times a day and a level-up a handful of times a month, so they are mixed to
 * sit at very different volumes with the device slider left alone.
 */
function encode(buffer, target) {
  let peak = 0;
  for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
  const scale = peak > 0 ? target / peak : 0;
  const fade = Math.min(buffer.length, Math.floor(RATE * 0.01));

  const data = Buffer.alloc(buffer.length * 2);
  for (let i = 0; i < buffer.length; i += 1) {
    const taper = i >= buffer.length - fade ? (buffer.length - i) / fade : 1;
    const value = Math.max(-1, Math.min(1, buffer[i] * scale * taper));
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function render(seconds, peak, paint) {
  const buffer = new Float64Array(Math.ceil(seconds * RATE));
  paint(buffer);
  return encode(buffer, peak);
}

/* ------------------------------------------------------------------ recipes */

const RECIPES = {
  /** Ticking a task off: one wooden knock, quiet enough to hear fifty times a day. */
  tick: () =>
    render(0.4, 0.34, buffer => {
      strike(buffer, 0, { freq: note('C6'), decay: 0.055, gain: 0.9, partials: [1, 0.18, 0.05], detune: 0.004 });
      strike(buffer, 0, { freq: note('G6'), decay: 0.03, gain: 0.3, partials: [1] });
    }),

  /** Untick: the same knock a fifth lower, so undoing is audibly a step back. */
  untick: () =>
    render(0.35, 0.3, buffer => {
      strike(buffer, 0, { freq: note('F5'), decay: 0.05, gain: 0.8, partials: [1, 0.14] });
    }),

  /** Every task done today. A full pentatonic run — the loudest thing in the app. */
  perfect: () =>
    render(1.3, 0.86, buffer => {
      ['C6', 'E6', 'G6', 'C7'].forEach((name, index) => {
        strike(buffer, index * 0.085, { freq: note(name), decay: 0.24, gain: 0.85 - index * 0.06, detune: 0.003 });
      });
      strike(buffer, 0.34, { freq: note('E7'), decay: 0.34, gain: 0.34, partials: [1, 0.4, 0.2, 0.1] });
      shimmer(buffer, 0.32, { duration: 0.5, gain: 0.14, seed: 3 });
    }),

  /** Claiming coins. Two bright taps, the second landing above the first. */
  coin: () =>
    render(0.6, 0.55, buffer => {
      strike(buffer, 0, { freq: note('B5'), decay: 0.07, gain: 0.75, partials: [1, 0.5, 0.25], detune: 0.01 });
      strike(buffer, 0.062, { freq: note('E6'), decay: 0.13, gain: 0.85, partials: [1, 0.45, 0.22], detune: 0.01 });
    }),

  /** Levelling up. Same run as `perfect` but arriving on a held bell. */
  levelup: () =>
    render(1.7, 0.92, buffer => {
      ['C6', 'D6', 'E6', 'G6'].forEach((name, index) => {
        strike(buffer, index * 0.075, { freq: note(name), decay: 0.16, gain: 0.7 });
      });
      strike(buffer, 0.3, { freq: note('C7'), decay: 0.55, gain: 0.95, partials: [1, 0.35, 0.18, 0.09, 0.04], detune: 0.006 });
      strike(buffer, 0.3, { freq: note('G7'), decay: 0.4, gain: 0.22, partials: [1, 0.3] });
      shimmer(buffer, 0.28, { duration: 0.7, gain: 0.12, seed: 11 });
    }),

  /** A sticker, award or Pro unlocking: an airy bell rather than a fanfare. */
  unlock: () =>
    render(1.2, 0.6, buffer => {
      strike(buffer, 0, { freq: note('G6'), decay: 0.3, gain: 0.7, partials: [1, 0.5, 0.3, 0.15], detune: 0.008 });
      strike(buffer, 0.09, { freq: note('D7'), decay: 0.42, gain: 0.55, partials: [1, 0.4, 0.2], detune: 0.008 });
      shimmer(buffer, 0, { duration: 0.55, gain: 0.16, seed: 5 });
    }),

  /** A blocked action — locked feature, empty wallet. Falls, never scolds. */
  nope: () =>
    render(0.55, 0.42, buffer => {
      strike(buffer, 0, { freq: note('E5'), decay: 0.075, gain: 0.7, partials: [1, 0.2] });
      strike(buffer, 0.085, { freq: note('B4'), decay: 0.13, gain: 0.6, partials: [1, 0.2] });
    }),
};

mkdirSync(OUT, { recursive: true });
for (const [name, recipe] of Object.entries(RECIPES)) {
  const wav = recipe();
  writeFileSync(join(OUT, `${name}.wav`), wav);
  console.log(`${name}.wav  ${(wav.length / 1024).toFixed(1)} KB`);
}
