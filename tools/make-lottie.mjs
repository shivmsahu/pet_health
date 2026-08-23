/**
 * Generates Pawday's Lottie animation set.
 *
 * The animations are authored here as Bodymovin JSON rather than pulled from a
 * marketplace, for the same reason as the sounds: the app owns them outright,
 * they cost nothing at install time, and they can be regenerated when the
 * design system moves. Run `node tools/make-lottie.mjs`; the .json files are
 * committed so a plain `npm install` is enough.
 *
 * Every layer is named, because `lottie-react-native`'s `colorFilters` re-tints
 * by layer name — that is how one confetti file serves all six theme packs.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'lottie');
const FPS = 60;

/* ------------------------------------------------------------------ helpers */

function rgb(hex) {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
}

/** Static property. */
const fixed = k => ({ a: 0, k });

/**
 * Animated property from `[frame, value]` pairs.
 *
 * `ease` names the interpolation into each segment: `out` decelerates (things
 * arriving), `in` accelerates (things leaving), `back` overshoots and settles,
 * which is what makes a stamp feel stamped rather than faded in.
 */
function anim(stops, ease = 'out') {
  const CURVES = {
    out: { o: { x: [0.18], y: [0] }, i: { x: [0.32], y: [1] } },
    in: { o: { x: [0.68], y: [0] }, i: { x: [0.82], y: [1] } },
    inOut: { o: { x: [0.62], y: [0] }, i: { x: [0.38], y: [1] } },
    back: { o: { x: [0.2], y: [0] }, i: { x: [0.2], y: [1.6] } },
    linear: { o: { x: [0.5], y: [0] }, i: { x: [0.5], y: [1] } },
  };
  const curve = CURVES[ease];
  return {
    a: 1,
    k: stops.map(([t, s], index) =>
      index === stops.length - 1 ? { t, s: [].concat(s) } : { t, s: [].concat(s), ...curve },
    ),
  };
}

/** Shape-group transform. Lottie requires one per group, even when it is identity. */
function groupTransform({ position = [0, 0], scale = [100, 100], rotation = 0, opacity = 100 } = {}) {
  return {
    ty: 'tr',
    p: fixed(position),
    a: fixed([0, 0]),
    s: fixed(scale),
    r: fixed(rotation),
    o: fixed(opacity),
    sk: fixed(0),
    sa: fixed(0),
  };
}

const fill = hex => ({ ty: 'fl', c: fixed(rgb(hex)), o: fixed(100), r: 1, bm: 0 });
const stroke = (hex, width) => ({ ty: 'st', c: fixed(rgb(hex)), o: fixed(100), w: fixed(width), lc: 2, lj: 2, bm: 0 });

const ellipse = (size, position = [0, 0]) => ({ ty: 'el', s: fixed(size), p: fixed(position), d: 1 });
const rect = (size, roundness = 0, position = [0, 0]) => ({ ty: 'rc', s: fixed(size), p: fixed(position), r: fixed(roundness), d: 1 });

/** Closed bezier from `[x, y, inX, inY, outX, outY]` rows. */
const path = points => ({
  ty: 'sh',
  d: 1,
  ks: fixed({
    c: true,
    v: points.map(([x, y]) => [x, y]),
    i: points.map(([, , ix = 0, iy = 0]) => [ix, iy]),
    o: points.map(([, , , , ox = 0, oy = 0]) => [ox, oy]),
  }),
});

const group = (name, items, transform) => ({ ty: 'gr', nm: name, it: [...items, groupTransform(transform)], bm: 0 });

/** Shape layer. Transform properties may be static or animated. */
function layer(
  name,
  shapes,
  {
    position = [100, 100],
    scale = fixed([100, 100]),
    rotation = fixed(0),
    opacity = fixed(100),
    anchor = [0, 0],
    from = 0,
    to = 60,
  } = {},
) {
  return {
    ddd: 0,
    ind: 0,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: opacity,
      r: rotation,
      p: Array.isArray(position) ? fixed([...position, 0]) : position,
      a: fixed([...anchor, 0]),
      s: scale,
    },
    ao: 0,
    shapes,
    ip: from,
    op: to,
    st: 0,
    bm: 0,
  };
}

