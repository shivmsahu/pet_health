/**
 * Pawday design tokens, implementing DESIGN.md.
 *
 * The system is a warm cream canvas with olive ink, IBM Plex Sans across every
 * text role, hairline-bordered white cards with no drop shadows, a 4-8px radius
 * vocabulary, and exactly one saturated accent carrying primary actions.
 *
 * Theme packs (a Pro perk) vary only the accent hue and, for Night, invert the
 * surface stack. The cream chassis and the "one loud colour" rule hold in all
 * of them.
 */

import { TextStyle } from 'react-native';

export type ThemeId = 'classic-cream' | 'teal-ink' | 'coral-ink' | 'violet-ink' | 'forest-ink' | 'night-olive';

export type Palette = {
  id: ThemeId;
  name: string;
  emoji: string;
  pro: boolean;
  dark: boolean;

  /* surface */
  canvas: string;
  surfaceSoft: string;
  surfaceCard: string;
  surfaceDoc: string;
  surfaceDark: string;
  hairline: string;
  hairlineSoft: string;
  onDark: string;

  /* text */
  ink: string;
  body: string;
  charcoal: string;
  mute: string;
  ash: string;
  stone: string;

  /* the single saturated action colour */
  primary: string;
  primaryPressed: string;
  onPrimary: string;

  /* semantic — callout banners and data marks only, never CTAs */
  linkTeal: string;
  accentBlue: string;
  accentBlueSoft: string;
  accentRed: string;
  accentRedSoft: string;
  accentGreen: string;
  accentGreenSoft: string;
  accentPurple: string;
  accentPurpleSoft: string;
  focusRing: string;
};

const LIGHT_CHASSIS = {
  canvas: '#eeefe9',
  surfaceSoft: '#e5e7e0',
  surfaceCard: '#ffffff',
  surfaceDoc: '#fcfcfa',
  surfaceDark: '#23251d',
  hairline: '#bfc1b7',
  hairlineSoft: '#dcdfd2',
  onDark: '#ffffff',
  ink: '#23251d',
  body: '#4d4f46',
  charcoal: '#33342d',
  mute: '#6c6e63',
  ash: '#9b9c92',
  stone: '#b6b7af',
  linkTeal: '#1078a3',
  accentBlue: '#2c84e0',
  accentBlueSoft: '#dceaf6',
  accentRed: '#cd4239',
  accentRedSoft: '#f7d6d3',
  accentGreen: '#2c8c66',
  accentGreenSoft: '#d9eddf',
  accentPurple: '#7c44a6',
  accentPurpleSoft: '#e7d8ee',
  focusRing: 'rgba(59,130,246,0.5)',
  dark: false,
};

