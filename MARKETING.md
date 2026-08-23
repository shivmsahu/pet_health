# Pawday — Marketing & Monetization Strategy

_Last updated: 2026-08-24_

---

## 1. The one-line positioning

> **Pawday is the daily habit tracker for pet parents — it turns feeding, meds and walks into a streak you actually want to keep, and quietly becomes the health record your vet wishes you had.**

Three things that sentence is doing deliberately:

- **"Habit tracker" not "pet manager."** Pet-management apps are a graveyard of low-retention utilities. Habit apps (Duolingo, Streaks, Finch) have proven daily-open loops. We are selling a *daily* product, not a *filing cabinet*.
- **Character** is the wedge. The category is dominated by clinical, grey, form-heavy apps. Pawday is warm cream, hand-drawn pet mascots and one confident yellow button (see DESIGN.md) — friendly without being childish, which widens the audience past the pastel-cute segment. Aesthetic is a genuine differentiator and the most screenshot-able asset we own.
- **"The health record your vet wishes you had"** is the upgrade trigger, mentioned second because it sells Pro but does not sell the download.

### Category framing

| Frame | Downloads | Retention | Willingness to pay |
|---|---|---|---|
| Pet health record | Low (searched only in a crisis) | Poor | High |
| Pet reminder app | Medium | Medium | Low |
| **Characterful pet care game + habit tracker** | **High** | **High** | **Medium-high once hooked** |

We acquire on the third frame and monetize on the first.

---

## 2. Who we are actually selling to

### Primary: "The Anxious New Owner" (~55% of revenue)
- 22–38, got a puppy/kitten in the last 12 months, often first pet as an adult.
- Emotional state: *"Am I doing this right? Did I already give her the tablet?"*
- Buys because Pro removes a specific anxiety (vaccination due dates, weight tracking, "what did the vet say last time").
- Found via: TikTok/Reels, Reddit (r/puppy101, r/CatAdvice), breeder & shelter hand-off packs.

### Secondary: "The Multi-Pet Household" (~25%)
- Two to five animals, a partner or family sharing the load, genuine coordination pain.
- Hits the free 1-pet ceiling **on day one** — the highest-intent upgrade segment we have.
- Found via: App Store search ("multiple pets app"), Facebook breed groups.

### Tertiary: "The Chronic-Condition Carer" (~15%)
- Diabetic cat, epileptic dog, senior pet on four medications.
- Highest LTV, lowest churn, most likely to buy Lifetime. Symptom log + vet-visit history is life-critical for them.
- Found via: condition-specific Facebook groups, vet clinic referrals.

### Quaternary: "The Aesthetic Collector" (~5%)
- Buys Pro largely for Night Olive dark mode + the sticker album. Do not underestimate this segment — it is the same money.

**Anti-persona:** professional groomers, breeders, rescues. They need multi-user, invoicing and CRM. Saying no keeps the product simple.

---

## 3. Free vs Pro — and why the line sits where it does

### The rule
> **Looking after your pet is never behind a paywall. Depth, delight and scale are.**

If a free user ever feels that their pet suffered because they did not pay, we have made a bad product and earned bad reviews. Every gate below is a *ceiling on scope*, never a *hole in care*.

### The split as shipped

| | Free | Pro |
|---|---|---|
| Pets | 1 | Unlimited |
| Daily reminders | 6 per pet | Unlimited |
| Notifications | ✅ | ✅ |
| Streaks, XP, levels, daily quests | ✅ | ✅ |
| Awards & stickers | Core set | Full album + gold shelf |
| Scrapbook moments | 20 | Unlimited |
| Weigh-ins | 8 | Unlimited + full chart |
| Vaccination tracking | 3 | Unlimited |
| Vet visit history | — | ✅ |
| Symptom log | — | ✅ |
| Spending tracker | — | ✅ |
| Care insights & trends | — | ✅ |
| Theme packs (incl. dark) | 1 | 6 |
| Sitter care card | — | ✅ |
| Backup & export | — | ✅ |
| Streak freezes | Earn with coins | +2 on upgrade, earn with coins |

### Why these specific gates convert