function composition(name, { width = 200, height = 200, frames = 60 }, layers) {
  return {
    v: '5.7.4',
    fr: FPS,
    ip: 0,
    op: frames,
    w: width,
    h: height,
    nm: name,
    ddd: 0,
    assets: [],
    layers: layers.map((item, index) => ({ ...item, ind: index + 1 })),
  };
}

/** Deterministic pseudo-random, so regenerating never churns the committed JSON. */
function random(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/* ------------------------------------------------------- shape vocabulary */

const PALETTE = {
  primary: '#f7a501',
  primaryPressed: '#dd9001',
  ink: '#23251d',
  green: '#2c8c66',
  red: '#cd4239',
  blue: '#2c84e0',
  purple: '#7c44a6',
};

/** The house paw: one pad and four toes, drawn at roughly 100x100. */
function pawShapes(color) {
  return [
    group('pad', [ellipse([50, 42], [0, 16]), fill(color)]),
    group('toe-outer-left', [ellipse([20, 25], [-32, -10]), fill(color)]),
    group('toe-inner-left', [ellipse([21, 27], [-12, -28]), fill(color)]),
    group('toe-inner-right', [ellipse([21, 27], [12, -28]), fill(color)]),
    group('toe-outer-right', [ellipse([20, 25], [32, -10]), fill(color)]),
  ];
}

const HEART = [
  [0, 40, 18, 16, -18, 16],
  [-46, -8, 8, 20, -8, -20],
  [-23, -38, 14, 0, -14, 0],
  [0, -16, 10, -8, -10, -8],
  [23, -38, 14, 0, -14, 0],
  [46, -8, 8, -20, -8, 20],
];

const FLAME = [
  [0, -46, 12, 16, -12, 16],
  [26, 6, 0, -18, 0, 18],
  [0, 44, 16, 0, -16, 0],
  [-26, 6, 0, 18, 0, -18],
];

/* ------------------------------------------------------------- animations */

/**
 * `paw-check` — plays once when a care task is ticked off.
 * A ring snaps outward and fades while the paw stamps down and settles.
 */
const pawCheck = composition('paw-check', { frames: 45 }, [
  layer('ring', [group('ring', [ellipse([100, 100]), stroke(PALETTE.green, 9)])], {
    scale: anim(
      [
        [0, [30, 30]],
        [26, [130, 130]],
      ],
      'out',
    ),
    opacity: anim(
      [
        [0, [0]],
        [5, [90]],
        [26, [0]],
      ],
      'in',
    ),
    to: 45,
  }),
  layer('paw', pawShapes(PALETTE.green), {
    scale: anim(
      [
        [2, [0, 0]],
        [16, [108, 108]],
        [24, [96, 96]],
        [30, [100, 100]],
      ],
      'back',
    ),
    rotation: anim(
      [
        [2, [-14]],
        [24, [0]],
      ],
      'back',
    ),
    opacity: anim(
      [
        [2, [0]],
        [8, [100]],
        [38, [100]],
        [45, [0]],
      ],
      'in',
    ),
    to: 45,
  }),
]);

/**
 * `confetti` — the perfect-day and level-up burst. Deliberately paper-flat
 * rectangles in the system's callout colours rather than glitter.
 */
const confetti = (() => {
  const next = random(20260824);
  const colors = [PALETTE.primary, PALETTE.green, PALETTE.blue, PALETTE.red, PALETTE.purple];
  const pieces = Array.from({ length: 22 }, (_, index) => {
    const angle = (index / 22) * Math.PI * 2 + next() * 0.5;
    const distance = 90 + next() * 70;
    const drop = 60 + next() * 90;
    const delay = Math.round(next() * 8);
    const spin = (next() > 0.5 ? 1 : -1) * (240 + next() * 360);
    const size = [6 + next() * 5, 10 + next() * 8];
    return layer(`piece-${index}`, [group('piece', [rect(size, 1), fill(colors[index % colors.length])])], {
      position: {
        a: 1,
        k: [
          { t: delay, s: [150, 150, 0], o: { x: [0.1], y: [0] }, i: { x: [0.3], y: [1] } },
          {
            t: delay + 26,
            s: [150 + Math.cos(angle) * distance, 150 + Math.sin(angle) * distance * 0.7 - 20, 0],
            o: { x: [0.4], y: [0] },
            i: { x: [0.6], y: [1] },
          },
          { t: delay + 75, s: [150 + Math.cos(angle) * distance * 1.25, 150 + Math.sin(angle) * distance * 0.7 + drop, 0] },
        ],
      },
      rotation: anim(
        [
          [delay, [next() * 360]],
          [delay + 75, [next() * 360 + spin]],
        ],
        'linear',
      ),
      opacity: anim(
        [
          [delay, [0]],
          [delay + 4, [100]],
          [delay + 55, [100]],
          [delay + 78, [0]],
        ],
        'in',
      ),
      scale: anim(
        [
          [delay, [40, 40]],
          [delay + 12, [100, 100]],
        ],
        'back',
      ),
      to: 90,
    });
  });
  return composition('confetti', { width: 300, height: 300, frames: 90 }, pieces);
})();

/** `streak-flame` — loops behind the streak count. Two flames, offset phase. */
const streakFlame = composition('streak-flame', { frames: 72 }, [
  layer('flame-outer', [group('flame', [path(FLAME), fill(PALETTE.primary)])], {
    scale: anim(
      [
        [0, [100, 100]],
        [18, [108, 94]],
        [36, [96, 108]],
        [54, [106, 98]],
        [72, [100, 100]],
      ],
      'inOut',
    ),
    rotation: anim(
      [
        [0, [0]],
        [18, [4]],
        [36, [-3]],
        [54, [3]],
        [72, [0]],
      ],
      'inOut',
    ),
    to: 72,
  }),
  layer('flame-inner', [group('flame', [path(FLAME), fill(PALETTE.red)])], {
    position: [100, 108],
    scale: anim(
      [
        [0, [56, 56]],
        [22, [50, 62]],
        [46, [60, 52]],
        [72, [56, 56]],
      ],
      'inOut',
    ),
    opacity: anim(
      [
        [0, [85]],
        [22, [65]],
        [46, [90]],
        [72, [85]],
      ],
      'inOut',
    ),
    to: 72,
  }),
]);

/** `heart-pulse` — loops on the care score. A real double-beat, not a sine. */
const heartPulse = composition('heart-pulse', { frames: 72 }, [
  layer('heart', [group('heart', [path(HEART), fill(PALETTE.red)])], {
    scale: anim(
      [
        [0, [100, 100]],
        [7, [116, 116]],
        [15, [102, 102]],
        [22, [110, 110]],
        [34, [100, 100]],
        [72, [100, 100]],
      ],
      'out',
    ),
    to: 72,
  }),
]);

/** `trophy-sparkle` — loops on the rewards header. Three stars twinkling out of phase. */
const trophySparkle = composition('trophy-sparkle', { frames: 90 }, [
  layer(
    'cup',
    [
      group('cup', [rect([56, 46], 6, [0, -10]), fill(PALETTE.primary)]),
      group('stem', [rect([16, 22], 3, [0, 20]), fill(PALETTE.primary)]),
      group('base', [rect([48, 10], 4, [0, 34]), fill(PALETTE.primary)]),
      group('handle-left', [ellipse([26, 30], [-34, -14]), stroke(PALETTE.primary, 7)]),
      group('handle-right', [ellipse([26, 30], [34, -14]), stroke(PALETTE.primary, 7)]),
    ],
    {
      position: [100, 104],
      rotation: anim(
        [
          [0, [0]],
          [22, [-4]],
          [46, [4]],
          [70, [-2]],
          [90, [0]],
        ],
        'inOut',
      ),
      to: 90,
    },
  ),
  ...[
    { name: 'sparkle-a', at: [46, 44], phase: 0 },
    { name: 'sparkle-b', at: [156, 62], phase: 30 },
    { name: 'sparkle-c', at: [140, 148], phase: 58 },
  ].map(({ name, at, phase }) =>
    layer(
      name,
      [
        group('sparkle', [
          { ty: 'sr', sy: 1, pt: fixed(4), p: fixed([0, 0]), r: fixed(0), or: fixed(13), ir: fixed(4), os: fixed(0), is: fixed(0), d: 1 },
          fill(PALETTE.primary),
        ]),
      ],
      {
        position: at,
        scale: anim(
          [
            [phase, [0, 0]],
            [phase + 12, [100, 100]],
            [phase + 28, [0, 0]],
            [90, [0, 0]],
          ],
          'out',
        ),
        rotation: anim(
          [
            [phase, [0]],
            [phase + 28, [90]],
          ],
          'out',
        ),
        to: 90,
      },
    ),
  ),
]);

/**
 * `paw-trail` — loops in empty states and on the splash. Prints walk across in
 * a left-right gait, then the whole trail fades and starts again.
 */
const pawTrail = composition(
  'paw-trail',
  { width: 300, height: 140, frames: 96 },
  Array.from({ length: 6 }, (_, index) => {
    const appear = index * 9;
    return layer(`print-${index}`, pawShapes(PALETTE.ink), {
      position: [34 + index * 46, index % 2 === 0 ? 52 : 90],
      rotation: fixed(index % 2 === 0 ? -12 : 12),
      scale: anim(
        [
          [appear, [16, 16]],
          [appear + 9, [26, 26]],
          [appear + 14, [23, 23]],
        ],
        'back',
      ),
      opacity: anim(
        [
          [appear, [0]],
          [appear + 8, [28]],
          [72, [28]],
          [90, [0]],
        ],
        'in',
      ),
      to: 96,
    });
  }),
);

/** `coin-flip` — plays on the toast when coins are claimed. */
const coinFlip = composition('coin-flip', { frames: 54 }, [
  layer(
    'coin',
    [group('disc', [ellipse([96, 96]), fill(PALETTE.primary)]), group('rim', [ellipse([76, 76]), stroke(PALETTE.primaryPressed, 6)])],
    {
      scale: anim(
        [
          [0, [10, 96]],
          [10, [96, 96]],
          [20, [12, 96]],
          [30, [96, 96]],
          [40, [30, 96]],
          [50, [96, 96]],
        ],
        'inOut',
      ),
      position: {
        a: 1,
        k: [
          { t: 0, s: [100, 130, 0], o: { x: [0.1], y: [0] }, i: { x: [0.3], y: [1] } },
          { t: 26, s: [100, 78, 0], o: { x: [0.6], y: [0] }, i: { x: [0.4], y: [1] } },
          { t: 50, s: [100, 100, 0] },
        ],
      },
      opacity: anim(
        [
          [0, [0]],
          [6, [100]],
          [48, [100]],
          [54, [0]],
        ],
        'in',
      ),
      to: 54,
    },
  ),
]);

/* ------------------------------------------------------------------ output */

const FILES = {
  'paw-check': pawCheck,
  confetti,
  'streak-flame': streakFlame,
  'heart-pulse': heartPulse,
  'trophy-sparkle': trophySparkle,
  'paw-trail': pawTrail,
  'coin-flip': coinFlip,
};

mkdirSync(OUT, { recursive: true });
for (const [name, data] of Object.entries(FILES)) {
  const json = `${JSON.stringify(data)}\n`;
  writeFileSync(join(OUT, `${name}.json`), json);
  console.log(`${name}.json  ${(json.length / 1024).toFixed(1)} KB  ${data.layers.length} layers  ${(data.op / FPS).toFixed(2)}s`);
}