export const THEMES: Palette[] = [
  {
    id: 'classic-cream',
    name: 'Classic Cream',
    emoji: '\u{1F43E}',
    pro: false,
    ...LIGHT_CHASSIS,
    primary: '#f7a501',
    primaryPressed: '#dd9001',
    onPrimary: '#23251d',
  },
  {
    id: 'teal-ink',
    name: 'Teal Ink',
    emoji: '\u{1F30A}',
    pro: true,
    ...LIGHT_CHASSIS,
    primary: '#1d9c9c',
    primaryPressed: '#178383',
    onPrimary: '#ffffff',
  },
  {
    id: 'coral-ink',
    name: 'Coral Ink',
    emoji: '\u{1F33A}',
    pro: true,
    ...LIGHT_CHASSIS,
    primary: '#e2603f',
    primaryPressed: '#c34f31',
    onPrimary: '#ffffff',
  },
  {
    id: 'violet-ink',
    name: 'Violet Ink',
    emoji: '\u{1F52E}',
    pro: true,
    ...LIGHT_CHASSIS,
    primary: '#7c44a6',
    primaryPressed: '#68388c',
    onPrimary: '#ffffff',
  },
  {
    id: 'forest-ink',
    name: 'Forest Ink',
    emoji: '\u{1F332}',
    pro: true,
    ...LIGHT_CHASSIS,
    primary: '#2c8c66',
    primaryPressed: '#237253',
    onPrimary: '#ffffff',
  },
  {
    // The one inverted pack: the olive-charcoal that carries ink elsewhere is
    // used as the canvas, mirroring the system's dark code-block surface.
    id: 'night-olive',
    name: 'Night Olive',
    emoji: '\u{1F319}',
    pro: true,
    dark: true,
    canvas: '#1b1d17',
    surfaceSoft: '#2b2d25',
    surfaceCard: '#23251d',
    surfaceDoc: '#26281f',
    surfaceDark: '#12130f',
    hairline: '#3c3f34',
    hairlineSoft: '#31342b',
    onDark: '#ffffff',
    ink: '#f2f3ec',
    body: '#c4c6ba',
    charcoal: '#dedfd5',
    mute: '#9b9c92',
    ash: '#75776d',
    stone: '#5d5f56',
    linkTeal: '#5cb6d8',
    accentBlue: '#6aa9e8',
    accentBlueSoft: '#25313d',
    accentRed: '#e0685e',
    accentRedSoft: '#3a2724',
    accentGreen: '#5cb98f',
    accentGreenSoft: '#22332b',
    accentPurple: '#ab7ecd',
    accentPurpleSoft: '#302639',
    focusRing: 'rgba(108,166,246,0.55)',
    primary: '#f7a501',
    primaryPressed: '#dd9001',
    onPrimary: '#23251d',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'classic-cream';

export function paletteFor(id: ThemeId | undefined): Palette {
  return THEMES.find(theme => theme.id === id) ?? THEMES[0];
}

/* ------------------------------------------------------------------ shape */

/** DESIGN.md radius scale — the vocabulary clusters at 4-6px. */
export const radius = { none: 0, xs: 2, sm: 4, md: 6, lg: 8, xl: 12, pill: 9999 };

/** 8px base with finer inline steps; `section` is the vertical page rhythm. */
export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 48 };

/**
 * The system has no drop-shadow elevation: cards sit flat on cream with thin
 * olive borders. Kept as a named no-op so call sites read intentionally.
 */
export const flat = {} as const;

/* -------------------------------------------------------------- typography */

/**
 * React Native picks a font file per weight rather than synthesising one, so
 * every weight maps to its own family name.
 *
 * IBM Plex Sans ships 400-700; DESIGN.md's weight-800 display role resolves to
 * Bold, which is the heaviest cut the family has.
 */
export const FONT_FAMILIES = {
  400: 'IBMPlexSans_400Regular',
  500: 'IBMPlexSans_500Medium',
  600: 'IBMPlexSans_600SemiBold',
  700: 'IBMPlexSans_700Bold',
} as const;

export type FontWeightKey = keyof typeof FONT_FAMILIES;

export type TypeToken =
  | 'displayXl'
  | 'displayLg'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'headingSmMixed'
  | 'bodyMd'
  | 'bodyStrong'
  | 'bodySm'
  | 'bodySmStrong'
  | 'bodyXs'
  | 'captionMd'
  | 'captionSm'
  | 'captionXs'
  | 'utilityXs'
  | 'buttonMd'
  | 'buttonSm';

type Spec = { size: number; weight: FontWeightKey; line: number; tracking?: number; upper?: boolean };

const SPECS: Record<TypeToken, Spec> = {
  displayXl: { size: 30, weight: 700, line: 1.2, tracking: -0.6 },
  displayLg: { size: 24, weight: 700, line: 1.33, tracking: -0.6 },
  headingLg: { size: 21, weight: 700, line: 1.4, tracking: -0.5 },
  headingMd: { size: 20, weight: 700, line: 1.4 },
  headingSm: { size: 15, weight: 700, line: 1.5, upper: true },
  headingSmMixed: { size: 17, weight: 600, line: 1.4 },
  bodyMd: { size: 16, weight: 400, line: 1.5 },
  bodyStrong: { size: 16, weight: 600, line: 1.5 },
  bodySm: { size: 15, weight: 400, line: 1.55 },
  bodySmStrong: { size: 15, weight: 600, line: 1.55 },
  bodyXs: { size: 14, weight: 500, line: 1.43 },
  captionMd: { size: 14, weight: 700, line: 1.5 },
  captionSm: { size: 13, weight: 500, line: 1.5 },
  // Mixed-case: uppercase stays reserved for `headingSm` and `utilityXs`, so
  // metadata captions are not shouted.
  captionXs: { size: 12, weight: 600, line: 1.33 },
  utilityXs: { size: 12, weight: 700, line: 1.33, tracking: 0.6, upper: true },
  buttonMd: { size: 14, weight: 700, line: 1.5 },
  buttonSm: { size: 13, weight: 500, line: 1.2 },
};

/**
 * Resolve a type token to a style. Hierarchy comes from weight and size, never
 * colour — pass the colour separately from the palette.
 */
export function type(token: TypeToken, color?: string): TextStyle {
  const spec = SPECS[token];
  return {
    fontFamily: FONT_FAMILIES[spec.weight],
    fontSize: spec.size,
    lineHeight: Math.round(spec.size * spec.line),
    letterSpacing: spec.tracking,
    textTransform: spec.upper ? 'uppercase' : undefined,
    color,
  };
}