1. **Multi-pet is the sharpest gate.** It is binary, obvious, unarguable and hits on day one for 25% of users. No one feels cheated by it — they can see the second pet slot exists.
2. **Six reminders is deliberately generous.** Most single-pet routines fit in six. The users who exceed it have *proven* the habit stuck — which is exactly when a paywall converts instead of churning.
3. **Health vault is the emotional gate.** It converts at the moment of highest willingness-to-pay: a vet appointment, a scare, a booster reminder. That moment is unpredictable, so the vault must be *visible but locked* at all times, not hidden.
4. **Themes convert the segment that will never care about vet records.** Cheap to build, pure margin, and it makes the paywall screenshot pretty — which matters, because users screenshot paywalls.
5. **Insights are the retention gate.** They only become valuable after ~2 weeks of data, so they convert *engaged* users — the best kind.

### What we will NOT do
- No ads. Ever. They would wreck the calm, uncluttered canvas that is our whole wedge.
- No gating notifications, streaks or basic reminders. That is the care itself.
- No selling or syncing pet data. "Everything stays on your device" is a marketing asset, not just an engineering choice.
- No dark-pattern trial (no surprise auto-charge without a clear reminder screen).

---

## 4. Subscription vs one-time — the recommendation

### Recommendation: **subscription-first, with a Lifetime option as a price anchor and a segment-capture tool.**

**Ship all three:**

| Plan | Price | Role |
|---|---|---|
| Monthly | **$4.99** | Decoy. Makes yearly look obvious. Expect <10% of buyers. |
| **Yearly** | **$29.99** (7-day free trial) | **The default, pre-selected. Target 65–75% of purchases.** |
| Lifetime | **$69.99** | Anchor + capture the subscription-averse. Expect 15–25% of purchases, ~35% of day-one revenue. |

### Why subscription is right here, despite the app being local-first

The instinct with a no-server app is "one-time payment, no ongoing costs." That instinct is wrong for **this** product, for four reasons:

1. **The usage pattern is genuinely recurring.** Pet care is a 10–15 year daily commitment. Unlike a one-shot utility (a PDF converter, a photo filter), the user's need does not end after purchase — so recurring payment is honestly aligned with recurring value. Subscription is only resented when value is one-shot.
2. **LTV math is not close.**
   - Lifetime-only: **$69.99** per buyer, ever.
   - Yearly at $29.99 with a realistic 55% year-1 → year-2 renewal and 70% thereafter: ~$30 + $16.5 + $11.6 + $8.1 ≈ **$66 over four years, and still paying.** Roughly **$85–95 over the realistic 6–8 year pet-ownership window.**
   - Yearly wins outright over any horizon longer than ~2.5 years, and pet ownership vastly exceeds that.
3. **It funds the roadmap.** Vet integrations, cloud backup, family sharing and iPad support are all things users will ask for. A lifetime-only base makes every future feature a cost centre and pushes you toward the "Pawday 2 — buy it again" trap that users hate.
4. **The free trial is the single biggest conversion lever available**, and trials only exist on subscriptions. Expect the trial to roughly **double** paywall-view → purchase versus a hard paywall.

### Why include Lifetime at all, then?

- **Anchoring.** $69.99 sitting beside $29.99/yr makes the yearly plan read as the sensible choice. Removing it typically *lowers* yearly conversion.
- **Segment capture.** A meaningful minority will not subscribe to anything on principle. Without Lifetime they contribute $0; with it they contribute $70 today. Cash today at a young app's stage is worth more than modelled LTV.
- **Review sentiment.** "At least there's a one-time option" defuses the most common 1-star complaint in this category.

**Price Lifetime at 2.0–2.5× the annual.** Below 2× it cannibalizes subscriptions; above 3× it stops functioning as a believable anchor. $69.99 / $29.99 = 2.33×. Correct.

### Rules of engagement

