# Pawday 🐾

A local-first React Native app that turns everyday pet care into a habit you actually keep — meals,
medicine, walks, vet dates and memories, wrapped in a streak-and-quest game loop.

No account. No cloud. No ads. Everything lives on the device.

## Run locally

```bash
npm install
npm run web        # or npm run ios / npm run android
npm test           # domain, gating, gamification and migration tests
npm run typecheck
```

## What's in the app

**First run** — no demo data anywhere. A four-step onboarding asks what kind of companion you have, then
suggests a species-appropriate starter routine (walks for dogs, litter for cats, hay for rabbits, water
tests for fish) that you tick through and edit. A five-card tutorial follows, replayable from settings.

**Today** — pet card with a care score, level and XP bar, three rotating daily quests, an "up next" nudge,
today's task list, a seven-day completion chart and contextual tips derived from your own data
("Evening walk keeps slipping — only 40% this fortnight").

**Routine** — a week strip, the full reminder list, and suggestions for common tasks you have not added yet.
Long-press any task to edit, pause or remove it. Local notifications for every recurrence type.

**Health** — weight history with a chart and unit conversion, vaccinations with due/overdue badges, vet
visit records, a symptom log, a spending breakdown and one-tap vet dialling.

**Moments** — a photo scrapbook with moods, mood filtering and "on this day" resurfacing.

**Rewards** — 20 levels, a paw-coin economy, a weekly challenge, streak freezes, a 12-sticker collectible
album, tiered awards and care insights.

Six theme packs (including Night Olive dark mode), kg/lb and currency settings, a shareable sitter care
card, and a full JSON backup export.

### Gamification, honestly

XP is **derived** from care that still exists in the data rather than incremented on a counter — so it can
never be farmed by toggling a task on and off, and deleting a record takes its XP with it. The streak
multiplier (up to 2x) applies to quest and check-in rewards, so a level never goes backwards.

### Design system

The UI implements [DESIGN.md](./DESIGN.md): a warm cream canvas (`#eeefe9`) end to end, olive ink, IBM Plex
Sans across every text role, white cards with 1px olive hairlines and **no drop shadows**, a 4-8px radius
vocabulary, and exactly one saturated accent carrying primary actions. Tips and warnings use the four-colour
callout family. `src/theme.ts` holds the tokens and `type()` resolves every text role, so hierarchy comes
from weight and size rather than colour. Theme packs vary only the accent hue; Night Olive is the single
inverted pack.

## Free vs Pro

The rule: **looking after your pet is never behind a paywall.** Free is a complete daily tracker for one
pet. Pro sells depth, scale and delight.

| | Free | Pro |
|---|---|---|
| Pets | 1 | Unlimited |
| Reminders per pet | 6 | Unlimited |
| Notifications, streaks, quests, XP, awards | ✅ | ✅ |
| Scrapbook moments | 20 | Unlimited |
| Weigh-ins / vaccinations | 8 / 3 | Unlimited |
| Vet visits, symptoms, spending, insights | — | ✅ |
| Theme packs | 1 | 6 |
| Sitter care card, backup export | — | ✅ |

Gating lives in one place — `canAdd()` in [`src/pro.ts`](./src/pro.ts) — so every call site behaves the same
and opens the same upgrade sheet.

**Pricing:** $4.99/mo, **$29.99/yr with a 7-day trial (default)**, $69.99 lifetime. The reasoning behind
subscription-first-with-a-lifetime-anchor is in [MARKETING.md](./MARKETING.md).

> The paywall records the entitlement locally for development. Wire it to StoreKit / Play Billing before
> shipping — `startPro()` in `src/AppContext.tsx` is the single integration point.

## Layout

```
App.tsx                  shell: tabs, header, coach marks, sheet wiring
src/domain.ts            types, date logic, recurrence, streaks, insights
src/game.ts              XP, levels, quests, weekly challenge, stickers, awards
src/pro.ts               tier limits, feature gates, plan catalogue
src/suggestions.ts       species starter packs, contextual tips, tutorial copy
src/theme.ts             DESIGN.md tokens: palettes, radii, spacing, type scale
src/fonts.ts             IBM Plex Sans binaries (kept out of the token layer)
src/storage.ts           persistence, v1→v2 migration, export/import
src/AppContext.tsx       state, actions, notifications, gating, toasts
src/ui.tsx               shared components (cards, callouts, buttons, sheets)
src/screens/             Onboarding, Home, Schedule, Health, Journal, Rewards, Paywall, Forms, Settings
landing/index.html       marketing landing page (standalone, deployable anywhere)
DESIGN.md                the visual system this UI implements
MARKETING.md             positioning, ICP, pricing rationale, channels, launch plan
PRD.md                   original product requirements
```

Existing v1 installs migrate automatically: pets, reminders and memories carry over, gain the new fields,
and skip onboarding.