- **Yearly is pre-selected** on the paywall (already implemented).
- **Trial reminder on day 5** via local notification: _"Your Pawday Pro trial ends in 2 days."_ This costs a little conversion and buys a lot of goodwill and far fewer refund requests and 1-stars.
- **Never** run a Lifetime discount in the first six months — it trains users to wait for sales and torpedoes subscription conversion.
- **Regional pricing on day one.** India, Brazil, Turkey, Indonesia, Mexico, SEA at 30–50% of US price. These markets have enormous pet-app volume and near-zero conversion at US prices.
- Revisit in 12 months: if renewal comes in above 60%, consider quietly retiring Lifetime for new users.

### The honest counter-case
If Pawday stays permanently local-only with no roadmap and no ongoing costs, a **one-time $24.99 "Pro forever"** would convert at perhaps 1.6–2× the rate of a subscription and generate excellent reviews. It is a legitimate strategy for a hobby project. It is the wrong strategy for a business, because it caps revenue at (installs × conversion × $25) with no compounding, and leaves nothing to fund growth. **Subscription-first is the recommendation; take the one-time route only if you have decided Pawday is finished.**

---

## 5. The conversion funnel

```
App Store listing ─► Install ─► Onboarding (pet + starter routine) ─► First task ticked
      │                                                                     │
      │                                                              Day 1–3: habit forms
      │                                                                     │
      │                                                        Streak + quests + level-ups
      │                                                                     │
      └──────────────► Paywall trigger ◄────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬────────────────────┐
   2nd pet            7th reminder        Health vault tap      Theme picker
   (day 0–1)           (day 3–10)          (day 5–30)            (day 1–3)
```

### Target metrics (mobile pet/habit category benchmarks)

| Metric | Floor | Target | Great |
|---|---|---|---|
| Store page → install | 25% | 35% | 45% |
| Install → onboarding complete | 65% | 80% | 88% |
| D1 retention | 30% | 42% | 55% |
| D7 retention | 14% | 22% | 30% |
| D30 retention | 6% | 11% | 18% |
| Paywall view → trial start | 8% | 14% | 22% |
| Trial → paid | 35% | 50% | 62% |
| Install → paying (overall) | 1.5% | 3% | 5% |

**The single most leveraged number is D7 retention.** Everything in the gamification layer exists to move it. A user who reaches day 7 with an intact streak converts at roughly 4× the rate of one who does not.

### Paywall placement rules
- **Never** on first launch. It kills D1 and produces "wants money immediately" reviews.
- Trigger on genuine friction (the four triggers above), and once as a soft card on Home after the user has built 4+ reminders — i.e. after they have proven the habit.
- Always show what stays free. The paywall already does this; it measurably reduces uninstalls from the paywall screen.

---

## 6. App Store Optimization

### Title & subtitle
- **Title:** `Pawday: Pet Care & Reminders` (30 char limit — fits)
- **Subtitle:** `Daily care tracker for pets` (30 char)
- **Google Play short description:** `Feeding, meds & walks — with streaks, quests and a health record your vet will love.`

### Keyword targets

| Tier | Keywords |
|---|---|
| High volume, high competition | pet care, dog app, cat app, pet tracker, pet reminder |
| Mid — our sweet spot | puppy schedule, pet medication reminder, dog feeding tracker, pet health record, cat care app, multiple pets |
| Long tail — cheap wins | puppy vaccination tracker, dog weight tracker, pet sitter notes, senior dog medication, kitten daily routine |
| Aesthetic pull | cute pet app, pet diary, pet journal, pet scrapbook (kept: these are what users still search) |

### Screenshot order (this order is the ad)
1. **Home with a 12-day streak, a level badge and the pet card** — caption: _"Care that feels like a game"_
2. **Daily quests, half-claimed** — _"Three quests every morning"_
3. **Health vault with a vaccination due badge** — _"Never miss a booster again"_
4. **The six theme packs side by side** — _"Six palettes, including dark mode"_
5. **Scrapbook grid full of photos** — _"A scrapbook of the good days"_
6. **Onboarding species picker** — _"Set up in under a minute"_

### App preview video (15–20s)
Pick species → starter routine appears → tick a task → XP burst and streak flame → cut to health vault → cut to theme swap. No voiceover; text captions only, because 80%+ watch silently.

---

## 7. Acquisition channels, in priority order

### 1. Short-form video (TikTok / Reels / Shorts) — the main engine
The category is *made* for this: pets are the highest-performing content vertical on earth, and the app is visually distinctive on a small screen.

**Formats that work:**
- **"POV: your dog's daily routine"** — screen recording set to trending audio, pet cameo at the end. Cheapest, highest hit rate.
- **"Things I wish I knew as a first-time puppy owner"** — value first, app appears at tip #4 of 5. Never lead with the app.
- **Streak flex** — _"Day 60 of not missing a single walk"_. Aspirational, drives the exact behaviour we want.
- **Aesthetic ASMR** — silent screen-record of theme swapping and sticker unlocking. Bafflingly effective with the collector segment.
- **The vet moment** — _"My vet asked when her last booster was and I just... had it."_ This is the single best Pro-conversion story.

**Cadence:** 4–6 posts/week for 90 days before judging anything. Expect 1 in 20 to break out; the breakouts carry the whole channel.

### 2. Reddit & forums (high intent, needs a light touch)
- r/puppy101, r/dogs, r/CatAdvice, r/PetAdvice, r/DogTraining, breed subs, r/diabeticcats.
- **Never post an ad.** Answer routine/schedule questions genuinely; mention the app only when someone asks what people use. One useful comment beats fifty spam posts and a ban.
- Build a genuinely free artefact — a printable "New Puppy First 30 Days" checklist — and let it circulate with the app named on the footer.

### 3. Shelters, rescues & breeders (highest quality, slowest)
Every adopted pet is a brand-new owner at maximum anxiety on the same day.
- Offer shelters a free "3 months of Pro" promo code sheet for adopters. Costs nothing (marginal cost is zero), buys enormous goodwill and word-of-mouth.
- A small printed card in the adoption pack outperforms most paid channels on cost-per-install.

### 4. Vet clinic partnerships (Pro-heavy)
- Waiting-room card: _"Track boosters, weight and symptoms — free app."_
- Offer clinics a co-branded care card export. The sitter care card is already built and is genuinely useful to them.

### 5. Creator seeding
- Micro-creators (10k–100k) in the pet niche outperform macro on cost per install, decisively.
- Offer: free Lifetime + a modest flat fee + an affiliate code. Target 20 creators/quarter; expect 3 to actually move numbers.

### 6. Paid — only after organic proves the funnel
Do not spend a dollar until D7 retention clears 20% and trial→paid clears 40%. Then:
- **Apple Search Ads** on competitor and long-tail brand terms first — cheapest intent on the internet.
- **TikTok Spark Ads** boosting your own organic winners. Never boost a cold creative; boost proven ones.
- Target blended CAC under **$3.50** against a ~$45 blended LTV (mix of yearly + lifetime).

---

## 8. Retention & the gamification loop

The whole game layer is a retention mechanism. Each piece maps to a specific behaviour:

| Mechanic | Behaviour it drives | Notes |
|---|---|---|
| Daily quests (3, rotating) | Opens the app in the morning | Fresh at midnight so there is always a reason to look |
| Streak + up-to-2× multiplier | Consistency; loss aversion | The most powerful retention mechanic in existence |
| Streak freeze (earned with coins) | Prevents rage-quit after a missed day | Critical: a broken streak is the #1 churn moment. Duolingo's data on this is unambiguous |
| XP derived from real care | Honesty; prevents farming | XP cannot be gamed by toggling tasks — protects the fiction |
| Levels with silly titles | Long-horizon goal | "Belly Rub Rookie" → "Best Friend Forever" |
| Weekly challenge | Weekend re-engagement | 5 perfect days; big payout |
| Sticker album | Collection compulsion | Locked stickers show a hint — the tease is the mechanic |
| Paw coins | Soft currency, gives quests a point | Spent on freezes |
| Care score | Single glanceable number | Reduces "am I doing enough?" anxiety |
| "On this day" memories | Emotional re-engagement | The single highest-sentiment surface in the app |

### Lifecycle notifications (local, no server needed)
| When | Message |
|---|---|
| Task time | _"Mochi 🐾 — Evening walk"_ |
| 19:00 if day incomplete | _"2 things left for Mochi today — your 12-day streak is on the line 🔥"_ |
| Streak broken yesterday | _"Streaks end. Care doesn't. Start a new one today 🌱"_ (never guilt-trip) |
| Day 5 of trial | _"Your Pro trial ends in 2 days"_ |
| Vaccination due in 7 days | _"Rabies booster due next week 💉"_ |
| Pet's birthday | _"It's Mochi's birthday! 🎂 Save a photo?"_ |
| Dormant 7 days | _"Mochi's page is waiting. Just one tap to start again."_ |

Cap at **two** non-task notifications per day. Over-notifying is the fastest route to a disabled-notifications user, and a user with notifications off is a churned user who has not left yet.

---

## 9. Launch plan

### Phase 0 — Pre-launch (4 weeks)
- 30 TikToks banked before launch day. Post 5/week starting 2 weeks out to warm the algorithm.
- 20 beta testers from Reddit and local shelters; fix the top 5 complaints.
- Store listing, screenshots and preview video finalised.
- Seed a "Pawday" hashtag and post the printable puppy checklist.

### Phase 1 — Soft launch (weeks 1–4)
- Ship to Canada, Australia, NZ, Ireland first. English-speaking, similar behaviour, low PR risk.
- Watch only: onboarding completion, D1, D7, crash rate. Ignore revenue entirely.
- Iterate the onboarding until completion clears 80%.

### Phase 2 — Full launch (weeks 5–12)
- Global release + regional pricing.
- Pitch Product Hunt, Reddit r/apple "app of the week" threads, and 3–5 pet blogs.
- Ask for the review **after** the first perfect week (a happy, invested moment) — never after a paywall.
- Begin creator seeding.

### Phase 3 — Scale (month 4+)
- Turn on Apple Search Ads once retention gates are met.
- Ship the most-requested feature (probably family sharing or cloud backup) as a Pro headline.
- Run the first pricing test: $29.99 vs $34.99 yearly.

---

## 10. Ad copy bank

**App Store promo text**
> Feeding, meds, walks and vet dates — all in one calm place. Build a streak, level up, and keep a health record your vet will actually thank you for.

**TikTok hooks**
- "Nobody told me a puppy needs *this* many things per day."
- "Day 47 of not missing a single one of her meals."
- "My vet asked when her last booster was. I just... knew."
- "I made pet care into a video game and now I never forget anything."
- "Rating pet care apps by how much they actually help (#1 will surprise you)."

**Apple Search Ads**
- _Never miss a meal, med or booster. Free, private, works offline._
- _Two pets? Five? Pawday keeps every routine straight._

**Shelter/vet card**
> **New pet? Start on the right paw.**
> Pawday keeps feeding, meds and vaccinations on track — free, private, no account needed.

---

## 11. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Category is crowded and cheap | High | Compete on aesthetic + game loop, not features. Do not enter a feature war |
| Local-only blocks family sharing | Medium | It is currently a privacy *asset*; build optional encrypted sync as a Pro headline when demanded |
| Trial abuse / low trial→paid | Medium | Day-5 reminder, and make the trial genuinely feel like Pro rather than a crippled preview |
| Gamification reads as trivialising real care | Low-Medium | Never gamify medical decisions; keep symptom/vet surfaces sober and un-gamified. This line already exists in the UI |
| Streak loss causes churn | High | Streak freezes exist and are cheap. Never shame a user for a break |
| Apple rejects for medical claims | Low | Never claim diagnosis or treatment. "Record keeping" language only |

---

## 12. The 90-day scoreboard

| | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| Installs | 2,000 | 8,000 | 25,000 |
| D7 retention | 16% | 20% | 24% |
| Paying users | 40 | 220 | 800 |
| MRR (incl. amortised lifetime) | $150 | $800 | $3,000 |
| Store rating | 4.5+ | 4.6+ | 4.7+ |

If D7 retention is below 15% at day 60, **stop all acquisition spend and fix the product.** Pouring traffic into a leaky funnel is the most common and most expensive mistake at this stage.
